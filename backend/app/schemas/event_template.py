from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


class EventTemplateBase(BaseModel):
    name: str = Field(..., max_length=100)
    event_type: Literal["learning", "practice"]
    type: str = Field(..., max_length=50)
    default_duration_minutes: Optional[int] = Field(None, ge=1)
    default_notes: Optional[str] = None


class EventTemplateCreate(EventTemplateBase):
    pass


class EventTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    event_type: Optional[Literal["learning", "practice"]] = None
    type: Optional[str] = Field(None, max_length=50)
    default_duration_minutes: Optional[int] = Field(None, ge=1)
    default_notes: Optional[str] = None


class EventTemplateResponse(EventTemplateBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
