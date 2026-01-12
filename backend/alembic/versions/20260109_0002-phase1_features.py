"""Phase 1 features: Custom decay rates and event templates

Revision ID: 002
Revises: 001
Create Date: 2026-01-09 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add decay_rate column to skills table
    op.add_column('skills',
        sa.Column('decay_rate', sa.Float(), nullable=False, server_default='0.02')
    )

    # Create event_templates table
    op.create_table('event_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('event_type', sa.String(length=20), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('default_duration_minutes', sa.Integer(), nullable=True),
        sa.Column('default_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('event_templates')
    op.drop_column('skills', 'decay_rate')
