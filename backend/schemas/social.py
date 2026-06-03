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


# ═══════ 知识图谱 ═══════


class GraphNode(BaseModel):
    id: str
    label: str
    group: str       # "category" | "tag" | "article"
    val: int         # 节点大小
    slug: str = ""   # 仅 article 节点携带，用于前端跳转


class GraphLink(BaseModel):
    source: str   # 起点节点 id
    target: str   # 终点节点 id


class GraphData(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]
