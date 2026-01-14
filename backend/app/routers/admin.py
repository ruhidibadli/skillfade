from datetime import datetime, timedelta
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.core.database import get_db
from app.core.security import get_password_hash
from app.services.auth import get_current_admin_user
from app.services.freshness import calculate_freshness
from app.models.user import User
from app.models.skill import Skill
from app.models.category import Category
from app.models.event import LearningEvent, PracticeEvent
from app.models.event_template import EventTemplate
from app.schemas.admin import (
    AdminUserCreate, AdminUserUpdate, AdminUserResponse,
    AdminCategoryCreate, AdminCategoryUpdate, AdminCategoryResponse,
    AdminSkillCreate, AdminSkillUpdate, AdminSkillResponse,
    AdminLearningEventCreate, AdminLearningEventUpdate, AdminLearningEventResponse,
    AdminPracticeEventCreate, AdminPracticeEventUpdate, AdminPracticeEventResponse,
    AdminEventTemplateCreate, AdminEventTemplateUpdate, AdminEventTemplateResponse,
    AdminDashboardStats
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ==================== Dashboard Stats ====================
@router.get("/stats", response_model=AdminDashboardStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get admin dashboard statistics."""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    return AdminDashboardStats(
        total_users=db.query(User).count(),
        total_skills=db.query(Skill).count(),
        total_categories=db.query(Category).count(),
        total_learning_events=db.query(LearningEvent).count(),
        total_practice_events=db.query(PracticeEvent).count(),
        total_templates=db.query(EventTemplate).count(),
        users_last_7_days=db.query(User).filter(User.created_at >= seven_days_ago).count(),
        events_last_7_days=(
            db.query(LearningEvent).filter(LearningEvent.created_at >= seven_days_ago).count() +
            db.query(PracticeEvent).filter(PracticeEvent.created_at >= seven_days_ago).count()
        )
    )


# ==================== Users CRUD ====================
@router.get("/users", response_model=dict)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_admin: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all users with pagination and filtering."""
    query = db.query(User)

    # Apply filters
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    if is_admin is not None:
        query = query.filter(User.is_admin == is_admin)

    # Get total count
    total = query.count()

    # Apply pagination
    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    # Build response with counts
    items = []
    for user in users:
        items.append({
            "id": user.id,
            "email": user.email,
            "is_admin": user.is_admin,
            "settings": user.settings or {},
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "skills_count": db.query(Skill).filter(Skill.user_id == user.id).count(),
            "learning_events_count": db.query(LearningEvent).filter(LearningEvent.user_id == user.id).count(),
            "practice_events_count": db.query(PracticeEvent).filter(PracticeEvent.user_id == user.id).count()
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/users/{user_id}", response_model=AdminUserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "is_admin": user.is_admin,
        "settings": user.settings or {},
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "skills_count": db.query(Skill).filter(Skill.user_id == user.id).count(),
        "learning_events_count": db.query(LearningEvent).filter(LearningEvent.user_id == user.id).count(),
        "practice_events_count": db.query(PracticeEvent).filter(PracticeEvent.user_id == user.id).count()
    }


@router.get("/users/{user_id}/details")
def get_user_full_details(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get comprehensive user details including all their data."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all categories
    categories = db.query(Category).filter(Category.user_id == user.id).order_by(Category.name).all()
    categories_data = []
    for cat in categories:
        skills_count = db.query(Skill).filter(Skill.category_id == cat.id).count()
        categories_data.append({
            "id": cat.id,
            "name": cat.name,
            "created_at": cat.created_at,
            "skills_count": skills_count
        })

    # Get all skills with freshness
    skills = db.query(Skill).filter(Skill.user_id == user.id).order_by(Skill.created_at.desc()).all()
    skills_data = []
    for skill in skills:
        category = db.query(Category).filter(Category.id == skill.category_id).first() if skill.category_id else None
        learning_events = db.query(LearningEvent).filter(LearningEvent.skill_id == skill.id).all()
        practice_events = db.query(PracticeEvent).filter(PracticeEvent.skill_id == skill.id).all()
        freshness = calculate_freshness(
            skill_created_at=skill.created_at.date() if hasattr(skill.created_at, 'date') else skill.created_at,
            learning_events=[(e.date, e.type) for e in learning_events],
            practice_events=[(e.date, e.type) for e in practice_events],
            base_decay_rate=skill.decay_rate or 0.02
        )
        skills_data.append({
            "id": skill.id,
            "name": skill.name,
            "category_id": skill.category_id,
            "category_name": category.name if category else None,
            "decay_rate": skill.decay_rate,
            "target_freshness": skill.target_freshness,
            "notes": skill.notes,
            "created_at": skill.created_at,
            "archived_at": skill.archived_at,
            "learning_events_count": len(learning_events),
            "practice_events_count": len(practice_events),
            "freshness": freshness
        })

    # Get all learning events
    learning_events = db.query(LearningEvent).filter(
        LearningEvent.user_id == user.id
    ).order_by(LearningEvent.date.desc()).all()
    learning_events_data = []
    for event in learning_events:
        skill = db.query(Skill).filter(Skill.id == event.skill_id).first()
        learning_events_data.append({
            "id": event.id,
            "skill_id": event.skill_id,
            "skill_name": skill.name if skill else None,
            "date": event.date,
            "type": event.type,
            "notes": event.notes,
            "duration_minutes": event.duration_minutes,
            "created_at": event.created_at
        })

    # Get all practice events
    practice_events = db.query(PracticeEvent).filter(
        PracticeEvent.user_id == user.id
    ).order_by(PracticeEvent.date.desc()).all()
    practice_events_data = []
    for event in practice_events:
        skill = db.query(Skill).filter(Skill.id == event.skill_id).first()
        practice_events_data.append({
            "id": event.id,
            "skill_id": event.skill_id,
            "skill_name": skill.name if skill else None,
            "date": event.date,
            "type": event.type,
            "notes": event.notes,
            "duration_minutes": event.duration_minutes,
            "created_at": event.created_at
        })

    # Get all templates
    templates = db.query(EventTemplate).filter(
        EventTemplate.user_id == user.id
    ).order_by(EventTemplate.created_at.desc()).all()
    templates_data = []
    for template in templates:
        templates_data.append({
            "id": template.id,
            "name": template.name,
            "event_type": template.event_type,
            "type": template.type,
            "default_duration_minutes": template.default_duration_minutes,
            "default_notes": template.default_notes,
            "created_at": template.created_at
        })

    # Calculate summary statistics
    total_learning_minutes = sum(e.duration_minutes or 0 for e in learning_events)
    total_practice_minutes = sum(e.duration_minutes or 0 for e in practice_events)
    active_skills = len([s for s in skills if s.archived_at is None])
    archived_skills = len([s for s in skills if s.archived_at is not None])
    avg_freshness = sum(s["freshness"] for s in skills_data if s["freshness"] is not None and s["archived_at"] is None) / active_skills if active_skills > 0 else 0

    # Get recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_learning = db.query(LearningEvent).filter(
        LearningEvent.user_id == user.id,
        LearningEvent.date >= thirty_days_ago.date()
    ).count()
    recent_practice = db.query(PracticeEvent).filter(
        PracticeEvent.user_id == user.id,
        PracticeEvent.date >= thirty_days_ago.date()
    ).count()

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "is_admin": user.is_admin,
            "settings": user.settings or {},
            "created_at": user.created_at,
            "updated_at": user.updated_at
        },
        "summary": {
            "total_skills": len(skills),
            "active_skills": active_skills,
            "archived_skills": archived_skills,
            "total_categories": len(categories),
            "total_learning_events": len(learning_events),
            "total_practice_events": len(practice_events),
            "total_templates": len(templates),
            "total_learning_minutes": total_learning_minutes,
            "total_practice_minutes": total_practice_minutes,
            "average_freshness": round(avg_freshness, 1),
            "recent_learning_events": recent_learning,
            "recent_practice_events": recent_practice
        },
        "categories": categories_data,
        "skills": skills_data,
        "learning_events": learning_events_data,
        "practice_events": practice_events_data,
        "templates": templates_data
    }


@router.post("/users", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new user."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=get_password_hash(data.password),
        is_admin=data.is_admin,
        settings={}
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "is_admin": user.is_admin,
        "settings": user.settings or {},
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "skills_count": 0,
        "learning_events_count": 0,
        "practice_events_count": 0
    }


@router.patch("/users/{user_id}", response_model=AdminUserResponse)
def update_user(
    user_id: UUID,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.email is not None:
        existing = db.query(User).filter(User.email == data.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = data.email

    if data.password is not None:
        user.password_hash = get_password_hash(data.password)

    if data.is_admin is not None:
        user.is_admin = data.is_admin

    if data.settings is not None:
        user.settings = data.settings

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "is_admin": user.is_admin,
        "settings": user.settings or {},
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "skills_count": db.query(Skill).filter(Skill.user_id == user.id).count(),
        "learning_events_count": db.query(LearningEvent).filter(LearningEvent.user_id == user.id).count(),
        "practice_events_count": db.query(PracticeEvent).filter(PracticeEvent.user_id == user.id).count()
    }


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a user and all their data."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account from admin panel")

    db.delete(user)
    db.commit()


# ==================== Categories CRUD ====================
@router.get("/categories", response_model=dict)
def list_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    user_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all categories with pagination and filtering."""
    query = db.query(Category)

    if search:
        query = query.filter(Category.name.ilike(f"%{search}%"))
    if user_id:
        query = query.filter(Category.user_id == user_id)

    total = query.count()
    categories = query.order_by(Category.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for cat in categories:
        user = db.query(User).filter(User.id == cat.user_id).first()
        items.append({
            "id": cat.id,
            "name": cat.name,
            "user_id": cat.user_id,
            "created_at": cat.created_at,
            "user_email": user.email if user else None,
            "skills_count": db.query(Skill).filter(Skill.category_id == cat.id).count()
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/categories/{category_id}", response_model=AdminCategoryResponse)
def get_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific category."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    user = db.query(User).filter(User.id == cat.user_id).first()
    return {
        "id": cat.id,
        "name": cat.name,
        "user_id": cat.user_id,
        "created_at": cat.created_at,
        "user_email": user.email if user else None,
        "skills_count": db.query(Skill).filter(Skill.category_id == cat.id).count()
    }


@router.post("/categories", response_model=AdminCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: AdminCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new category."""
    # Verify user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    # Check for duplicate
    existing = db.query(Category).filter(
        Category.user_id == data.user_id,
        Category.name == data.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists for this user")

    cat = Category(name=data.name, user_id=data.user_id)
    db.add(cat)
    db.commit()
    db.refresh(cat)

    return {
        "id": cat.id,
        "name": cat.name,
        "user_id": cat.user_id,
        "created_at": cat.created_at,
        "user_email": user.email,
        "skills_count": 0
    }


@router.patch("/categories/{category_id}", response_model=AdminCategoryResponse)
def update_category(
    category_id: UUID,
    data: AdminCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a category."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    if data.name is not None:
        cat.name = data.name
    if data.user_id is not None:
        user = db.query(User).filter(User.id == data.user_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        cat.user_id = data.user_id

    db.commit()
    db.refresh(cat)

    user = db.query(User).filter(User.id == cat.user_id).first()
    return {
        "id": cat.id,
        "name": cat.name,
        "user_id": cat.user_id,
        "created_at": cat.created_at,
        "user_email": user.email if user else None,
        "skills_count": db.query(Skill).filter(Skill.category_id == cat.id).count()
    }


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a category."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(cat)
    db.commit()


# ==================== Skills CRUD ====================
@router.get("/skills", response_model=dict)
def list_skills(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    user_id: Optional[UUID] = None,
    category_id: Optional[UUID] = None,
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all skills with pagination and filtering."""
    query = db.query(Skill)

    if search:
        query = query.filter(Skill.name.ilike(f"%{search}%"))
    if user_id:
        query = query.filter(Skill.user_id == user_id)
    if category_id:
        query = query.filter(Skill.category_id == category_id)
    if not include_archived:
        query = query.filter(Skill.archived_at.is_(None))

    total = query.count()
    skills = query.order_by(Skill.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for skill in skills:
        user = db.query(User).filter(User.id == skill.user_id).first()
        category = db.query(Category).filter(Category.id == skill.category_id).first() if skill.category_id else None

        # Calculate freshness
        learning_events = db.query(LearningEvent).filter(LearningEvent.skill_id == skill.id).all()
        practice_events = db.query(PracticeEvent).filter(PracticeEvent.skill_id == skill.id).all()
        freshness = calculate_freshness(
            skill_created_at=skill.created_at.date() if hasattr(skill.created_at, 'date') else skill.created_at,
            learning_events=[(e.date, e.type) for e in learning_events],
            practice_events=[(e.date, e.type) for e in practice_events],
            base_decay_rate=skill.decay_rate or 0.02
        )

        items.append({
            "id": skill.id,
            "name": skill.name,
            "user_id": skill.user_id,
            "category_id": skill.category_id,
            "decay_rate": skill.decay_rate,
            "target_freshness": skill.target_freshness,
            "notes": skill.notes,
            "created_at": skill.created_at,
            "archived_at": skill.archived_at,
            "user_email": user.email if user else None,
            "category_name": category.name if category else None,
            "learning_events_count": len(learning_events),
            "practice_events_count": len(practice_events),
            "freshness": freshness
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/skills/{skill_id}", response_model=AdminSkillResponse)
def get_skill(
    skill_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific skill."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    user = db.query(User).filter(User.id == skill.user_id).first()
    category = db.query(Category).filter(Category.id == skill.category_id).first() if skill.category_id else None

    learning_events = db.query(LearningEvent).filter(LearningEvent.skill_id == skill.id).all()
    practice_events = db.query(PracticeEvent).filter(PracticeEvent.skill_id == skill.id).all()
    freshness = calculate_freshness(
        skill_created_at=skill.created_at.date() if hasattr(skill.created_at, 'date') else skill.created_at,
        learning_events=[(e.date, e.type) for e in learning_events],
        practice_events=[(e.date, e.type) for e in practice_events],
        base_decay_rate=skill.decay_rate or 0.02
    )

    return {
        "id": skill.id,
        "name": skill.name,
        "user_id": skill.user_id,
        "category_id": skill.category_id,
        "decay_rate": skill.decay_rate,
        "target_freshness": skill.target_freshness,
        "notes": skill.notes,
        "created_at": skill.created_at,
        "archived_at": skill.archived_at,
        "user_email": user.email if user else None,
        "category_name": category.name if category else None,
        "learning_events_count": len(learning_events),
        "practice_events_count": len(practice_events),
        "freshness": freshness
    }


@router.post("/skills", response_model=AdminSkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    data: AdminSkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new skill."""
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if data.category_id:
        category = db.query(Category).filter(Category.id == data.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")

    existing = db.query(Skill).filter(
        Skill.user_id == data.user_id,
        Skill.name == data.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists for this user")

    skill = Skill(
        name=data.name,
        user_id=data.user_id,
        category_id=data.category_id,
        decay_rate=data.decay_rate,
        target_freshness=data.target_freshness,
        notes=data.notes
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)

    category = db.query(Category).filter(Category.id == skill.category_id).first() if skill.category_id else None

    return {
        "id": skill.id,
        "name": skill.name,
        "user_id": skill.user_id,
        "category_id": skill.category_id,
        "decay_rate": skill.decay_rate,
        "target_freshness": skill.target_freshness,
        "notes": skill.notes,
        "created_at": skill.created_at,
        "archived_at": skill.archived_at,
        "user_email": user.email,
        "category_name": category.name if category else None,
        "learning_events_count": 0,
        "practice_events_count": 0,
        "freshness": 100.0
    }


@router.patch("/skills/{skill_id}", response_model=AdminSkillResponse)
def update_skill(
    skill_id: UUID,
    data: AdminSkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a skill."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    if data.name is not None:
        skill.name = data.name
    if data.user_id is not None:
        user = db.query(User).filter(User.id == data.user_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        skill.user_id = data.user_id
    if data.category_id is not None:
        skill.category_id = data.category_id
    if data.decay_rate is not None:
        skill.decay_rate = data.decay_rate
    if data.target_freshness is not None:
        skill.target_freshness = data.target_freshness
    if data.notes is not None:
        skill.notes = data.notes
    if data.archived_at is not None:
        skill.archived_at = data.archived_at

    db.commit()
    db.refresh(skill)

    user = db.query(User).filter(User.id == skill.user_id).first()
    category = db.query(Category).filter(Category.id == skill.category_id).first() if skill.category_id else None

    learning_events = db.query(LearningEvent).filter(LearningEvent.skill_id == skill.id).all()
    practice_events = db.query(PracticeEvent).filter(PracticeEvent.skill_id == skill.id).all()
    freshness = calculate_freshness(
        skill_created_at=skill.created_at.date() if hasattr(skill.created_at, 'date') else skill.created_at,
        learning_events=[(e.date, e.type) for e in learning_events],
        practice_events=[(e.date, e.type) for e in practice_events],
        base_decay_rate=skill.decay_rate or 0.02
    )

    return {
        "id": skill.id,
        "name": skill.name,
        "user_id": skill.user_id,
        "category_id": skill.category_id,
        "decay_rate": skill.decay_rate,
        "target_freshness": skill.target_freshness,
        "notes": skill.notes,
        "created_at": skill.created_at,
        "archived_at": skill.archived_at,
        "user_email": user.email if user else None,
        "category_name": category.name if category else None,
        "learning_events_count": len(learning_events),
        "practice_events_count": len(practice_events),
        "freshness": freshness
    }


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    skill_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a skill."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(skill)
    db.commit()


# ==================== Learning Events CRUD ====================
@router.get("/learning-events", response_model=dict)
def list_learning_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    user_id: Optional[UUID] = None,
    skill_id: Optional[UUID] = None,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all learning events with pagination and filtering."""
    query = db.query(LearningEvent)

    if search:
        query = query.filter(or_(
            LearningEvent.notes.ilike(f"%{search}%"),
            LearningEvent.type.ilike(f"%{search}%")
        ))
    if user_id:
        query = query.filter(LearningEvent.user_id == user_id)
    if skill_id:
        query = query.filter(LearningEvent.skill_id == skill_id)
    if event_type:
        query = query.filter(LearningEvent.type == event_type)

    total = query.count()
    events = query.order_by(LearningEvent.date.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for event in events:
        user = db.query(User).filter(User.id == event.user_id).first()
        skill = db.query(Skill).filter(Skill.id == event.skill_id).first()
        items.append({
            "id": event.id,
            "skill_id": event.skill_id,
            "user_id": event.user_id,
            "date": event.date,
            "type": event.type,
            "notes": event.notes,
            "duration_minutes": event.duration_minutes,
            "created_at": event.created_at,
            "user_email": user.email if user else None,
            "skill_name": skill.name if skill else None
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/learning-events/{event_id}", response_model=AdminLearningEventResponse)
def get_learning_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific learning event."""
    event = db.query(LearningEvent).filter(LearningEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Learning event not found")

    user = db.query(User).filter(User.id == event.user_id).first()
    skill = db.query(Skill).filter(Skill.id == event.skill_id).first()

    return {
        "id": event.id,
        "skill_id": event.skill_id,
        "user_id": event.user_id,
        "date": event.date,
        "type": event.type,
        "notes": event.notes,
        "duration_minutes": event.duration_minutes,
        "created_at": event.created_at,
        "user_email": user.email if user else None,
        "skill_name": skill.name if skill else None
    }


@router.post("/learning-events", response_model=AdminLearningEventResponse, status_code=status.HTTP_201_CREATED)
def create_learning_event(
    data: AdminLearningEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new learning event."""
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    skill = db.query(Skill).filter(Skill.id == data.skill_id).first()
    if not skill:
        raise HTTPException(status_code=400, detail="Skill not found")

    event = LearningEvent(
        skill_id=data.skill_id,
        user_id=data.user_id,
        date=data.date,
        type=data.type,
        notes=data.notes,
        duration_minutes=data.duration_minutes
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "id": event.id,
        "skill_id": event.skill_id,
        "user_id": event.user_id,
        "date": event.date,
        "type": event.type,
        "notes": event.notes,
        "duration_minutes": event.duration_minutes,
        "created_at": event.created_at,
        "user_email": user.email,
        "skill_name": skill.name
    }


@router.patch("/learning-events/{event_id}", response_model=AdminLearningEventResponse)
def update_learning_event(
    event_id: UUID,
    data: AdminLearningEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a learning event."""
    event = db.query(LearningEvent).filter(LearningEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Learning event not found")

    if data.skill_id is not None:
        event.skill_id = data.skill_id
    if data.user_id is not None:
        event.user_id = data.user_id
    if data.date is not None:
        event.date = data.date
    if data.type is not None:
        event.type = data.type
    if data.notes is not None:
        event.notes = data.notes
    if data.duration_minutes is not None:
        event.duration_minutes = data.duration_minutes

    db.commit()
    db.refresh(event)

    user = db.query(User).filter(User.id == event.user_id).first()
    skill = db.query(Skill).filter(Skill.id == event.skill_id).first()

    return {
        "id": event.id,
        "skill_id": event.skill_id,
        "user_id": event.user_id,
        "date": event.date,
        "type": event.type,
        "notes": event.notes,
        "duration_minutes": event.duration_minutes,
        "created_at": event.created_at,
        "user_email": user.email if user else None,
        "skill_name": skill.name if skill else None
    }


@router.delete("/learning-events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_learning_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a learning event."""
    event = db.query(LearningEvent).filter(LearningEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Learning event not found")

    db.delete(event)
    db.commit()


# ==================== Practice Events CRUD ====================
@router.get("/practice-events", response_model=dict)
def list_practice_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    user_id: Optional[UUID] = None,
    skill_id: Optional[UUID] = None,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all practice events with pagination and filtering."""
    query = db.query(PracticeEvent)

    if search:
        query = query.filter(or_(
            PracticeEvent.notes.ilike(f"%{search}%"),
            PracticeEvent.type.ilike(f"%{search}%")
        ))
    if user_id:
        query = query.filter(PracticeEvent.user_id == user_id)
    if skill_id:
        query = query.filter(PracticeEvent.skill_id == skill_id)
    if event_type:
        query = query.filter(PracticeEvent.type == event_type)

    total = query.count()
    events = query.order_by(PracticeEvent.date.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for event in events:
        user = db.query(User).filter(User.id == event.user_id).first()
        skill = db.query(Skill).filter(Skill.id == event.skill_id).first()
        items.append({
            "id": event.id,
            "skill_id": event.skill_id,
            "user_id": event.user_id,
            "date": event.date,
            "type": event.type,
            "notes": event.notes,
            "duration_minutes": event.duration_minutes,
            "created_at": event.created_at,
            "user_email": user.email if user else None,
            "skill_name": skill.name if skill else None
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/practice-events/{event_id}", response_model=AdminPracticeEventResponse)
def get_practice_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific practice event."""
    event = db.query(PracticeEvent).filter(PracticeEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Practice event not found")

    user = db.query(User).filter(User.id == event.user_id).first()
    skill = db.query(Skill).filter(Skill.id == event.skill_id).first()

    return {
        "id": event.id,
        "skill_id": event.skill_id,
        "user_id": event.user_id,
        "date": event.date,
        "type": event.type,
        "notes": event.notes,
        "duration_minutes": event.duration_minutes,
        "created_at": event.created_at,
        "user_email": user.email if user else None,
        "skill_name": skill.name if skill else None
    }


@router.post("/practice-events", response_model=AdminPracticeEventResponse, status_code=status.HTTP_201_CREATED)
def create_practice_event(
    data: AdminPracticeEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new practice event."""
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    skill = db.query(Skill).filter(Skill.id == data.skill_id).first()
    if not skill:
        raise HTTPException(status_code=400, detail="Skill not found")

    event = PracticeEvent(
        skill_id=data.skill_id,
        user_id=data.user_id,
        date=data.date,
        type=data.type,
        notes=data.notes,
        duration_minutes=data.duration_minutes
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "id": event.id,
        "skill_id": event.skill_id,
        "user_id": event.user_id,
        "date": event.date,
        "type": event.type,
        "notes": event.notes,
        "duration_minutes": event.duration_minutes,
        "created_at": event.created_at,
        "user_email": user.email,
        "skill_name": skill.name
    }


@router.patch("/practice-events/{event_id}", response_model=AdminPracticeEventResponse)
def update_practice_event(
    event_id: UUID,
    data: AdminPracticeEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a practice event."""
    event = db.query(PracticeEvent).filter(PracticeEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Practice event not found")

    if data.skill_id is not None:
        event.skill_id = data.skill_id
    if data.user_id is not None:
        event.user_id = data.user_id
    if data.date is not None:
        event.date = data.date
    if data.type is not None:
        event.type = data.type
    if data.notes is not None:
        event.notes = data.notes
    if data.duration_minutes is not None:
        event.duration_minutes = data.duration_minutes

    db.commit()
    db.refresh(event)

    user = db.query(User).filter(User.id == event.user_id).first()
    skill = db.query(Skill).filter(Skill.id == event.skill_id).first()

    return {
        "id": event.id,
        "skill_id": event.skill_id,
        "user_id": event.user_id,
        "date": event.date,
        "type": event.type,
        "notes": event.notes,
        "duration_minutes": event.duration_minutes,
        "created_at": event.created_at,
        "user_email": user.email if user else None,
        "skill_name": skill.name if skill else None
    }


@router.delete("/practice-events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_practice_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a practice event."""
    event = db.query(PracticeEvent).filter(PracticeEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Practice event not found")

    db.delete(event)
    db.commit()


# ==================== Event Templates CRUD ====================
@router.get("/templates", response_model=dict)
def list_templates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    user_id: Optional[UUID] = None,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all event templates with pagination and filtering."""
    query = db.query(EventTemplate)

    if search:
        query = query.filter(EventTemplate.name.ilike(f"%{search}%"))
    if user_id:
        query = query.filter(EventTemplate.user_id == user_id)
    if event_type:
        query = query.filter(EventTemplate.event_type == event_type)

    total = query.count()
    templates = query.order_by(EventTemplate.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for template in templates:
        user = db.query(User).filter(User.id == template.user_id).first()
        items.append({
            "id": template.id,
            "user_id": template.user_id,
            "name": template.name,
            "event_type": template.event_type,
            "type": template.type,
            "default_duration_minutes": template.default_duration_minutes,
            "default_notes": template.default_notes,
            "created_at": template.created_at,
            "user_email": user.email if user else None
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/templates/{template_id}", response_model=AdminEventTemplateResponse)
def get_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific event template."""
    template = db.query(EventTemplate).filter(EventTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    user = db.query(User).filter(User.id == template.user_id).first()

    return {
        "id": template.id,
        "user_id": template.user_id,
        "name": template.name,
        "event_type": template.event_type,
        "type": template.type,
        "default_duration_minutes": template.default_duration_minutes,
        "default_notes": template.default_notes,
        "created_at": template.created_at,
        "user_email": user.email if user else None
    }


@router.post("/templates", response_model=AdminEventTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    data: AdminEventTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new event template."""
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    template = EventTemplate(
        user_id=data.user_id,
        name=data.name,
        event_type=data.event_type,
        type=data.type,
        default_duration_minutes=data.default_duration_minutes,
        default_notes=data.default_notes
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    return {
        "id": template.id,
        "user_id": template.user_id,
        "name": template.name,
        "event_type": template.event_type,
        "type": template.type,
        "default_duration_minutes": template.default_duration_minutes,
        "default_notes": template.default_notes,
        "created_at": template.created_at,
        "user_email": user.email
    }


@router.patch("/templates/{template_id}", response_model=AdminEventTemplateResponse)
def update_template(
    template_id: UUID,
    data: AdminEventTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update an event template."""
    template = db.query(EventTemplate).filter(EventTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    if data.user_id is not None:
        user = db.query(User).filter(User.id == data.user_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        template.user_id = data.user_id
    if data.name is not None:
        template.name = data.name
    if data.event_type is not None:
        template.event_type = data.event_type
    if data.type is not None:
        template.type = data.type
    if data.default_duration_minutes is not None:
        template.default_duration_minutes = data.default_duration_minutes
    if data.default_notes is not None:
        template.default_notes = data.default_notes

    db.commit()
    db.refresh(template)

    user = db.query(User).filter(User.id == template.user_id).first()

    return {
        "id": template.id,
        "user_id": template.user_id,
        "name": template.name,
        "event_type": template.event_type,
        "type": template.type,
        "default_duration_minutes": template.default_duration_minutes,
        "default_notes": template.default_notes,
        "created_at": template.created_at,
        "user_email": user.email if user else None
    }


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete an event template."""
    template = db.query(EventTemplate).filter(EventTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    db.delete(template)
    db.commit()
