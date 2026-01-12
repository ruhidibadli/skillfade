"""Category as object

Revision ID: 005
Revises: 004
Create Date: 2026-01-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'name', name='uq_user_category_name')
    )
    op.create_index('ix_categories_user_id', 'categories', ['user_id'])

    # Add category_id column to skills table
    op.add_column('skills', sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_skills_category_id', 'skills', 'categories', ['category_id'], ['id'], ondelete='SET NULL')
    op.create_index('ix_skills_category_id', 'skills', ['category_id'])

    # Migrate existing category data: create categories from unique skill categories and link them
    # This is done in raw SQL to handle the data migration
    conn = op.get_bind()

    # Get all unique user_id + category combinations where category is not null
    result = conn.execute(sa.text("""
        SELECT DISTINCT user_id, category
        FROM skills
        WHERE category IS NOT NULL AND category != ''
    """))

    for row in result:
        user_id = row[0]
        category_name = row[1]

        # Create category
        conn.execute(sa.text("""
            INSERT INTO categories (id, user_id, name, created_at)
            VALUES (gen_random_uuid(), :user_id, :name, NOW())
        """), {"user_id": user_id, "name": category_name})

        # Get the created category id
        cat_result = conn.execute(sa.text("""
            SELECT id FROM categories WHERE user_id = :user_id AND name = :name
        """), {"user_id": user_id, "name": category_name})
        cat_row = cat_result.fetchone()

        if cat_row:
            category_id = cat_row[0]
            # Update skills to reference the category
            conn.execute(sa.text("""
                UPDATE skills SET category_id = :category_id
                WHERE user_id = :user_id AND category = :name
            """), {"category_id": category_id, "user_id": user_id, "name": category_name})

    # Drop the old category column
    op.drop_column('skills', 'category')


def downgrade() -> None:
    # Add back the category column
    op.add_column('skills', sa.Column('category', sa.String(50), nullable=True))

    # Migrate data back: copy category names from categories table
    conn = op.get_bind()
    conn.execute(sa.text("""
        UPDATE skills s
        SET category = c.name
        FROM categories c
        WHERE s.category_id = c.id
    """))

    # Drop the foreign key and category_id column
    op.drop_index('ix_skills_category_id', 'skills')
    op.drop_constraint('fk_skills_category_id', 'skills', type_='foreignkey')
    op.drop_column('skills', 'category_id')

    # Drop categories table
    op.drop_index('ix_categories_user_id', 'categories')
    op.drop_table('categories')
