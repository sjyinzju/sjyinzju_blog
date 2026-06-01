from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PostCreate(BaseModel):
    """创建文章请求体（所有字段必填或有默认值）。"""

    title: str
    slug: str
    content: str
    summary: str
    tags: list[str] = []
    is_published: bool = True


class PostUpdate(BaseModel):
    """编辑文章请求体（所有字段可选，仅更新传入的字段）。"""

    title: str | None = None
    slug: str | None = None
    content: str | None = None
    summary: str | None = None
    tags: list[str] | None = None
    is_published: bool | None = None


class PostResponse(BaseModel):
    """对外返回的文章信息。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    content: str
    summary: str
    tags: list[str]
    is_published: bool
    created_at: datetime
