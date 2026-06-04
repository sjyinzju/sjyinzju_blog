"""活动统计接口"""

from collections import defaultdict
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from models.comment import Comment
from models.post import Post

router = APIRouter(prefix="/stats", tags=["Stats"])


def _calc_level(count: int) -> int:
    """将数量映射到 0-4 级。"""
    if count == 0:
        return 0
    if count <= 2:
        return 1
    if count <= 4:
        return 2
    if count <= 7:
        return 3
    return 4


@router.get("/heatmap")
def activity_heatmap(db: Session = Depends(get_db)):
    """返回 8 个月滑动窗口的活动数据，含未来空白天。"""
    today = date.today()
    # 约 3 个月前 + 3 个月后 = 6 个月窗口
    start = today - timedelta(days=92)
    end = today + timedelta(days=90)

    # 每日发布数
    post_rows = (
        db.query(Post.created_at, Post.title, Post.slug, Post.categories, Post.tags)
        .filter(
            Post.is_published == True,
            Post.is_deleted == False,
            Post.created_at >= start,
            Post.created_at < end + timedelta(days=1),
        )
        .all()
    )

    # 每日评论数
    comment_rows = (
        db.query(Comment.created_at)
        .filter(
            Comment.is_visible == True,
            Comment.is_deleted == False,
            Comment.created_at >= start,
            Comment.created_at < end + timedelta(days=1),
        )
        .all()
    )

    # 按日聚合
    day_map: dict[str, int] = defaultdict(int)
    for (dt, *_) in post_rows:
        day_map[str(dt.date())] += 1
    for (dt,) in comment_rows:
        day_map[str(dt.date())] += 1

    total_days = (end - start).days + 1
    result = []
    for i in range(total_days):
        d = start + timedelta(days=i)
        ds = str(d)
        count = day_map.get(ds, 0)
        result.append({"date": ds, "count": count, "level": _calc_level(count)})

    return result


@router.get("/activity")
def day_activity(
    date: str = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """返回某日发布的所有文章和评论详情。"""
    try:
        target = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        target = date.today()

    next_day = target + timedelta(days=1)

    posts = (
        db.query(Post)
        .filter(
            Post.is_published == True,
            Post.is_deleted == False,
            Post.created_at >= target,
            Post.created_at < next_day,
        )
        .order_by(Post.created_at.desc())
        .all()
    )

    comments = (
        db.query(Comment)
        .filter(
            Comment.is_visible == True,
            Comment.is_deleted == False,
            Comment.created_at >= target,
            Comment.created_at < next_day,
        )
        .order_by(Comment.created_at.asc())
        .all()
    )

    return {
        "date": str(target),
        "posts": [
            {
                "title": p.title,
                "slug": p.slug,
                "summary": p.summary,
                "categories": p.categories,
                "tags": p.tags,
                "created_at": p.created_at.isoformat(),
            }
            for p in posts
        ],
        "comments": [
            {
                "id": c.id,
                "user_id": c.user_id,
                "username": c.user.username if c.user else "",
                "content": c.content,
                "post_id": c.post_id,
                "created_at": c.created_at.isoformat(),
            }
            for c in comments
        ],
    }
