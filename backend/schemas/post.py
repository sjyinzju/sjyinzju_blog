from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PostCreate(BaseModel):
    title: str
    slug: str
    content: str
    summary: str
    tags: list[str] = []
    is_published: bool = True


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    content: str
    summary: str
    tags: list[str]
    is_published: bool
    created_at: datetime
