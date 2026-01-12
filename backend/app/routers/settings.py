from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any
from app.core.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
import json

router = APIRouter(prefix="/api/settings", tags=["Settings"])


class SettingsUpdate(BaseModel):
    settings: Dict[str, Any]


@router.get("")
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user settings.
    """
    return {
        "settings": current_user.settings or {}
    }


@router.patch("")
def update_settings(
    settings_data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user settings.
    """
    # Merge with existing settings
    current_settings = current_user.settings or {}
    current_settings.update(settings_data.settings)

    current_user.settings = current_settings
    db.commit()
    db.refresh(current_user)

    return {
        "settings": current_user.settings
    }


@router.get("/export")
def export_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all user data as JSON.
    """
    from app.models.skill import Skill
    from app.models.event import LearningEvent, PracticeEvent

    # Get all user data
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()

    export_data = {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "created_at": current_user.created_at.isoformat(),
            "settings": current_user.settings
        },
        "skills": []
    }

    for skill in skills:
        skill_data = {
            "id": str(skill.id),
            "name": skill.name,
            "category": skill.category_obj.name if skill.category_obj else None,
            "created_at": skill.created_at.isoformat(),
            "archived_at": skill.archived_at.isoformat() if skill.archived_at else None,
            "learning_events": [],
            "practice_events": []
        }

        for event in skill.learning_events:
            skill_data["learning_events"].append({
                "id": str(event.id),
                "date": event.date.isoformat(),
                "type": event.type,
                "notes": event.notes,
                "duration_minutes": event.duration_minutes,
                "created_at": event.created_at.isoformat()
            })

        for event in skill.practice_events:
            skill_data["practice_events"].append({
                "id": str(event.id),
                "date": event.date.isoformat(),
                "type": event.type,
                "notes": event.notes,
                "duration_minutes": event.duration_minutes,
                "created_at": event.created_at.isoformat()
            })

        export_data["skills"].append(skill_data)

    return export_data


@router.delete("/account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete user account and all associated data.
    """
    db.delete(current_user)
    db.commit()

    return {"message": "Account successfully deleted"}
