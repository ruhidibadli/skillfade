"""Phase 2 features: Freshness targets

Revision ID: 003
Revises: 002
Create Date: 2026-01-10 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add target_freshness column to skills table
    op.add_column('skills',
        sa.Column('target_freshness', sa.Float(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('skills', 'target_freshness')
