from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class ActivityLogCreate(BaseModel):
    session_id: str = Field(..., max_length=100)
    action_type: str = Field(..., max_length=50)
    page: Optional[str] = Field(None, max_length=255)
    details: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ActivityLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    session_id: str
    action_type: str
    page: Optional[str]
    details: Dict[str, Any]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AdminActivityLogResponse(ActivityLogResponse):
    user_email: Optional[str] = None


class ActivityLogStats(BaseModel):
    total_logs: int
    unique_users: int
    unique_sessions: int
    logs_last_24h: int
    top_pages: List[Dict[str, Any]]
    top_actions: List[Dict[str, Any]]


class BulkDeleteRequest(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
