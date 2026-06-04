"""add is_deleted and deleted_at to posts and comments

Revision ID: 007
Revises: 006
Create Date: 2026-06-04
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── posts ──
    op.add_column(
        "posts",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.create_index(op.f("ix_posts_is_deleted"), "posts", ["is_deleted"])
    op.add_column(
        "posts",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # ── comments ──
    op.add_column(
        "comments",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.create_index(op.f("ix_comments_is_deleted"), "comments", ["is_deleted"])
    op.add_column(
        "comments",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_comments_is_deleted"), table_name="comments")
    op.drop_column("comments", "deleted_at")
    op.drop_column("comments", "is_deleted")

    op.drop_index(op.f("ix_posts_is_deleted"), table_name="posts")
    op.drop_column("posts", "deleted_at")
    op.drop_column("posts", "is_deleted")
