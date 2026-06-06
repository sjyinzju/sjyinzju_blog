"""S3 文件代理 — 服务端从 MinIO 拉取后返回客户端

当 S3_PUBLIC_BASE_URL 配置后，浏览器通过此端点间接访问 MinIO 文件，
避免 127.0.0.1 等内网地址在客户端无法访问的问题。
"""

import io

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from core.config import settings
from utils.storage import _get_s3_client

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/avatars/{key:path}")
async def serve_media(key: str):
    """代理 MinIO/S3 文件"""
    s3 = _get_s3_client()
    try:
        obj = s3.get_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
        return StreamingResponse(
            io.BytesIO(obj["Body"].read()),
            media_type=obj.get("ContentType", "image/jpeg"),
        )
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
