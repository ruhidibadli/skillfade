from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID


# ==================== User Schemas ====================
class AdminUserBase(BaseModel):
    email: EmailStr
    is_admin: bool = False
    settings: Dict[str, Any] = {}


class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    is_admin: bool = False


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    is_admin: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None


class AdminUserResponse(AdminUserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    skills_count: int = 0
    learning_events_count: int = 0
    practice_events_count: int = 0

    class Config:
        from_attributes = True


# ==================== Category Schemas ====================
class AdminCategoryBase(BaseModel):
    name: str = Field(..., max_length=50)
    user_id: UUID


class AdminCategoryCreate(AdminCategoryBase):
    pass


class AdminCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    user_id: Optional[UUID] = None


class AdminCategoryResponse(AdminCategoryBase):
    id: UUID
    created_at: datetime
    user_email: Optional[str] = None
    skills_count: int = 0

    class Config:
        from_attributes = True


# ==================== Skill Schemas ====================
class AdminSkillBase(BaseModel):
    name: str = Field(..., max_length=100)
    user_id: UUID
    category_id: Optional[UUID] = None
    decay_rate: float = 0.02
    target_freshness: Optional[float] = None
    notes: Optional[str] = None


class AdminSkillCreate(AdminSkillBase):
    pass


class AdminSkillUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    user_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    decay_rate: Optional[float] = None
    target_freshness: Optional[float] = None
    notes: Optional[str] = None
    archived_at: Optional[datetime] = None


class AdminSkillResponse(AdminSkillBase):
    id: UUID
    created_at: datetime
    archived_at: Optional[datetime] = None
    user_email: Optional[str] = None
    category_name: Optional[str] = None
    learning_events_count: int = 0
    practice_events_count: int = 0
    freshness: Optional[float] = None

    class Config:
        from_attributes = True


# ==================== Learning Event Schemas ====================
class AdminLearningEventBase(BaseModel):
    skill_id: UUID
    user_id: UUID
    date: date
    type: str = Field(..., max_length=50)
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None


class AdminLearningEventCreate(AdminLearningEventBase):
    pass


class AdminLearningEventUpdate(BaseModel):
    skill_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    date: Optional[date] = None
    type: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None


class AdminLearningEventResponse(AdminLearningEventBase):
    id: UUID
    created_at: datetime
    user_email: Optional[str] = None
    skill_name: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== Practice Event Schemas ====================
class AdminPracticeEventBase(BaseModel):
    skill_id: UUID
    user_id: UUID
    date: date
    type: str = Field(..., max_length=50)
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None


class AdminPracticeEventCreate(AdminPracticeEventBase):
    pass


class AdminPracticeEventUpdate(BaseModel):
    skill_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    date: Optional[date] = None
    type: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None


class AdminPracticeEventResponse(AdminPracticeEventBase):
    id: UUID
    created_at: datetime
    user_email: Optional[str] = None
    skill_name: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== Event Template Schemas ====================
class AdminEventTemplateBase(BaseModel):
    user_id: UUID
    name: str = Field(..., max_length=100)
    event_type: str = Field(..., max_length=20)
    type: str = Field(..., max_length=50)
    default_duration_minutes: Optional[int] = None
    default_notes: Optional[str] = None


class AdminEventTemplateCreate(AdminEventTemplateBase):
    pass


class AdminEventTemplateUpdate(BaseModel):
    user_id: Optional[UUID] = None
    name: Optional[str] = Field(None, max_length=100)
    event_type: Optional[str] = Field(None, max_length=20)
    type: Optional[str] = Field(None, max_length=50)
    default_duration_minutes: Optional[int] = None
    default_notes: Optional[str] = None


class AdminEventTemplateResponse(AdminEventTemplateBase):
    id: UUID
    created_at: datetime
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== Pagination Schemas ====================
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==================== Ticket Schemas ====================
class AdminTicketReplyCreate(BaseModel):
    message: str = Field(..., min_length=1)


class AdminTicketReplyResponse(BaseModel):
    id: UUID
    ticket_id: UUID
    user_id: UUID
    message: str
    is_admin_reply: bool
    created_at: datetime
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


class AdminTicketUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=20)


class AdminTicketResponse(BaseModel):
    id: UUID
    user_id: UUID
    subject: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime
    user_email: Optional[str] = None
    reply_count: int = 0

    class Config:
        from_attributes = True


class AdminTicketDetailResponse(AdminTicketResponse):
    replies: List[AdminTicketReplyResponse] = []


# ==================== Stats Schemas ====================
class AdminDashboardStats(BaseModel):
    total_users: int
    total_skills: int
    total_categories: int
    total_learning_events: int
    total_practice_events: int
    total_templates: int
    total_tickets: int = 0
    open_tickets: int = 0
    users_last_7_days: int
    events_last_7_days: int
