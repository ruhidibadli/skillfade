"""grandfather users - grant free lifetime PRO to every pre-existing user

Revision ID: 010
Revises: 009
Create Date: 2026-05-15

"""
from typing import Sequence, Union

from alembic import op


revision: str = '010'
down_revision: Union[str, None] = '009'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


GRANDFATHER_NOTE = 'Auto-granted: registered before payment launch'


def upgrade() -> None:
    # Idempotent: only insert for users without any existing active subscription,
    # so re-running after a partial failure (or in a dev DB with manual rows)
    # never double-grandfathers anyone.
    op.execute(
        f"""
        INSERT INTO subscriptions (
            id, user_id, plan, status, provider, currency, notes, created_at, updated_at
        )
        SELECT
            gen_random_uuid(),
            u.id,
            'grandfathered',
            'active',
            'manual',
            'AZN',
            '{GRANDFATHER_NOTE}',
            NOW(),
            NOW()
        FROM users u
        WHERE NOT EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.user_id = u.id AND s.status = 'active'
        );
        """
    )


def downgrade() -> None:
    # Only remove rows this migration inserted. Manually-added grandfathered
    # rows by admins are untouched (they won't match the notes string).
    op.execute(
        f"""
        DELETE FROM subscriptions
        WHERE plan = 'grandfathered'
          AND provider = 'manual'
          AND notes = '{GRANDFATHER_NOTE}';
        """
    )
