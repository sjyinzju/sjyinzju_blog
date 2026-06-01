from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_admin
from models.post import Post
from models.user import User
from schemas.post import PostCreate, PostResponse, PostUpdate

router = APIRouter(prefix="/posts", tags=["posts"])


# ── 公开读取 ──────────────────────────────────────────────


@router.get("/", response_model=list[PostResponse])
def list_posts(db: Session = Depends(get_db)):
    return db.query(Post).filter(Post.is_published == True).all()


@router.get("/{slug}", response_model=PostResponse)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# ── 管理员写入 ──────────────────────────────────────────────


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    """创建文章（仅管理员）。"""
    db_post = Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.put("/{slug}", response_model=PostResponse)
def update_post(
    slug: str,
    post: PostUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    """编辑文章（仅管理员，按 slug 定位，部分更新）。"""
    db_post = db.query(Post).filter(Post.slug == slug).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    update_data = post.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    for field, value in update_data.items():
        setattr(db_post, field, value)

    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    slug: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    """删除文章（仅管理员，按 slug 定位）。"""
    db_post = db.query(Post).filter(Post.slug == slug).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(db_post)
    db.commit()
    return None
