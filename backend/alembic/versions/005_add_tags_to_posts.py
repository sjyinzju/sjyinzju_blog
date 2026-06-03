"""add tags column to posts

Revision ID: 005
Revises: 004
Create Date: 2026-06-03
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "posts",
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_column("posts", "tags")
