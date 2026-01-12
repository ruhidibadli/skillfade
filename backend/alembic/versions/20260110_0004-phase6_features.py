"""Phase 6 features: Skill notes and dependencies

Revision ID: 004
Revises: 003
Create Date: 2026-01-10 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add notes column to skills table
    op.add_column('skills',
        sa.Column('notes', sa.Text(), nullable=True)
    )

    # Create skill_dependencies table for many-to-many relationship
    op.create_table(
        'skill_dependencies',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('depends_on_id', UUID(as_uuid=True), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('skill_id', 'depends_on_id', name='uq_skill_dependency')
    )

    # Create indexes for faster lookups
    op.create_index('ix_skill_dependencies_skill_id', 'skill_dependencies', ['skill_id'])
    op.create_index('ix_skill_dependencies_depends_on_id', 'skill_dependencies', ['depends_on_id'])


def downgrade() -> None:
    op.drop_index('ix_skill_dependencies_depends_on_id')
    op.drop_index('ix_skill_dependencies_skill_id')
    op.drop_table('skill_dependencies')
    op.drop_column('skills', 'notes')
