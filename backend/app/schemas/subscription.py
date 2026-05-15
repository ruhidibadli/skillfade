from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class SubscriptionSummary(BaseModel):
    """Compact view exposed to the user on /api/billing/me."""
    plan: str
    status: Optional[str] = None
    purchased_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    amount: Optional[Decimal] = None
    currency: str = "AZN"

    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    """Full row, returned by admin endpoints."""
    id: UUID
    user_id: UUID
    plan: str
    status: str
    provider: str
    order_id: Optional[str] = None
    epoint_transaction: Optional[str] = None
    epoint_bank_transaction: Optional[str] = None
    epoint_rrn: Optional[str] = None
    epoint_code: Optional[str] = None
    card_mask: Optional[str] = None
    card_name: Optional[str] = None
    purchased_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    amount: Optional[Decimal] = None
    currency: str
    raw_callback: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
