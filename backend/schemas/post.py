from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
    """创建文章请求体（所有字段必填或有默认值）。"""

    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1, max_length=200_000)
    summary: str = Field(..., min_length=1, max_length=500)
    categories: list[str] = []
    tags: list[str] = []
    internal_links: list[str] = []
    is_published: bool = True


class PostUpdate(BaseModel):
    """编辑文章请求体（所有字段可选，仅更新传入的字段）。"""

    title: str | None = Field(None, max_length=255)
    slug: str | None = Field(None, max_length=255)
    content: str | None = Field(None, max_length=200_000)
    summary: str | None = Field(None, max_length=500)
    categories: list[str] | None = None
    tags: list[str] | None = None
    internal_links: list[str] | None = None
    is_published: bool | None = None


class PostResponse(BaseModel):
    """对外返回的文章信息。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    content: str
    summary: str
    categories: list[str]
    tags: list[str]
    internal_links: list[str]
    is_published: bool
    created_at: datetime
