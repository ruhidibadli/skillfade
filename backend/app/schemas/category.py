from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class CategoryBase(BaseModel):
    name: str = Field(..., max_length=50)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class CategoryResponse(CategoryBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    skill_count: Optional[int] = None

    class Config:
        from_attributes = True
