"""rename posts.tags → posts.categories

Revision ID: 004
Revises: 003
Create Date: 2026-06-03
"""

from typing import Sequence, Union

from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("posts", "tags", new_column_name="categories")


def downgrade() -> None:
    op.alter_column("posts", "categories", new_column_name="tags")
