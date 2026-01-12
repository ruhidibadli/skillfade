from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.category import Category
from app.models.skill import Skill
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.auth import get_current_user
from uuid import UUID

router = APIRouter(prefix="/api/categories", tags=["Categories"])


def enrich_category(category: Category, db: Session) -> dict:
    """Add skill count to category response."""
    skill_count = db.query(func.count(Skill.id)).filter(
        Skill.category_id == category.id,
        Skill.archived_at.is_(None)
    ).scalar()

    return {
        "id": category.id,
        "user_id": category.user_id,
        "name": category.name,
        "created_at": category.created_at,
        "skill_count": skill_count
    }


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all categories for the current user.
    """
    categories = db.query(Category).filter(
        Category.user_id == current_user.id
    ).order_by(Category.name).all()

    return [enrich_category(cat, db) for cat in categories]


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new category.
    """
    # Check if category name already exists for this user
    existing_category = db.query(Category).filter(
        Category.user_id == current_user.id,
        Category.name == category_data.name
    ).first()

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )

    # Create new category
    new_category = Category(
        user_id=current_user.id,
        name=category_data.name
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return enrich_category(new_category, db)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific category by ID.
    """
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return enrich_category(category, db)


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: UUID,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a category's name.
    """
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Update name if provided
    if category_data.name is not None:
        # Check for duplicate name
        existing_category = db.query(Category).filter(
            Category.user_id == current_user.id,
            Category.name == category_data.name,
            Category.id != category_id
        ).first()

        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )

        category.name = category_data.name

    db.commit()
    db.refresh(category)

    return enrich_category(category, db)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a category. Skills in this category will have their category set to null.
    """
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    db.delete(category)
    db.commit()

    return None
