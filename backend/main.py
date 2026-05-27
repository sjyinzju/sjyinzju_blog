from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import posts

app = FastAPI(title="Blog API", version="0.1.0")

app.include_router(posts.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "message": "Blog API is running"}