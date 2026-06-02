"""MinIO / S3 对象存储工具"""

import uuid
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

from core.config import settings

_s3_client = None


def _get_s3_client():
    """懒加载 S3 客户端。"""
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
        )
    return _s3_client


def _ensure_bucket():
    """确保目标 bucket 存在，不存在则自动创建。"""
    s3 = _get_s3_client()
    try:
        s3.head_bucket(Bucket=settings.S3_BUCKET_NAME)
    except ClientError:
        s3.create_bucket(Bucket=settings.S3_BUCKET_NAME)


def upload_file_to_s3(file_bytes: bytes, filename: str, content_type: str) -> str:
    """上传文件到 S3，返回可访问的绝对 URL。

    Args:
        file_bytes: 文件内容
        filename: 原始文件名（扩展名用于推断 key）
        content_type: MIME 类型

    Returns:
        文件在 S3 上的绝对 URL（指向 127.0.0.1:9000）
    """
    _ensure_bucket()

    ext = Path(filename).suffix or ".bin"
    key = f"{uuid.uuid4().hex}{ext}"

    s3 = _get_s3_client()
    s3.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )

    return f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{key}"
