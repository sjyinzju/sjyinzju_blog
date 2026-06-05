"""add pgvector extension and embedding column to posts

Revision ID: 008
Revises: 007
Create Date: 2026-06-05
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision: str = "008"
down_revision: Union[str, None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. 启用 pgvector 扩展 ──
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # ── 2. 为 posts 表添加 embedding 向量列 ──
    op.add_column(
        "posts",
        sa.Column(
            "embedding",
            Vector(1024),
            nullable=True,
        ),
    )

    # ── 3. 为 embedding 列建立 IVFFlat 索引（加速近似检索） ──
    # 注意：IVFFlat 索引需要在表中有一定数据量后创建才有效，
    # 此处先建索引框架，后续通过 blog_reindex 填充数据后自动激活。
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_class WHERE relname = 'ix_posts_embedding'
            ) THEN
                CREATE INDEX ix_posts_embedding
                ON posts
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 10);
            END IF;
        END
        $$;
        """
    )


def downgrade() -> None:
    op.drop_index("ix_posts_embedding", table_name="posts", if_exists=True)
    op.drop_column("posts", "embedding")
    # 不删除 vector 扩展，其他表/未来可能复用
