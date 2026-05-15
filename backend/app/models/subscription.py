import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    plan = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, index=True)
    provider = Column(String(20), nullable=False, default='epoint')
    order_id = Column(String(64), nullable=True, unique=True, index=True)
    epoint_transaction = Column(String(64), nullable=True)
    epoint_bank_transaction = Column(String(64), nullable=True)
    epoint_rrn = Column(String(32), nullable=True)
    epoint_code = Column(String(8), nullable=True)
    card_mask = Column(String(20), nullable=True)
    card_name = Column(String(100), nullable=True)
    purchased_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    amount = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), nullable=False, default='AZN')
    raw_callback = Column(JSON, default=dict, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="subscriptions")
