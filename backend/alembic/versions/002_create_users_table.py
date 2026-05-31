"""create users table

Revision ID: 002
Revises: 001
Create Date: 2026-05-31

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        # ── 主键（UID，从 1 开始自增） ──
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        # ── 注册 / 登录 ──
        sa.Column("email", sa.String(320), nullable=False, unique=True, index=True),
        sa.Column("username", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(128), nullable=False),
        # ── 个人展示 ──
        sa.Column("avatar", sa.String(512), nullable=False, server_default=""),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("website", sa.String(512), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        # ── 内部管理 ──
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade() -> None:
    op.drop_table("users")
