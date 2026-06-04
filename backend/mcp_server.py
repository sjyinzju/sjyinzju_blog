"""
MCP Server — SSE 运行时底座

基于 mcp Python SDK 构建的 Model Context Protocol 服务端。
通过 SSE (Server-Sent Events) 传输层与外部 AI Agent 通信。

架构决策：
- 使用独立的 Starlette 子应用挂载到 FastAPI 的 ``/mcp`` 路径下，
  避免 FastAPI Depends / BaseHTTPMiddleware 与 SSE 长连接
  Response 双重发送的兼容性问题。
- Token 安全校验在 ASGI 中间件层完成，无需依赖 FastAPI Depends。

当前为最小骨架 —— 尚未注册任何 Tool / Resource / Prompt，
仅搭建 SSE 长连接 + 消息通道，供后续扩展。
"""

import logging

from mcp.server.lowlevel.server import Server as MCPServer
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Mount, Route
from starlette.types import Receive, Scope, Send

from core.config import settings

logger = logging.getLogger("mcp")

# ══════════════════════════════════════════════
# 1. 实例化 MCP Server
# ══════════════════════════════════════════════
mcp_server = MCPServer(
    name="SjyBlogMCP",
    version="0.1.0",
    instructions=(
        "SjyBlog MCP Server — 个人博客的智能助手接口。"
        "通过此 MCP 服务，AI Agent 可以检索文章、获取站点统计、"
        "管理评论等。"
    ),
)

# ══════════════════════════════════════════════
# 2. 创建 SSE 传输层
# ══════════════════════════════════════════════
# endpoint="/messages" 与子应用内的 Mount("/messages", ...) 对应。
# 客户端在建立 SSE 连接后，将通过 <root_path>/messages 发送 JSON-RPC。
sse = SseServerTransport(endpoint="/messages")


# ══════════════════════════════════════════════
# 3. ASGI 级 Token 校验中间件
# ══════════════════════════════════════════════
class _McpTokenAuthMiddleware:
    """ASGI 中间件：在每个 MCP 请求到达前校验 Bearer token。

    直接在 ASGI 层拦截未授权请求，返回 401 JSON 响应。
    授权通过则透传 scope / receive / send 给下游 ASGI 处理器。

    设计要点：
    - 独立于 FastAPI 的 Depends 体系，避免 SSE 长连接
      关闭后 FastAPI 尝试重新发送 Response 导致的断言错误。
    - 恒定时间比较防止时序侧信道攻击。
    """

    def __init__(self, app: Starlette) -> None:
        self._app = app
        self._token = settings.MCP_SECRET_TOKEN

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self._app(scope, receive, send)
            return

        # 解析 ASGI headers（bytes → str）
        raw_headers: dict[bytes, bytes] = dict(scope.get("headers", []))
        auth_bytes = raw_headers.get(b"authorization", b"")
        auth = auth_bytes.decode("latin-1")

        # ── 校验 Bearer token ──
        if not auth.startswith("Bearer ") or not _constant_time_compare(
            auth[7:], self._token
        ):
            response = JSONResponse(
                status_code=401,
                content={"detail": "Invalid MCP Token"},
            )
            await response(scope, receive, send)
            return

        # 放行到下游 ASGI 处理器
        await self._app(scope, receive, send)


def _constant_time_compare(a: str, b: str) -> bool:
    """防时序攻击的恒定时间字符串比较。"""
    if len(a) != len(b):
        return False
    result = 0
    for x, y in zip(a, b):
        result |= ord(x) ^ ord(y)
    return result == 0


# ══════════════════════════════════════════════
# 4. 构建 MCP 子应用
# ══════════════════════════════════════════════

class _SseEndpoint:
    """ASGI 端点：建立 SSE 长连接并运行 MCP 协议。

    注意：必须使用类实例而非裸函数作为 Starlette Route 的 endpoint。
    Starlette 对 inspect.isfunction() 为 True 的 endpoint 会强制包装为
    ``(request: Request) -> Response`` 调用约定；只有类实例才会被识别为
    原始 ASGI 应用 ``(scope, receive, send)`` 并被透传。
    """

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        logger.info("MCP SSE 连接建立 …")
        async with sse.connect_sse(scope, receive, send) as streams:
            read_stream, write_stream = streams
            await mcp_server.run(
                read_stream,
                write_stream,
                mcp_server.create_initialization_options(),
            )
        logger.info("MCP SSE 连接断开。")


def build_mcp_app() -> _McpTokenAuthMiddleware:
    """创建受 Token 保护的 MCP SSE 子应用。

    路由结构：
        GET  /mcp/sse       → 建立 SSE 长连接
        POST /mcp/messages  → 接收客户端 JSON-RPC 消息

    返回的 ASGI 应用可直接通过 FastAPI 的 ``app.mount("/mcp", ...)`` 挂载。
    """
    routes: list[Route | Mount] = [
        Route("/sse", endpoint=_SseEndpoint(), methods=["GET"]),
        Mount("/messages", app=sse.handle_post_message),
    ]

    inner = Starlette(routes=routes)

    # 整站 Token 保护：所有 /mcp/* 请求必须先过 Token 校验
    return _McpTokenAuthMiddleware(inner)
