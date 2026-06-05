"""
Embedding 客户端 — 阿里云百炼 / OpenAI 兼容协议

提供文本向量化 + pgvector 相似度检索 + 本地限流器。

用法:
    from core.embeddings import embed, search_similar

    vec = await embed("要检索的文本")
    results = await search_similar(db, vec, limit=5)
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

import anyio
from openai import OpenAI
from sqlalchemy import text
from sqlalchemy.orm import Session
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from core.config import settings

logger = logging.getLogger("embeddings")

# ═══════════════════════════════════════════════════════════════
# OpenAI 兼容客户端
# ═══════════════════════════════════════════════════════════════

_client: OpenAI | None = None
_client_ready: bool = False


def _get_client() -> OpenAI:
    global _client, _client_ready
    if _client is None:
        if not settings.EMBEDDING_API_KEY:
            _client_ready = False
            raise RuntimeError("EMBEDDING_API_KEY 未配置，无法调用 Embedding API。")
        _client = OpenAI(
            api_key=settings.EMBEDDING_API_KEY,
            base_url=settings.EMBEDDING_API_BASE_URL,
        )
        _client_ready = True
        logger.info(
            "Embedding 客户端已初始化: model=%s base=%s",
            settings.EMBEDDING_MODEL,
            settings.EMBEDDING_API_BASE_URL,
        )
    return _client


def is_ready() -> bool:
    """检查 embedding 客户端是否可用。"""
    try:
        _get_client()
        return _client_ready
    except RuntimeError:
        return False


# ═══════════════════════════════════════════════════════════════
# 本地令牌桶限流器
# ═══════════════════════════════════════════════════════════════

class _EmbeddingRateLimiter:
    """限制对嵌入 API 的并发调用数量和 QPS。

    - max_concurrent: 最大同时在途请求数
    - max_qps: 每秒最大调用次数
    """

    def __init__(self, max_concurrent: int = 3, max_qps: float = 5.0):
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._min_interval = 1.0 / max_qps
        self._last_call = 0.0

    async def acquire(self) -> None:
        await self._semaphore.acquire()
        elapsed = time.monotonic() - self._last_call
        if elapsed < self._min_interval:
            await asyncio.sleep(self._min_interval - elapsed)
        self._last_call = time.monotonic()

    def release(self) -> None:
        self._semaphore.release()


_limiter = _EmbeddingRateLimiter(max_concurrent=3, max_qps=5)


# ═══════════════════════════════════════════════════════════════
# 嵌入 API 调用（带重试 + 限流）
# ═══════════════════════════════════════════════════════════════

@retry(
    retry=retry_if_exception_type(
        (Exception,)
    ),  # 网络波动 / 429 限流均重试
    wait=wait_exponential(multiplier=1, min=1, max=30),
    stop=stop_after_attempt(3),
    reraise=True,
)
def _call_embedding_sync(texts: list[str]) -> list[list[float]]:
    """同步调用嵌入 API（在 thread pool 中执行）。"""
    client = _get_client()
    response = client.embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=texts,
        encoding_format="float",
    )
    # 按输入顺序排列结果
    sorted_data = sorted(response.data, key=lambda d: d.index)
    return [d.embedding for d in sorted_data]


async def embed(text: str) -> list[float]:
    """将单段文本转换为向量。"""
    await _limiter.acquire()
    try:
        results = await anyio.to_thread.run_sync(_call_embedding_sync, [text])
        return results[0]
    finally:
        _limiter.release()


async def embed_batch(texts: list[str], batch_size: int = 100) -> list[list[float]]:
    """批量向量化（自动分片，控制并发）。"""
    if not texts:
        return []

    all_vectors: list[list[float]] = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        await _limiter.acquire()
        try:
            vectors = await anyio.to_thread.run_sync(_call_embedding_sync, batch)
            all_vectors.extend(vectors)
        finally:
            _limiter.release()

    return all_vectors


# ═══════════════════════════════════════════════════════════════
# pgvector 相似度检索
# ═══════════════════════════════════════════════════════════════

_SEARCH_SQL = """
    SELECT
        slug,
        title,
        summary,
        tags,
        categories,
        created_at,
        1.0 - (embedding <=> :query_vec) AS similarity
    FROM posts
    WHERE
        is_published = true
        AND is_deleted = false
        AND embedding IS NOT NULL
    ORDER BY embedding <=> :query_vec
    LIMIT :limit
"""


def search_similar(
    db: Session,
    query_vec: list[float],
    limit: int = 5,
) -> list[dict[str, Any]]:
    """在已发布文章中执行余弦相似度检索。

    ``<=>`` 是 pgvector 的余弦距离运算符，``1 - 余弦距离 = 余弦相似度``。
    结果按相似度降序排列（最相关的排最前）。
    """
    result = db.execute(
        text(_SEARCH_SQL),
        {"query_vec": str(query_vec), "limit": limit},
    )
    rows = result.fetchall()
    return [
        {
            "slug": row.slug,
            "title": row.title,
            "summary": row.summary,
            "tags": row.tags or [],
            "categories": row.categories or [],
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "similarity": round(row.similarity, 4) if row.similarity else 0.0,
        }
        for row in rows
    ]


def count_indexed(db: Session) -> dict[str, int]:
    """统计已索引 / 总数。"""
    total = db.execute(text("SELECT COUNT(*) FROM posts WHERE is_deleted = false")).scalar()
    indexed = db.execute(
        text("SELECT COUNT(*) FROM posts WHERE is_deleted = false AND embedding IS NOT NULL")
    ).scalar()
    return {"total": total, "indexed": indexed}
