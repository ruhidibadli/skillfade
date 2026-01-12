from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from enum import Enum


class LearningEventType(str, Enum):
    reading = "reading"
    video = "video"
    course = "course"
    article = "article"
    documentation = "documentation"
    tutorial = "tutorial"


class PracticeEventType(str, Enum):
    exercise = "exercise"
    project = "project"
    work = "work"
    teaching = "teaching"
    writing = "writing"
    building = "building"


class LearningEventBase(BaseModel):
    date: date
    type: LearningEventType
    notes: Optional[str] = Field(None, max_length=500)
    duration_minutes: Optional[int] = Field(None, gt=0)


class LearningEventCreate(LearningEventBase):
    pass


class LearningEventUpdate(BaseModel):
    date: Optional[date] = None
    type: Optional[LearningEventType] = None
    notes: Optional[str] = Field(None, max_length=500)
    duration_minutes: Optional[int] = Field(None, gt=0)


class LearningEventResponse(LearningEventBase):
    id: UUID
    skill_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PracticeEventBase(BaseModel):
    date: date
    type: PracticeEventType
    notes: Optional[str] = Field(None, max_length=500)
    duration_minutes: Optional[int] = Field(None, gt=0)


class PracticeEventCreate(PracticeEventBase):
    pass


class PracticeEventUpdate(BaseModel):
    date: Optional[date] = None
    type: Optional[PracticeEventType] = None
    notes: Optional[str] = Field(None, max_length=500)
    duration_minutes: Optional[int] = Field(None, gt=0)


class PracticeEventResponse(PracticeEventBase):
    id: UUID
    skill_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
