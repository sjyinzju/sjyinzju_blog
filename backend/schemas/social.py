from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ═══════ 评论 ═══════


class CommentCreate(BaseModel):
    """发表评论请求体。"""
    content: str
    parent_id: int | None = None


class CommentOut(BaseModel):
    """对外返回的评论（含嵌套回复）。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    username: str = ""
    avatar: str = ""
    post_id: int
    parent_id: int | None = None
    content: str
    created_at: datetime
    replies: list["CommentOut"] = []

    @classmethod
    def from_orm_with_user(cls, obj) -> "CommentOut":
        return cls(
            id=obj.id,
            user_id=obj.user_id,
            username=obj.user.username if obj.user else "",
            avatar=obj.user.avatar if obj.user else "",
            post_id=obj.post_id,
            parent_id=obj.parent_id,
            content=obj.content,
            created_at=obj.created_at,
            replies=[],
        )


# ═══════ 点赞 ═══════


class LikeStatus(BaseModel):
    """当前用户对某篇文章的点赞状态。"""
    liked: bool
    count: int
