from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from core.config import settings

# ═══════════════════════════════════════════════════════════════════════
#  Password hashing — bcrypt
# ═══════════════════════════════════════════════════════════════════════


def get_password_hash(password: str) -> str:
    """对明文密码进行 bcrypt 哈希，返回可直接存入数据库的 hash 字符串。"""
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """校验明文密码与数据库中存储的 hash 是否匹配。"""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


# ═══════════════════════════════════════════════════════════════════════
#  JWT — 双 Token 无感刷新
# ═══════════════════════════════════════════════════════════════════════


def create_access_token(data: dict) -> str:
    """签发短期访问令牌。

    ``data`` 至少应包含 ``"sub"`` 键（用户标识，如 user_id 或 email）。
    Token 内会自动写入 ``exp`` 和 ``type: "access"``。
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """签发长期刷新令牌（静默续期用）。

    ``data`` 至少应包含 ``"sub"`` 键。
    Token 内会自动写入 ``exp`` 和 ``type: "refresh"``。
    与 access token 使用相同的 SECRET_KEY 和 ALGORITHM。
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
