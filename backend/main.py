from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, posts

app = FastAPI(title="Blog API", version="0.1.0")

# ── 路由注册 ──
app.include_router(posts.router)
app.include_router(auth.router)

# ── CORS（凭证模式：allow_credentials=True 时不能使用 ["*"]） ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "message": "Blog API is running"}
