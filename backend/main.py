from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core.config import settings
from core.limiter import limiter
from mcp_server import build_mcp_app
from routers import auth, posts, social, stats

app = FastAPI(title="Blog API", version="0.1.0")

# ── 速率限制 ──
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── 路由注册 ──
app.include_router(posts.router)
app.include_router(auth.router)
app.include_router(social.router)
app.include_router(stats.router)

# ── MCP SSE 子应用（ASGI 层挂载，自带 Token 安全校验） ──
app.mount("/mcp", build_mcp_app())

# ── CORS（凭证模式：allow_credentials=True 时不能使用 ["*"]） ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://blog.sjyinzju.top"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 全局请求体积限制（5 MB） ──
MAX_BODY_SIZE = 5 * 1024 * 1024  # 5 MB


@app.middleware("http")
async def enforce_content_length(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_BODY_SIZE:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request body too large"},
        )
    return await call_next(request)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.SECURE_COOKIES:
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
    return response


@app.get("/health")
def health():
    return {"status": "ok", "message": "Blog API is running"}
