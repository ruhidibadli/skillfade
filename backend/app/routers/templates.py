from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.user import User
from app.models.event_template import EventTemplate
from app.schemas.event_template import EventTemplateCreate, EventTemplateUpdate, EventTemplateResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/templates", tags=["Event Templates"])


@router.get("", response_model=List[EventTemplateResponse])
def list_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all event templates for the current user.
    """
    templates = db.query(EventTemplate).filter(
        EventTemplate.user_id == current_user.id
    ).order_by(EventTemplate.created_at.desc()).all()

    return templates


@router.post("", response_model=EventTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    template_data: EventTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new event template.
    """
    new_template = EventTemplate(
        user_id=current_user.id,
        name=template_data.name,
        event_type=template_data.event_type,
        type=template_data.type,
        default_duration_minutes=template_data.default_duration_minutes,
        default_notes=template_data.default_notes
    )

    db.add(new_template)
    db.commit()
    db.refresh(new_template)

    return new_template


@router.get("/{template_id}", response_model=EventTemplateResponse)
def get_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific event template by ID.
    """
    template = db.query(EventTemplate).filter(
        EventTemplate.id == template_id,
        EventTemplate.user_id == current_user.id
    ).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    return template


@router.patch("/{template_id}", response_model=EventTemplateResponse)
def update_template(
    template_id: UUID,
    template_data: EventTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an event template.
    """
    template = db.query(EventTemplate).filter(
        EventTemplate.id == template_id,
        EventTemplate.user_id == current_user.id
    ).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    if template_data.name is not None:
        template.name = template_data.name
    if template_data.event_type is not None:
        template.event_type = template_data.event_type
    if template_data.type is not None:
        template.type = template_data.type
    if template_data.default_duration_minutes is not None:
        template.default_duration_minutes = template_data.default_duration_minutes
    if template_data.default_notes is not None:
        template.default_notes = template_data.default_notes

    db.commit()
    db.refresh(template)

    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an event template.
    """
    template = db.query(EventTemplate).filter(
        EventTemplate.id == template_id,
        EventTemplate.user_id == current_user.id
    ).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    db.delete(template)
    db.commit()

    return None
