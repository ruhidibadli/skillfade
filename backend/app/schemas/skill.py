from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID


class SkillBase(BaseModel):
    name: str = Field(..., max_length=100)
    category: Optional[str] = Field(None, max_length=50)


class SkillCreate(SkillBase):
    decay_rate: Optional[float] = Field(0.02, ge=0.001, le=0.5)
    target_freshness: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = Field(None)


class SkillUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    decay_rate: Optional[float] = Field(None, ge=0.001, le=0.5)
    target_freshness: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = Field(None)


class SkillDependencyInfo(BaseModel):
    id: UUID
    name: str
    freshness: Optional[float] = None
    below_target: Optional[bool] = None

    class Config:
        from_attributes = True


class SkillResponse(SkillBase):
    id: UUID
    user_id: UUID
    decay_rate: float = 0.02
    target_freshness: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    archived_at: Optional[datetime] = None
    freshness: Optional[float] = None  # Calculated field
    days_since_practice: Optional[int] = None  # Calculated field
    practice_count: Optional[int] = None  # Calculated field
    learning_count: Optional[int] = None  # Calculated field
    below_target: Optional[bool] = None  # Whether freshness is below target
    dependencies: Optional[List[SkillDependencyInfo]] = None  # Prerequisites
    dependents: Optional[List[SkillDependencyInfo]] = None  # Skills that depend on this

    class Config:
        from_attributes = True


class SkillDependencyUpdate(BaseModel):
    dependency_ids: List[UUID]


class SkillArchive(BaseModel):
    archived: bool


class FreshnessHistoryPoint(BaseModel):
    date: date
    freshness: float


class FreshnessHistoryResponse(BaseModel):
    skill_id: UUID
    skill_name: str
    history: List[FreshnessHistoryPoint]
    current_freshness: float
