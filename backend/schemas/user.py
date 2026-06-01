from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    """注册请求体。"""

    username: str = Field(
        ...,
        min_length=1,
        max_length=64,
        examples=["zhangsan"],
    )
    email: str = Field(
        ...,
        max_length=320,
        pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        examples=["my-secret-password"],
    )


class UserLogin(BaseModel):
    """登录请求体。"""

    email: str = Field(..., examples=["user@example.com"])
    password: str = Field(..., examples=["my-secret-password"])


class UserUpdate(BaseModel):
    """用户修改个人资料请求体。所有字段可选，仅更新传入的字段。"""

    username: str | None = Field(None, min_length=1, max_length=64)
    avatar: str | None = Field(None, max_length=512)
    bio: str | None = None
    website: str | None = Field(None, max_length=512)


class PasswordChange(BaseModel):
    """修改密码请求体，必须提供旧密码以验证身份。"""

    old_password: str = Field(..., min_length=6, max_length=128)
    new_password: str = Field(..., min_length=6, max_length=128)


class UserOut(BaseModel):
    """对外返回的用户信息（绝不含密码）。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    avatar: str
    bio: str | None
    website: str | None
    created_at: datetime
    last_login_at: datetime | None
    is_admin: bool
