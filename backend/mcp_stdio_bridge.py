"""
MCP Stdio Bridge — 本地进程入口

通过标准输入/输出与 AI Agent 通信，无需网络、无需 Token。
Agent 启动时自动以子进程方式拉起本脚本，通过 stdin/stdout
交换 JSON-RPC 消息。

与 SSE 模式共享同一个 ``mcp_server`` 实例 —— 你在 mcp_server 上
注册的任何 Tool / Resource / Prompt 对两种模式同时生效，零额外成本。

使用方法:
    uv run python mcp_stdio_bridge.py

Agent 配置示例 (Claude Code / Claude Desktop):
    {
      "mcpServers": {
        "sjyblog": {
          "command": "uv",
          "args": ["run", "python", "mcp_stdio_bridge.py"],
          "cwd": "/path/to/sjyinzju_blog/backend"
        }
      }
    }

与 SSE 模式的对比:
    ┌──────────┬─────────────────────┬──────────────────────┐
    │   维度   │  SSE (mcp_server.py) │  stdio (本脚本)      │
    ├──────────┼─────────────────────┼──────────────────────┤
    │ 连接方式 │ HTTP 长连接          │ 进程 stdin/stdout     │
    │ 网络要求 │ 需要公网可达          │ 无需网络              │
    │ Token    │ 必须 (Bearer token)  │ 无需 (进程级信任)     │
    │ 适用场景 │ 远程 Agent / 多用户  │ 本机 Claude Code 等   │
    └──────────┴─────────────────────┴──────────────────────┘
"""

import logging
import sys

import anyio

from mcp.server.stdio import stdio_server

# 直接复用 mcp_server 模块中的单例实例
# 后续注册的所有 Tool / Resource / Prompt 自动双向生效
from mcp_server import mcp_server

logger = logging.getLogger("mcp.stdio")


async def main() -> None:
    """启动 stdio MCP 服务循环。"""
    logger.info("MCP stdio bridge 启动中 …")

    # stdio_server() 自动将 stdin/stdout 封装为 MCP 消息流
    async with stdio_server() as (read_stream, write_stream):
        await mcp_server.run(
            read_stream,
            write_stream,
            mcp_server.create_initialization_options(),
        )

    logger.info("MCP stdio bridge 已退出。")


if __name__ == "__main__":
    # ── 日志只输出到 stderr，避免污染 stdout 上的 JSON-RPC ──
    logging.basicConfig(
        level=logging.INFO,
        format="[%(name)s] %(levelname)s: %(message)s",
        stream=sys.stderr,
    )

    try:
        anyio.run(main)
    except KeyboardInterrupt:
        logger.info("收到中断信号，正常退出。")
    except Exception:
        logger.exception("MCP stdio bridge 异常退出。")
        sys.exit(1)
