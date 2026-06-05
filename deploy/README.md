# MCP 部署指南

三种连接方式覆盖所有使用场景：

```
┌──────────────────────────────────────────────────────────────┐
│                      你的 AI Agent                           │
│                                                              │
│  ┌─ 本地使用 ─────────────────────────────────────────────┐  │
│  │  stdio bridge (零网络)                                   │  │
│  │  uv run python mcp_stdio_bridge.py                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ 远程使用 ─────────────────────────────────────────────┐  │
│  │  HTTPS + SSE ─┬─ Nginx + Let's Encrypt (传统方案)        │  │
│  │               └─ Caddy (推荐新手，自动 SSL)              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 方案 1：stdio（本机零配置）

Agent 以子进程方式直接拉起 Python 脚本，通过 stdin/stdout 通信。**不需要网络、不需要 SSL、不需要 Token**。

### Agent 配置

```json
{
  "mcpServers": {
    "sjyblog": {
      "command": "uv",
      "args": ["run", "python", "mcp_stdio_bridge.py"],
      "cwd": "E:/sjyinzju_blog/backend"
    }
  }
}
```

> Claude Code: 配置写入 `.claude/mcp.json`  
> Claude Desktop: 配置写入 `claude_desktop_config.json`

### 验证

```bash
cd backend
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | uv run python mcp_stdio_bridge.py
```

如果返回 JSON-RPC 响应（包含 `serverInfo.name: "SjyBlogMCP"`），说明 stdio 通道正常。

---

## 方案 2：Nginx + HTTPS（传统 VPS 方案）

### 前置条件

```bash
# Ubuntu / Debian
sudo apt install nginx certbot python3-certbot-nginx
```

### 步骤

**1. 创建网站根目录（Let's Encrypt 验证用）**

```bash
sudo mkdir -p /var/www/certbot
```

**2. 拷贝并修改 Nginx 配置**

```bash
sudo cp deploy/nginx/mcp.conf /etc/nginx/sites-available/mcp.conf
sudo sed -i 's/<YOUR_DOMAIN>/mcp.your-real-domain.com/g' /etc/nginx/sites-available/mcp.conf
sudo ln -s /etc/nginx/sites-available/mcp.conf /etc/nginx/sites-enabled/
sudo nginx -t        # 检查语法
sudo systemctl reload nginx
```

**3. 签发 SSL 证书**

```bash
sudo certbot --nginx -d mcp.your-real-domain.com
# 选择 "2" (Redirect — 将 HTTP 重定向到 HTTPS)
```

**4. 确认生效**

```bash
curl -I https://mcp.your-real-domain.com/mcp/sse \
  -H "Authorization: Bearer <你的MCP_SECRET_TOKEN>"
# 应返回 HTTP/2 200，content-type: text/event-stream
```

### Nginx 配置关键点速查

| 指令 | 值 | 为什么 |
|---|---|---|
| `proxy_buffering` | `off` | SSE 必须实时推送事件，缓冲会阻塞 |
| `proxy_read_timeout` | `24h` | SSE 长连接不应被超时断开 |
| `proxy_http_version` | `1.1` | 支持分块传输编码和 keepalive |
| `chunked_transfer_encoding` | `on` | SSE 流使用分块传输 |
| `proxy_set_header Connection` | `''` | 防止 Nginx 插入 `close` 头 |

---

## 方案 3：Caddy（推荐新手，自动 HTTPS）

Caddy 自动向 Let's Encrypt 申请和续签证书，配置量只有 Nginx 的 1/8。

### 安装

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

### 部署

```bash
sudo cp deploy/caddy/Caddyfile /etc/caddy/Caddyfile
sudo sed -i 's/<YOUR_DOMAIN>/mcp.your-real-domain.com/g' /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 验证

```bash
curl -I https://mcp.your-real-domain.com/mcp/sse \
  -H "Authorization: Bearer <你的MCP_SECRET_TOKEN>"
```

---

## Agent 配置文件参考

### Claude Code (`~/.claude/mcp.json` 或项目 `.claude/mcp.json`)

```json
{
  "mcpServers": {
    "sjyblog-stdio": {
      "command": "uv",
      "args": ["run", "python", "mcp_stdio_bridge.py"],
      "cwd": "/path/to/sjyinzju_blog/backend"
    },
    "sjyblog-sse": {
      "type": "sse",
      "url": "https://mcp.your-domain.com/mcp/sse",
      "headers": {
        "Authorization": "Bearer f2c89eaa57e38e40ad440bd128595be39c9577bd1689dc803c7bcff9a60f9530"
      }
    }
  }
}
```

> 两个可同时配置 — Agent 会选择其中一个，或者两个都可用。

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "sjyblog": {
      "type": "sse",
      "url": "https://mcp.your-domain.com/mcp/sse",
      "headers": {
        "Authorization": "Bearer <你的MCP_SECRET_TOKEN>"
      }
    }
  }
}
```

### 其他 MCP 客户端

任何支持 MCP 协议的客户端只需具备：

| 字段 | 值 |
|---|---|
| transport | `sse` |
| url | `https://mcp.your-domain.com/mcp/sse` |
| auth header | `Authorization: Bearer <token>` |

---

## 安全实践清单

- [ ] `.env` 中的 `MCP_SECRET_TOKEN` 已替换为强随机值（`openssl rand -hex 32`）
- [ ] 防火墙仅开放 443（HTTPS）和 80（证书续签），8000 端口**不对公网暴露**
- [ ] SSL 证书已配置且自动续签（certbot timer / Caddy 内建）
- [ ] 确认 `/` 路径在反代层返回 404，不暴露后端其他 API
- [ ] （可选）HSTS 头已开启
