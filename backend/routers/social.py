"""评论 & 点赞接口"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user
from core.limiter import limiter
from models.comment import Comment
from models.like import Like
from models.post import Post
from models.user import User
from schemas.social import CommentCreate, CommentOut, LikeStatus

router = APIRouter(tags=["Social"])


# ═══════════════════════════════════════════════════════════════════
#  点赞
# ═══════════════════════════════════════════════════════════════════


@router.post("/posts/{slug}/like", response_model=LikeStatus)
@limiter.limit("10/minute")
def toggle_like(
    request: Request,
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """切换点赞状态：未点赞 → 点赞；已点赞 → 取消点赞。

    使用 PostgreSQL INSERT ... ON CONFLICT DO NOTHING 实现原子级切换，
    消除并发场景下的读-判-写竞态窗口。
    """
    post = db.query(Post).filter(Post.slug == slug, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    stmt = (
        pg_insert(Like)
        .values(user_id=current_user.id, post_id=post.id)
        .on_conflict_do_nothing(constraint="uq_like_user_post")
    )
    result = db.execute(stmt)

    if result.rowcount > 0:
        # 插入成功 → 之前未点赞，现在已点赞
        liked = True
    else:
        # 冲突 → 已存在，执行取消赞
        db.query(Like).filter(
            Like.user_id == current_user.id, Like.post_id == post.id
        ).delete()
        liked = False

    db.commit()
    count = db.query(Like).filter(Like.post_id == post.id).count()
    return LikeStatus(liked=liked, count=count)


@router.get("/posts/{slug}/like/status", response_model=LikeStatus)
def get_like_status(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """查询当前用户对某篇文章的点赞状态和总数。"""
    post = db.query(Post).filter(Post.slug == slug, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    liked = (
        db.query(Like)
        .filter(Like.user_id == current_user.id, Like.post_id == post.id)
        .first()
        is not None
    )
    count = db.query(Like).filter(Like.post_id == post.id).count()
    return LikeStatus(liked=liked, count=count)


# ═══════════════════════════════════════════════════════════════════
#  评论
# ═══════════════════════════════════════════════════════════════════


def _build_comment_tree(comments: list[Comment]) -> list[CommentOut]:
    """将扁平的评论列表组装成树形结构。"""
    items: dict[int, CommentOut] = {}
    roots: list[CommentOut] = []

    for c in comments:
        items[c.id] = CommentOut.from_orm_with_user(c)

    for c in comments:
        out = items[c.id]
        if c.parent_id and c.parent_id in items:
            items[c.parent_id].replies.append(out)
        else:
            roots.append(out)

    return roots


@router.get("/posts/{slug}/comments", response_model=list[CommentOut])
def list_comments(slug: str, db: Session = Depends(get_db)):
    """获取某篇文章的评论树（公开）。"""
    post = db.query(Post).filter(Post.slug == slug, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post.id, Comment.is_visible == True, Comment.is_deleted == False)
        .order_by(Comment.created_at.asc())
        .all()
    )

    return _build_comment_tree(comments)


@router.post(
    "/posts/{slug}/comments",
    response_model=CommentOut,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("10/minute")
def create_comment(
    request: Request,
    slug: str,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """发表评论（需要登录）。"""
    post = db.query(Post).filter(Post.slug == slug, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 如果是回复，检查父评论是否存在且属于同一篇文章
    if data.parent_id:
        parent = db.query(Comment).filter(Comment.id == data.parent_id, Comment.is_deleted == False).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        if parent.post_id != post.id:
            raise HTTPException(status_code=400, detail="Parent comment belongs to another post")

    comment = Comment(
        user_id=current_user.id,
        post_id=post.id,
        parent_id=data.parent_id,
        content=data.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentOut.from_orm_with_user(comment)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """软删除评论（仅作者本人或管理员）。"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    comment.is_deleted = True
    comment.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return None
