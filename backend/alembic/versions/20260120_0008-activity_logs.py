"""activity logs - add activity_logs table for tracking user and anonymous activity

Revision ID: 008
Revises: 007
Create Date: 2026-01-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '008'
down_revision: Union[str, None] = '007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create activity_logs table
    op.create_table(
        'activity_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('session_id', sa.String(100), nullable=False),
        sa.Column('action_type', sa.String(50), nullable=False),
        sa.Column('page', sa.String(255), nullable=True),
        sa.Column('details', postgresql.JSONB(), server_default='{}'),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Create indexes
    op.create_index('ix_activity_logs_user_id', 'activity_logs', ['user_id'])
    op.create_index('ix_activity_logs_session_id', 'activity_logs', ['session_id'])
    op.create_index('ix_activity_logs_action_type', 'activity_logs', ['action_type'])
    op.create_index('ix_activity_logs_created_at', 'activity_logs', ['created_at'])
    op.create_index('ix_activity_logs_user_id_created_at', 'activity_logs', ['user_id', 'created_at'])
    op.create_index('ix_activity_logs_action_type_created_at', 'activity_logs', ['action_type', 'created_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_activity_logs_action_type_created_at', table_name='activity_logs')
    op.drop_index('ix_activity_logs_user_id_created_at', table_name='activity_logs')
    op.drop_index('ix_activity_logs_created_at', table_name='activity_logs')
    op.drop_index('ix_activity_logs_action_type', table_name='activity_logs')
    op.drop_index('ix_activity_logs_session_id', table_name='activity_logs')
    op.drop_index('ix_activity_logs_user_id', table_name='activity_logs')

    # Drop table
    op.drop_table('activity_logs')
