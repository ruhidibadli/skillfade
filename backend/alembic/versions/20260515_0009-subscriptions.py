"""subscriptions - add subscriptions table for lifetime PRO via Epoint

Revision ID: 009
Revises: 008
Create Date: 2026-05-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '009'
down_revision: Union[str, None] = '008'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('plan', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('provider', sa.String(20), nullable=False, server_default='epoint'),
        sa.Column('order_id', sa.String(64), nullable=True),
        sa.Column('epoint_transaction', sa.String(64), nullable=True),
        sa.Column('epoint_bank_transaction', sa.String(64), nullable=True),
        sa.Column('epoint_rrn', sa.String(32), nullable=True),
        sa.Column('epoint_code', sa.String(8), nullable=True),
        sa.Column('card_mask', sa.String(20), nullable=True),
        sa.Column('card_name', sa.String(100), nullable=True),
        sa.Column('purchased_at', sa.DateTime(), nullable=True),
        sa.Column('refunded_at', sa.DateTime(), nullable=True),
        sa.Column('amount', sa.Numeric(10, 2), nullable=True),
        sa.Column('currency', sa.String(3), nullable=False, server_default='AZN'),
        sa.Column('raw_callback', postgresql.JSONB(), server_default='{}', nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    op.create_index('ix_subscriptions_user_id', 'subscriptions', ['user_id'])
    op.create_index('ix_subscriptions_status', 'subscriptions', ['status'])
    op.create_index('ix_subscriptions_order_id', 'subscriptions', ['order_id'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_subscriptions_order_id', table_name='subscriptions')
    op.drop_index('ix_subscriptions_status', table_name='subscriptions')
    op.drop_index('ix_subscriptions_user_id', table_name='subscriptions')
    op.drop_table('subscriptions')
