"""
MCP 全局安全校验依赖 (Security Dependency)

对每一个 MCP SSE / Message 请求强制验证 Authorization 头中的 Bearer token，
与配置文件中的 MCP_SECRET_TOKEN 严格比对，阻断所有未授权的外部 Agent 调用。
"""

from fastapi import Header, HTTPException, status

from core.config import settings


async def verify_mcp_token(
    authorization: str | None = Header(None),
) -> str:
    """FastAPI 依赖：从请求头提取 Bearer token 并与服务端强密钥比对。

    - 缺失 Authorization 头 / 格式非 ``Bearer <token>`` → 401
    - token 与 ``settings.MCP_SECRET_TOKEN`` 不一致 → 401
    - 通过则将原始 token 字符串注入路由（便于后续审计）
    """
    # ── 1. 头存在性检查 ──
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing MCP authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── 2. 格式校验 (Bearer <token>) ──
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MCP Token format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── 3. 密钥恒定时间比对 ──
    if not _constant_time_compare(token, settings.MCP_SECRET_TOKEN):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MCP Token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token


def _constant_time_compare(a: str, b: str) -> bool:
    """防时序攻击的恒定时间字符串比较。"""
    if len(a) != len(b):
        return False
    result = 0
    for x, y in zip(a, b):
        result |= ord(x) ^ ord(y)
    return result == 0
