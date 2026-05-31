from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class User(Base):
    __tablename__ = "users"

    # ── 主键（UID，从 1 开始自增） ──
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # ── 注册 / 登录 ──
    email: Mapped[str] = mapped_column(
        String(320), unique=True, nullable=False, index=True
    )
    username: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(128), nullable=False)

    # ── 个人展示 ──
    avatar: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, default=None, nullable=True)
    website: Mapped[str | None] = mapped_column(String(512), default=None, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None, nullable=True
    )

    # ── 内部管理 ──
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
