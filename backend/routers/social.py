"""评论 & 点赞接口"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user
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
def toggle_like(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """切换点赞状态：未点赞 → 点赞；已点赞 → 取消点赞。"""
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = (
        db.query(Like)
        .filter(Like.user_id == current_user.id, Like.post_id == post.id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        like = Like(user_id=current_user.id, post_id=post.id)
        db.add(like)
        db.commit()
        liked = True

    count = db.query(Like).filter(Like.post_id == post.id).count()
    return LikeStatus(liked=liked, count=count)


@router.get("/posts/{slug}/like/status", response_model=LikeStatus)
def get_like_status(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """查询当前用户对某篇文章的点赞状态和总数。"""
    post = db.query(Post).filter(Post.slug == slug).first()
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
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post.id, Comment.is_visible == True)
        .order_by(Comment.created_at.asc())
        .all()
    )

    return _build_comment_tree(comments)


@router.post(
    "/posts/{slug}/comments",
    response_model=CommentOut,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    slug: str,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """发表评论（需要登录）。"""
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 如果是回复，检查父评论是否存在且属于同一篇文章
    if data.parent_id:
        parent = db.query(Comment).filter(Comment.id == data.parent_id).first()
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
    """删除评论（仅作者本人或管理员）。"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()
    return None
