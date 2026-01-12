from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.user import User
from app.models.skill import Skill
from app.models.category import Category
from app.schemas.skill import SkillCreate, SkillUpdate, SkillResponse, SkillArchive, SkillDependencyUpdate
from app.services.auth import get_current_user
from app.services.freshness import calculate_freshness
from uuid import UUID

router = APIRouter(prefix="/api/skills", tags=["Skills"])


def get_skill_freshness_info(skill: Skill):
    """Get freshness info for a skill (used for dependency display)."""
    learning_events = [(e.date, e.type) for e in skill.learning_events]
    practice_events = [(e.date, e.type) for e in skill.practice_events]
    freshness = calculate_freshness(
        skill_created_at=skill.created_at.date(),
        learning_events=learning_events,
        practice_events=practice_events,
        base_decay_rate=skill.decay_rate or 0.02
    )
    below_target = None
    if skill.target_freshness is not None:
        below_target = freshness < skill.target_freshness
    return {"freshness": round(freshness, 2), "below_target": below_target}


def enrich_skill_with_metrics(skill: Skill, db: Session, include_dependencies: bool = True) -> dict:
    """Add calculated metrics to skill response."""
    # Get all events for this skill
    learning_events = [(e.date, e.type) for e in skill.learning_events]
    practice_events = [(e.date, e.type) for e in skill.practice_events]

    # Calculate freshness using skill's custom decay rate
    freshness = calculate_freshness(
        skill_created_at=skill.created_at.date(),
        learning_events=learning_events,
        practice_events=practice_events,
        base_decay_rate=skill.decay_rate or 0.02
    )

    # Calculate days since last practice
    if practice_events:
        from datetime import date
        last_practice = max(pe[0] for pe in practice_events)
        days_since_practice = (date.today() - last_practice).days
    else:
        from datetime import date
        days_since_practice = (date.today() - skill.created_at.date()).days

    # Check if below target
    below_target = None
    if skill.target_freshness is not None:
        below_target = freshness < skill.target_freshness

    # Get dependency info
    dependencies_info = None
    dependents_info = None
    if include_dependencies:
        dependencies_info = []
        for dep in skill.dependencies:
            dep_freshness = get_skill_freshness_info(dep)
            dependencies_info.append({
                "id": dep.id,
                "name": dep.name,
                "freshness": dep_freshness["freshness"],
                "below_target": dep_freshness["below_target"]
            })

        dependents_info = []
        for dep in skill.dependents:
            dep_freshness = get_skill_freshness_info(dep)
            dependents_info.append({
                "id": dep.id,
                "name": dep.name,
                "freshness": dep_freshness["freshness"],
                "below_target": dep_freshness["below_target"]
            })

    # Get category info
    category_info = None
    if skill.category_obj:
        category_info = {
            "id": skill.category_obj.id,
            "name": skill.category_obj.name
        }

    # Convert to dict and add metrics
    skill_dict = {
        "id": skill.id,
        "user_id": skill.user_id,
        "name": skill.name,
        "category_id": skill.category_id,
        "category": category_info,
        "decay_rate": skill.decay_rate or 0.02,
        "target_freshness": skill.target_freshness,
        "notes": skill.notes,
        "created_at": skill.created_at,
        "archived_at": skill.archived_at,
        "freshness": round(freshness, 2),
        "days_since_practice": days_since_practice,
        "practice_count": len(practice_events),
        "learning_count": len(learning_events),
        "below_target": below_target,
        "dependencies": dependencies_info,
        "dependents": dependents_info
    }

    return skill_dict


@router.get("", response_model=List[SkillResponse])
def list_skills(
    include_archived: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all skills for the current user.
    """
    query = db.query(Skill).filter(Skill.user_id == current_user.id)

    if not include_archived:
        query = query.filter(Skill.archived_at.is_(None))

    skills = query.all()

    # Enrich with metrics
    enriched_skills = [enrich_skill_with_metrics(skill, db) for skill in skills]

    return enriched_skills


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_data: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new skill.
    """
    # Check if skill name already exists for this user
    existing_skill = db.query(Skill).filter(
        Skill.user_id == current_user.id,
        Skill.name == skill_data.name
    ).first()

    if existing_skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill with this name already exists"
        )

    # Handle category
    category_id = None
    if skill_data.category_id:
        # Verify category belongs to user
        category = db.query(Category).filter(
            Category.id == skill_data.category_id,
            Category.user_id == current_user.id
        ).first()
        if category:
            category_id = category.id
    elif skill_data.category_name:
        # Check if category with this name exists
        category = db.query(Category).filter(
            Category.user_id == current_user.id,
            Category.name == skill_data.category_name
        ).first()
        if category:
            category_id = category.id
        else:
            # Create new category
            new_category = Category(
                user_id=current_user.id,
                name=skill_data.category_name
            )
            db.add(new_category)
            db.flush()
            category_id = new_category.id

    # Create new skill
    new_skill = Skill(
        user_id=current_user.id,
        name=skill_data.name,
        category_id=category_id,
        decay_rate=skill_data.decay_rate if skill_data.decay_rate is not None else 0.02,
        target_freshness=skill_data.target_freshness,
        notes=skill_data.notes
    )

    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)

    return enrich_skill_with_metrics(new_skill, db)


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(
    skill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific skill by ID.
    """
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )

    return enrich_skill_with_metrics(skill, db)


@router.patch("/{skill_id}", response_model=SkillResponse)
def update_skill(
    skill_id: UUID,
    skill_data: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a skill's name or category.
    """
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )

    # Update fields if provided
    if skill_data.name is not None:
        # Check for duplicate name
        existing_skill = db.query(Skill).filter(
            Skill.user_id == current_user.id,
            Skill.name == skill_data.name,
            Skill.id != skill_id
        ).first()

        if existing_skill:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Skill with this name already exists"
            )

        skill.name = skill_data.name

    # Handle category update
    if skill_data.category_id is not None:
        if skill_data.category_id == "":
            # Clear category
            skill.category_id = None
        else:
            # Verify category belongs to user
            category = db.query(Category).filter(
                Category.id == skill_data.category_id,
                Category.user_id == current_user.id
            ).first()
            if category:
                skill.category_id = category.id
    elif skill_data.category_name is not None:
        if skill_data.category_name == "":
            # Clear category
            skill.category_id = None
        else:
            # Check if category with this name exists
            category = db.query(Category).filter(
                Category.user_id == current_user.id,
                Category.name == skill_data.category_name
            ).first()
            if category:
                skill.category_id = category.id
            else:
                # Create new category
                new_category = Category(
                    user_id=current_user.id,
                    name=skill_data.category_name
                )
                db.add(new_category)
                db.flush()
                skill.category_id = new_category.id

    if skill_data.decay_rate is not None:
        skill.decay_rate = skill_data.decay_rate

    if skill_data.target_freshness is not None:
        skill.target_freshness = skill_data.target_freshness

    if skill_data.notes is not None:
        skill.notes = skill_data.notes

    db.commit()
    db.refresh(skill)

    return enrich_skill_with_metrics(skill, db)


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_skill(
    skill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Archive a skill (soft delete).
    """
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )

    skill.archived_at = datetime.now(timezone.utc)
    db.commit()

    return None


@router.put("/{skill_id}/dependencies", response_model=SkillResponse)
def update_skill_dependencies(
    skill_id: UUID,
    dependency_data: SkillDependencyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update skill dependencies (prerequisites).
    """
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )

    # Validate all dependency IDs belong to the user and are not the skill itself
    dependencies = []
    for dep_id in dependency_data.dependency_ids:
        if dep_id == skill_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A skill cannot depend on itself"
            )

        dep_skill = db.query(Skill).filter(
            Skill.id == dep_id,
            Skill.user_id == current_user.id,
            Skill.archived_at.is_(None)
        ).first()

        if not dep_skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dependency skill not found: {dep_id}"
            )

        dependencies.append(dep_skill)

    # Update dependencies
    skill.dependencies = dependencies
    db.commit()
    db.refresh(skill)

    return enrich_skill_with_metrics(skill, db)
