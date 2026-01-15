from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime
from uuid import UUID


class TicketReplyBase(BaseModel):
    message: str = Field(..., min_length=1)


class TicketReplyCreate(TicketReplyBase):
    pass


class TicketReplyResponse(TicketReplyBase):
    id: UUID
    ticket_id: UUID
    user_id: UUID
    is_admin_reply: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TicketBase(BaseModel):
    subject: str = Field(..., max_length=200, min_length=1)
    message: str = Field(..., min_length=1)


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    status: Optional[Literal["open", "in_progress", "resolved", "closed"]] = None


class TicketResponse(BaseModel):
    id: UUID
    user_id: UUID
    subject: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime
    replies: List[TicketReplyResponse] = []

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    id: UUID
    user_id: UUID
    subject: str
    status: str
    created_at: datetime
    updated_at: datetime
    reply_count: int = 0

    class Config:
        from_attributes = True


class AdminTicketResponse(TicketResponse):
    user_email: Optional[str] = None
