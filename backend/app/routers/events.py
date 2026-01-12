from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Union
from app.core.database import get_db
from app.models.user import User
from app.models.skill import Skill
from app.models.event import LearningEvent, PracticeEvent
from app.schemas.event import (
    LearningEventCreate, LearningEventUpdate, LearningEventResponse,
    PracticeEventCreate, PracticeEventUpdate, PracticeEventResponse
)
from app.services.auth import get_current_user
from uuid import UUID

router = APIRouter(prefix="/api", tags=["Events"])


@router.get("/skills/{skill_id}/events")
def get_skill_events(
    skill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all events (learning and practice) for a skill.
    """
    # Verify skill belongs to user
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )

    # Get all events
    learning_events = db.query(LearningEvent).filter(
        LearningEvent.skill_id == skill_id
    ).order_by(LearningEvent.date.desc()).all()

    practice_events = db.query(PracticeEvent).filter(
        PracticeEvent.skill_id == skill_id
    ).order_by(PracticeEvent.date.desc()).all()

    # Combine and format
    events = []

    for event in learning_events:
        events.append({
            **LearningEventResponse.model_validate(event).model_dump(),
            "event_type": "learning"
        })

    for event in practice_events:
        events.append({
            **PracticeEventResponse.model_validate(event).model_dump(),
            "event_type": "practice"
        })

    # Sort by date descending
    events.sort(key=lambda x: x["date"], reverse=True)

    return {"events": events}


@router.post("/skills/{skill_id}/learning-events", response_model=LearningEventResponse, status_code=status.HTTP_201_CREATED)
def create_learning_event(
    skill_id: UUID,
    event_data: LearningEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log a new learning event for a skill.
    """
    # Verify skill belongs to user
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )

    # Create event
    new_event = LearningEvent(
        skill_id=skill_id,
        user_id=current_user.id,
        date=event_data.date,
        type=event_data.type,
        notes=event_data.notes,
        duration_minutes=event_data.duration_minutes
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


@router.post("/skills/{skill_id}/practice-events", response_model=PracticeEventResponse, status_code=status.HTTP_201_CREATED)
def create_practice_event(
    skill_id: UUID,
    event_data: PracticeEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log a new practice event for a skill.
    """
    # Verify skill belongs to user
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )

    # Create event
    new_event = PracticeEvent(
        skill_id=skill_id,
        user_id=current_user.id,
        date=event_data.date,
        type=event_data.type,
        notes=event_data.notes,
        duration_minutes=event_data.duration_minutes
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


@router.patch("/learning-events/{event_id}", response_model=LearningEventResponse)
def update_learning_event(
    event_id: UUID,
    event_data: LearningEventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a learning event.
    """
    event = db.query(LearningEvent).filter(
        LearningEvent.id == event_id,
        LearningEvent.user_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Update fields if provided
    if event_data.date is not None:
        event.date = event_data.date
    if event_data.type is not None:
        event.type = event_data.type
    if event_data.notes is not None:
        event.notes = event_data.notes
    if event_data.duration_minutes is not None:
        event.duration_minutes = event_data.duration_minutes

    db.commit()
    db.refresh(event)

    return event


@router.patch("/practice-events/{event_id}", response_model=PracticeEventResponse)
def update_practice_event(
    event_id: UUID,
    event_data: PracticeEventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a practice event.
    """
    event = db.query(PracticeEvent).filter(
        PracticeEvent.id == event_id,
        PracticeEvent.user_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Update fields if provided
    if event_data.date is not None:
        event.date = event_data.date
    if event_data.type is not None:
        event.type = event_data.type
    if event_data.notes is not None:
        event.notes = event_data.notes
    if event_data.duration_minutes is not None:
        event.duration_minutes = event_data.duration_minutes

    db.commit()
    db.refresh(event)

    return event


@router.delete("/learning-events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_learning_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a learning event.
    """
    event = db.query(LearningEvent).filter(
        LearningEvent.id == event_id,
        LearningEvent.user_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    db.delete(event)
    db.commit()

    return None


@router.delete("/practice-events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_practice_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a practice event.
    """
    event = db.query(PracticeEvent).filter(
        PracticeEvent.id == event_id,
        PracticeEvent.user_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    db.delete(event)
    db.commit()

    return None
