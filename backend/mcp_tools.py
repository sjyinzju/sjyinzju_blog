"""
MCP Tools —— 博客内容注入

向 AI Agent 提供 10 个 Tool：
  只读: blog_list_posts / blog_search_posts / blog_get_post /
        blog_get_tags / blog_get_graph / blog_semantic_search
  管理: blog_create_post / blog_recommend_links / blog_update_post / blog_reindex

所有 DB 查询通过 ``anyio.to_thread.run_sync`` 在后台线程执行，不阻塞 asyncio。
向量嵌入通过阿里云百炼 DashScope (OpenAI 兼容协议) 生成。

注册方式（在 mcp_server.py 中）:
    from mcp_tools import register_tools
    register_tools(mcp_server)

注册后 SSE 和 stdio 两种传输模式自动同时生效。
"""

from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime, timezone

import anyio
from sqlalchemy import String, cast, or_

import mcp.types as types
from core.database import SessionLocal
from core.embeddings import count_indexed, embed, is_ready, search_similar
from mcp.server.lowlevel.server import Server as MCPServer, request_ctx
from models.post import Post

# ═══════════════════════════════════════════════════════════════
# Tool 元数据
# ═══════════════════════════════════════════════════════════════

_TOOLS: list[types.Tool] = [
    types.Tool(
        name="blog_list_posts",
        description=(
            "列出博客中所有已发布的文章，支持分页。"
            "用于了解博客有哪些内容，获取文章列表后再决定要阅读哪些。"
            "返回每篇文章的 title / slug / summary / tags / categories / created_at。"
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "返回的文章数量上限（默认 20，最大 100）",
                    "default": 20,
                },
                "offset": {
                    "type": "integer",
                    "description": "跳过的文章数，用于翻页（默认 0）",
                    "default": 0,
                },
            },
        },
    ),
    types.Tool(
        name="blog_search_posts",
        description=(
            "按关键字搜索博客文章。在标题和标签中模糊匹配（大小写不敏感）。"
            "用于查找与特定话题相关的内容，返回匹配文章的 title / slug / summary / tags。"
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "搜索关键字",
                },
                "limit": {
                    "type": "integer",
                    "description": "返回文章数上限（默认 10，最大 50）",
                    "default": 10,
                },
            },
            "required": ["query"],
        },
    ),
    types.Tool(
        name="blog_get_post",
        description=(
            "获取指定文章的完整内容（Markdown 格式）。★ 核心工具 ★\n"
            "当用户询问某一篇具体文章的内容时，Agent 必须调用此工具获取全文。"
            "返回文章的 title / content / summary / tags / categories / "
            "internal_links / created_at。content 字段为完整的 Markdown 原文。"
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "slug": {
                    "type": "string",
                    "description": "文章的唯一 slug 标识符（即 URL 中 /[category]/[slug] 的最后一段）",
                },
            },
            "required": ["slug"],
        },
    ),
    types.Tool(
        name="blog_get_tags",
        description=(
            "获取博客的热门标签及每标签的文章篇数，按频率降序排列。"
            "用于了解博客主要涵盖的话题领域。"
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "返回标签数上限（默认 10，最大 50）",
                    "default": 10,
                },
            },
        },
    ),
    types.Tool(
        name="blog_get_graph",
        description=(
            "获取博客的知识图谱——分类→标签→文章 的关联结构及文章间的双向链接。"
            "用于理解博客的整体知识组织、内容分类、标签体系和文章引用关系。"
        ),
        inputSchema={
            "type": "object",
            "properties": {},
        },
    ),
    types.Tool(
        name="blog_create_post",
        description=(
            "★ 管理员工具 ★ 创建并发布一篇新博客文章。\n"
            "Agent 应先生成合适的 slug / summary / tags，再调用此工具。\n"
            "slug 要求：英文、小写、单词间用连字符分隔（如 'my-awesome-post'）。\n"
            "category 必须是以下之一：笔记 / 思考 / 灵感 / 资源。"
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "文章标题",
                },
                "content": {
                    "type": "string",
                    "description": "完整的 Markdown 正文",
                },
                "category": {
                    "type": "string",
                    "description": "分类：笔记 / 思考 / 灵感 / 资源",
                    "enum": ["笔记", "思考", "灵感", "资源"],
                },
                "slug": {
                    "type": "string",
                    "description": "URL slug（英文小写+连字符）。不填则从标题自动生成",
                },
                "summary": {
                    "type": "string",
                    "description": "文章摘要（≤500 字）。不填则取正文前 200 字",
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "标签列表，如 ['Python', 'FastAPI']",
                },
                "internal_links": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "双链 slug 列表（从 blog_recommend_links 获取）",
                },
                "is_published": {
                    "type": "boolean",
                    "description": "是否直接发布（默认 true）",
                    "default": True,
                },
            },
            "required": ["title", "content", "category"],
        },
    ),
    types.Tool(
        name="blog_recommend_links",
        description=(
            "★ 管理员工具 ★ 为新文章推荐相关旧文章作为双链目标。\n"
            "根据标签重叠度和分类匹配度排序，返回最适合建立内部链接的文章。\n"
            "Agent 拿到推荐列表后自行在文章底部追加「推荐阅读」段落。"
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "当前文章的标签列表，用于匹配",
                },
                "category": {
                    "type": "string",
                    "description": "当前文章的分类（同分类文章加分）",
                },
                "exclude_slug": {
                    "type": "string",
                    "description": "排除某篇文章（更新已有文章时使用）",
                },
                "limit": {
                    "type": "integer",
                    "description": "推荐数量（默认 5，最大 10）",
                    "default": 5,
                },
            },
            "required": ["tags"],
        },
    ),
    types.Tool(
        name="blog_update_post",
        description=(
            "★ 管理员工具 ★ 更新已有文章的元数据（internal_links / tags / summary 等）。\n"
            "主要用于发布后将 blog_recommend_links 的结果写入 internal_links。"
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "slug": {
                    "type": "string",
                    "description": "要更新的文章 slug",
                },
                "internal_links": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "新的双链 slug 列表（全量替换）",
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "新的标签列表（全量替换）",
                },
                "summary": {
                    "type": "string",
                    "description": "新的摘要",
                },
            },
            "required": ["slug"],
        },
    ),
    types.Tool(
        name="blog_semantic_search",
        description=(
            "★ 语义搜索 ★ 用自然语言检索博客文章。\n"
            "使用向量相似度匹配，即使关键词不完全一致也能找到语义相关的内容。\n"
            "适用于开放性问题，如「有没有讲数据库优化的文章」「异步编程相关的内容」。\n"
            "返回结果按相似度降序排列，similarity 越接近 1 越相关。"
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "自然语言查询，如「Python 协程的使用方法」",
                },
                "limit": {
                    "type": "integer",
                    "description": "返回数量（默认 5，最大 10）",
                    "default": 5,
                },
            },
            "required": ["query"],
        },
    ),
    types.Tool(
        name="blog_reindex",
        description=(
            "★ 管理员工具 ★ 为文章批量生成/更新向量嵌入。\n"
            "适用于：首次启用向量搜索后的全量索引、嵌入模型切换后的重建。\n"
            "可指定 slug 重建单篇，或重建全部未索引文章。"
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "slug": {
                    "type": "string",
                    "description": "指定重建某篇文章。不填则重建所有未索引文章",
                },
                "force": {
                    "type": "boolean",
                    "description": "是否强制重建（包括已索引的文章）",
                    "default": False,
                },
            },
        },
    ),
]

# 仅用于图谱过滤的有效分类（与 routers/posts.py 保持一致）
_VALID_CATEGORIES = {"笔记", "思考", "灵感", "资源"}


# ═══════════════════════════════════════════════════════════════
# 输出构造工具
# ═══════════════════════════════════════════════════════════════

def _post_to_dict(post: Post, *, include_body: bool = False) -> dict:
    """将 ORM 对象转成 Agent 可读的字典。"""
    d: dict = {
        "title": post.title,
        "slug": post.slug,
        "summary": post.summary,
        "tags": post.tags or [],
        "categories": post.categories or [],
        "created_at": post.created_at.isoformat() if post.created_at else None,
    }
    if include_body:
        d["content"] = post.content
        d["internal_links"] = post.internal_links or []
    return d


def _json_result(obj: dict | list | str) -> types.CallToolResult:
    text = obj if isinstance(obj, str) else json.dumps(obj, ensure_ascii=False, indent=2)
    return types.CallToolResult(content=[types.TextContent(type="text", text=text)])


def _error(message: str) -> types.CallToolResult:
    return types.CallToolResult(
        content=[types.TextContent(type="text", text=message)],
        isError=True,
    )


def _slugify(title: str) -> str:
    """从标题生成 URL slug（简单回退方案，Agent 提供更佳）。"""
    slug = title.lower().strip()
    # 去除非字母数字/空格/连字符，中文直接移除
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[-\s]+", "-", slug)
    return slug[:100].strip("-") or "untitled"


def _require_admin() -> types.CallToolResult | None:
    """管理员鉴权守卫。

    从 MCP 的 request_ctx 回溯到 Starlette HTTP Request，
    读取 ASGI scope 中的 ``mcp_auth_level``。

    - SSE: 由 _McpTokenAuthMiddleware 在 token 校验时写入
    - stdio: 无 HTTP context → 自动视为 admin（本地信任）
    - read token → 返回 403 错误
    - admin token → 返回 None（放行）
    """
    try:
        ctx = request_ctx.get()
        meta = ctx.meta
        http_request = getattr(meta, "request_context", None)
        if http_request is None:
            # stdio 模式：无 HTTP request，本地进程默认信任
            return None
        auth_level = http_request.scope.get("mcp_auth_level", "read")
        if auth_level != "admin":
            return _error("权限不足：此工具仅限管理员调用。请使用 MCP_ADMIN_TOKEN。")
        return None
    except LookupError:
        # request_ctx 未设置（stdio 初始化阶段），默认放行
        return None


# ═══════════════════════════════════════════════════════════════
# 同步查询逻辑（在 thread pool 中执行）
# ═══════════════════════════════════════════════════════════════

def _list_posts(limit: int, offset: int) -> types.CallToolResult:
    limit = max(1, min(limit, 100))
    offset = max(0, offset)
    db = SessionLocal()
    try:
        posts = (
            db.query(Post)
            .filter(Post.is_published == True, Post.is_deleted == False)
            .order_by(Post.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return _json_result([_post_to_dict(p) for p in posts])
    finally:
        db.close()


def _search_posts(query: str, limit: int) -> types.CallToolResult:
    limit = max(1, min(limit, 50))
    pattern = f"%{query.strip()}%"
    db = SessionLocal()
    try:
        posts = (
            db.query(Post)
            .filter(
                Post.is_published == True,
                Post.is_deleted == False,
                or_(
                    Post.title.ilike(pattern),
                    cast(Post.tags, String).ilike(pattern),
                ),
            )
            .order_by(Post.created_at.desc())
            .limit(limit)
            .all()
        )
        return _json_result([_post_to_dict(p) for p in posts])
    finally:
        db.close()


def _get_post(slug: str) -> types.CallToolResult:
    db = SessionLocal()
    try:
        post = (
            db.query(Post)
            .filter(Post.slug == slug, Post.is_deleted == False)
            .first()
        )
        if post is None:
            return _error(
                f"文章 '{slug}' 不存在。请用 blog_list_posts 或 blog_search_posts 查找可用文章。"
            )
        if not post.is_published:
            return _error(f"文章 '{slug}' 尚未发布。")
        return _json_result(_post_to_dict(post, include_body=True))
    finally:
        db.close()


def _get_tags(limit: int) -> types.CallToolResult:
    limit = max(1, min(limit, 50))
    db = SessionLocal()
    try:
        rows = (
            db.query(Post.tags)
            .filter(Post.is_published == True, Post.is_deleted == False)
            .all()
        )
        counter: Counter = Counter()
        for (tags,) in rows:
            if tags:
                for tag in tags:
                    counter[tag] += 1
        return _json_result(
            [{"tag": tag, "count": count} for tag, count in counter.most_common(limit)]
        )
    finally:
        db.close()


def _get_graph() -> types.CallToolResult:
    db = SessionLocal()
    try:
        posts = (
            db.query(Post)
            .filter(Post.is_published == True, Post.is_deleted == False)
            .all()
        )

        nodes: dict[str, dict] = {}
        links: list[dict] = []
        slug_to_id: dict[str, str] = {}

        # ── 第一遍：节点 ──
        for post in posts:
            article_id = f"article:{post.slug}"
            nodes.setdefault(article_id, {
                "id": article_id,
                "label": post.title,
                "group": "article",
                "slug": post.slug,
            })
            slug_to_id[post.slug] = article_id

            for cat in post.categories:
                if cat not in _VALID_CATEGORIES:
                    continue
                cat_id = f"category:{cat}"
                nodes.setdefault(cat_id, {"id": cat_id, "label": cat, "group": "category"})
                links.append({"source": cat_id, "target": article_id})

            for tag in post.tags:
                tag_id = f"tag:{tag}"
                nodes.setdefault(tag_id, {"id": tag_id, "label": tag, "group": "tag"})
                links.append({"source": tag_id, "target": article_id})

        # ── 第二遍：内部链接 ──
        for post in posts:
            src = f"article:{post.slug}"
            for target_slug in post.internal_links:
                dst = slug_to_id.get(target_slug)
                if dst and dst != src:
                    links.append({"source": src, "target": dst})

        # ── 去重 ──
        seen: set[tuple[str, str]] = set()
        unique: list[dict] = []
        for link in links:
            key = (link["source"], link["target"])
            if key not in seen:
                seen.add(key)
                unique.append(link)

        return _json_result({"nodes": list(nodes.values()), "links": unique})
    finally:
        db.close()


def _create_post(
    title: str,
    content: str,
    category: str,
    slug: str,
    summary: str,
    tags: list[str],
    internal_links: list[str],
    is_published: bool,
) -> types.CallToolResult:
    # slug 回退
    if not slug.strip():
        slug = _slugify(title)
    slug = slug.strip().lower().replace(" ", "-")

    # summary 回退
    if not summary.strip():
        # 取正文前 200 字（跳过 YAML frontmatter 和标题行）
        clean = re.sub(r"^---[\s\S]*?---\n", "", content.strip())
        clean = re.sub(r"^#.*\n", "", clean)
        summary = clean.strip()[:200]

    db = SessionLocal()
    try:
        # slug 唯一性
        existing = db.query(Post).filter(Post.slug == slug).first()
        if existing:
            return _error(
                f"slug '{slug}' 已被文章《{existing.title}》使用，请换一个。"
            )

        post = Post(
            title=title.strip(),
            slug=slug,
            content=content.strip(),
            summary=summary.strip()[:500],
            categories=[category],
            tags=tags or [],
            internal_links=internal_links or [],
            is_published=is_published,
        )
        # ── 自动生成 embedding ──
        embedding_note = ""
        if is_ready():
            try:
                text_to_embed = f"{post.title}\n{post.summary}\n{' '.join(tags or [])}"
                post.embedding = _embed_sync_or_none(text_to_embed)
                if post.embedding:
                    embedding_note = "，embedding 已生成"
                else:
                    embedding_note = "，embedding 生成失败（API 错误）"
            except Exception:
                embedding_note = "，embedding 生成失败"

        db.add(post)
        db.commit()
        db.refresh(post)

        result = _json_result(_post_to_dict(post, include_body=True))
        if embedding_note:
            result.content[0].text += f"\n// {embedding_note.strip()}"
        return result
    except Exception as exc:
        db.rollback()
        return _error(f"创建文章失败：{exc}")
    finally:
        db.close()


def _recommend_links(
    tags: list[str],
    category: str | None,
    exclude_slug: str | None,
    limit: int,
) -> types.CallToolResult:
    limit = max(1, min(limit, 10))
    tag_set = {t.strip() for t in tags if t.strip()}
    if not tag_set:
        return _error("tags 不能为空。")

    db = SessionLocal()
    try:
        candidates = (
            db.query(Post)
            .filter(
                Post.is_published == True,
                Post.is_deleted == False,
            )
            .all()
        )

        scored: list[dict] = []
        for post in candidates:
            # 排除自身
            if exclude_slug and post.slug == exclude_slug:
                continue
            if not post.tags:
                continue

            post_tag_set = set(post.tags)
            overlap = len(tag_set & post_tag_set)
            if overlap == 0:
                continue

            # 同分类额外加分
            bonus = 0
            if category and category in (post.categories or []):
                bonus = 1

            score = overlap + bonus
            scored.append({
                "slug": post.slug,
                "title": post.title,
                "overlap_tags": sorted(tag_set & post_tag_set),
                "overlap_count": overlap,
                "same_category": bonus > 0,
                "score": score,
            })

        scored.sort(key=lambda x: (-x["score"], -x["overlap_count"]))

        return _json_result(scored[:limit])
    finally:
        db.close()


def _update_post(slug: str, updates: dict) -> types.CallToolResult:
    db = SessionLocal()
    try:
        post = (
            db.query(Post)
            .filter(Post.slug == slug, Post.is_deleted == False)
            .first()
        )
        if post is None:
            return _error(f"文章 '{slug}' 不存在。")

        changed = False
        for field in ("internal_links", "tags", "summary"):
            if field in updates and updates[field] is not None:
                setattr(post, field, updates[field])
                changed = True

        if not changed:
            return _error("没有需要更新的字段。")

        # ── 自动更新 embedding（如 API 可用） ──
        embedding_note = ""
        if is_ready():
            text_to_embed = f"{post.title}\n{post.summary}\n{' '.join(post.tags or [])}"
            post.embedding = _embed_sync_or_none(text_to_embed)
            embedding_note = "，embedding 已更新" if post.embedding else "，embedding 更新失败（API 错误）"

        db.commit()
        db.refresh(post)
        result = _json_result(_post_to_dict(post, include_body=True))
        # 附加说明
        if embedding_note:
            result.content[0].text += f"\n// {embedding_note.strip()}"
        return result
    except Exception as exc:
        db.rollback()
        return _error(f"更新文章失败：{exc}")
    finally:
        db.close()


def _embed_sync(text: str) -> list[float]:
    """在线程中同步获取嵌入向量。

    所有调用都通过 ``anyio.to_thread.run_sync`` 进入独立线程，
    因此可以直接用 ``asyncio.run()`` 创建临时事件循环来执行异步 embed()。
    """
    import asyncio
    return asyncio.run(embed(text))


def _embed_sync_or_none(text: str) -> list[float] | None:
    """尝试同步获取嵌入，失败返回 None（不阻断主流程）。"""
    if not is_ready():
        return None
    try:
        return _embed_sync(text)
    except Exception:
        return None


def _semantic_search(query: str, limit: int) -> types.CallToolResult:
    if not is_ready():
        return _error("向量搜索不可用：EMBEDDING_API_KEY 未配置。")

    limit = max(1, min(limit, 10))
    db = SessionLocal()
    try:
        # 向量化查询（此函数运行在 anyio 线程中，asyncio.run 是安全的）
        import asyncio
        try:
            query_vec = asyncio.run(embed(query))
        except Exception as exc:
            return _error(f"向量化查询失败：{exc}")

        # pgvector 相似度检索
        results = search_similar(db, query_vec, limit)
        if not results:
            return _json_result([{
                "message": "没有找到相关文章。尝试更通用的查询词，或先用 blog_list_posts 浏览。"
            }])
        return _json_result(results)
    finally:
        db.close()


def _reindex(slug: str | None, force: bool) -> types.CallToolResult:
    if not is_ready():
        return _error("向量化不可用：EMBEDDING_API_KEY 未配置。")

    db = SessionLocal()
    try:
        if slug:
            post = (
                db.query(Post)
                .filter(Post.slug == slug, Post.is_deleted == False)
                .first()
            )
            if post is None:
                return _error(f"文章 '{slug}' 不存在。")
            if post.embedding is not None and not force:
                return _json_result({"message": f"'{slug}' 已有索引，使用 force=true 强制重建。"})

            text_to_embed = f"{post.title}\n{post.summary}\n{' '.join(post.tags or [])}"
            vec = _embed_sync_or_none(text_to_embed)
            if vec is None:
                return _error("嵌入 API 调用失败，请检查 EMBEDDING_API_KEY。")
            post.embedding = vec
            db.commit()
            return _json_result({"message": f"'{slug}' 索引已更新。", "dim": len(vec)})

        # 批量模式
        query = db.query(Post).filter(Post.is_deleted == False)
        if not force:
            query = query.filter(Post.embedding == None)
        posts = query.all()

        if not posts:
            return _json_result({"message": "没有需要索引的文章。"})

        indexed = 0
        failed = 0
        for post in posts:
            try:
                text_to_embed = f"{post.title}\n{post.summary}\n{' '.join(post.tags or [])}"
                vec = _embed_sync_or_none(text_to_embed)
                if vec is not None:
                    post.embedding = vec
                    indexed += 1
                else:
                    failed += 1
            except Exception:
                failed += 1

        db.commit()
        stats = count_indexed(db)
        return _json_result({
            "message": f"索引完成：新增 {indexed} 篇，失败 {failed} 篇。",
            "stats": stats,
        })
    except Exception as exc:
        db.rollback()
        return _error(f"重建索引失败：{exc}")
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════
# 注册入口
# ═══════════════════════════════════════════════════════════════

def register_tools(server: MCPServer) -> None:
    """将全部 10 个 MCP Tool 注册到指定的 Server 实例。

    此函数在 mcp_server.py 模块加载时调用一次。
    注册后 SSE 和 stdio 传输模式均自动携带这些 Tool。
    """

    @server.list_tools()
    async def _list(request: types.ListToolsRequest) -> list[types.Tool]:
        return _TOOLS

    @server.call_tool()
    async def _call(name: str, arguments: dict) -> types.CallToolResult:
        if arguments is None:
            arguments = {}

        match name:
            case "blog_list_posts":
                return await anyio.to_thread.run_sync(
                    _list_posts,
                    int(arguments.get("limit", 20)),
                    int(arguments.get("offset", 0)),
                )

            case "blog_search_posts":
                query = str(arguments.get("query", ""))
                if not query.strip():
                    return _error("搜索关键字 query 不能为空。")
                return await anyio.to_thread.run_sync(
                    _search_posts,
                    query,
                    int(arguments.get("limit", 10)),
                )

            case "blog_get_post":
                slug = str(arguments.get("slug", ""))
                if not slug:
                    return _error("slug 参数不能为空。")
                return await anyio.to_thread.run_sync(_get_post, slug)

            case "blog_get_tags":
                return await anyio.to_thread.run_sync(
                    _get_tags,
                    int(arguments.get("limit", 10)),
                )

            case "blog_get_graph":
                return await anyio.to_thread.run_sync(_get_graph)

            # ── 管理员工具 ──
            case "blog_create_post":
                if (err := _require_admin()) is not None:
                    return err
                title = str(arguments.get("title", ""))
                content = str(arguments.get("content", ""))
                category = str(arguments.get("category", ""))
                if not title.strip():
                    return _error("title 不能为空。")
                if not content.strip():
                    return _error("content 不能为空。")
                if category not in _VALID_CATEGORIES:
                    return _error(
                        f"category 必须是以下之一：{' / '.join(sorted(_VALID_CATEGORIES))}"
                    )
                return await anyio.to_thread.run_sync(
                    _create_post,
                    title,
                    content,
                    category,
                    str(arguments.get("slug", "")),
                    str(arguments.get("summary", "")),
                    list(arguments.get("tags") or []),
                    list(arguments.get("internal_links") or []),
                    bool(arguments.get("is_published", True)),
                )

            case "blog_recommend_links":
                if (err := _require_admin()) is not None:
                    return err
                return await anyio.to_thread.run_sync(
                    _recommend_links,
                    list(arguments.get("tags") or []),
                    arguments.get("category"),
                    arguments.get("exclude_slug"),
                    int(arguments.get("limit", 5)),
                )

            case "blog_update_post":
                if (err := _require_admin()) is not None:
                    return err
                slug = str(arguments.get("slug", ""))
                if not slug:
                    return _error("slug 不能为空。")
                updates = {
                    k: v
                    for k in ("internal_links", "tags", "summary")
                    if k in arguments and arguments[k] is not None
                }
                return await anyio.to_thread.run_sync(_update_post, slug, updates)

            # ── 向量化工具 ──
            case "blog_semantic_search":
                query = str(arguments.get("query", ""))
                if not query.strip():
                    return _error("query 不能为空。")
                return await anyio.to_thread.run_sync(
                    _semantic_search,
                    query,
                    int(arguments.get("limit", 5)),
                )

            case "blog_reindex":
                if (err := _require_admin()) is not None:
                    return err
                return await anyio.to_thread.run_sync(
                    _reindex,
                    arguments.get("slug"),
                    bool(arguments.get("force", False)),
                )

            case _:
                return _error(
                    f"未知工具 '{name}'。"
                    f"可用: blog_list_posts, blog_search_posts, blog_get_post, "
                    f"blog_get_tags, blog_get_graph, "
                    f"blog_semantic_search, "
                    f"blog_create_post, blog_recommend_links, blog_update_post, "
                    f"blog_reindex"
                )
