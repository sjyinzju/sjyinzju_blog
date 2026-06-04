from collections import Counter
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import cast, or_, String
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_admin
from models.post import Post
from models.user import User
from schemas.post import PostCreate, PostResponse, PostUpdate
from schemas.social import GraphData, GraphLink, GraphNode

router = APIRouter(prefix="/posts", tags=["posts"])


# ── 公开读取 ──────────────────────────────────────────────


@router.get("/", response_model=list[PostResponse])
def list_posts(db: Session = Depends(get_db)):
    return db.query(Post).filter(Post.is_published == True, Post.is_deleted == False).all()


@router.get("/search", response_model=list[PostResponse])
def search_posts(q: str = Query(""), db: Session = Depends(get_db)):
    """搜索已发布文章：标题或 tags 包含关键字（大小写不敏感）。"""
    if not q.strip():
        return []
    pattern = f"%{q.strip()}%"
    return (
        db.query(Post)
        .filter(
            Post.is_published == True,
            Post.is_deleted == False,
            or_(
                Post.title.ilike(pattern),
                cast(Post.tags, String).ilike(pattern),
            ),
        )
        .order_by(Post.created_at.desc())
        .all()
    )


@router.get("/tags/top")
def top_tags(limit: int = Query(5, ge=1, le=20), db: Session = Depends(get_db)):
    """返回使用频率最高的标签，最多 limit 个。"""
    rows = db.query(Post.tags).filter(Post.is_published == True, Post.is_deleted == False).all()
    counter: Counter = Counter()
    for (tags,) in rows:
        if tags:
            for tag in tags:
                counter[tag] += 1
    return [{"tag": tag, "count": count} for tag, count in counter.most_common(limit)]


# 有效分类（与前端子页面对应）
VALID_CATEGORIES = {"笔记", "思考", "灵感", "资源"}

@router.get("/graph", response_model=GraphData)
def post_graph(db: Session = Depends(get_db)):
    """生成博客知识图谱：分类 → 标签 → 文章 的力导向图数据。"""
    posts = db.query(Post).filter(Post.is_published == True, Post.is_deleted == False).all()

    nodes: dict[str, GraphNode] = {}
    links: list[GraphLink] = []

    # Build slug→id lookup for internal_links resolution
    slug_to_id: dict[str, str] = {}

    for post in posts:
        article_id = f"article:{post.slug}"

        # ── 文章节点 ──
        if article_id not in nodes:
            nodes[article_id] = GraphNode(
                id=article_id,
                label=post.title,
                group="article",
                val=5,
                slug=post.slug,
            )
        slug_to_id[post.slug] = article_id

        # ── 分类节点（仅有效分类，类型内去重） ──
        for cat in post.categories:
            if cat not in VALID_CATEGORIES:
                continue
            cat_id = f"category:{cat}"
            if cat_id not in nodes:
                nodes[cat_id] = GraphNode(
                    id=cat_id, label=cat, group="category", val=12
                )
            links.append(GraphLink(source=cat_id, target=article_id))

        # ── 标签节点（类型内去重） ──
        for tag in post.tags:
            tag_id = f"tag:{tag}"
            if tag_id not in nodes:
                nodes[tag_id] = GraphNode(
                    id=tag_id, label=tag, group="tag", val=8
                )
            links.append(GraphLink(source=tag_id, target=article_id))

    # ── 双向链接连线（文章 → 文章） ──
    for post in posts:
        article_id = f"article:{post.slug}"
        for target_slug in post.internal_links:
            target_id = slug_to_id.get(target_slug)
            if target_id and target_id != article_id:
                links.append(GraphLink(source=article_id, target=target_id))

    # 去重 links
    seen = set()
    unique_links: list[GraphLink] = []
    for link in links:
        key = (link.source, link.target)
        if key not in seen:
            seen.add(key)
            unique_links.append(link)

    return GraphData(nodes=list(nodes.values()), links=unique_links)


@router.get("/{slug}", response_model=PostResponse)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug, Post.is_deleted == False).first()
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
    """软删除文章（仅管理员，按 slug 定位）。"""
    db_post = db.query(Post).filter(Post.slug == slug).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db_post.is_deleted = True
    db_post.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return None
