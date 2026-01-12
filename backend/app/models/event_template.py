import uuid
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class EventTemplate(Base):
    __tablename__ = "event_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    event_type = Column(String(20), nullable=False)  # 'learning' or 'practice'
    type = Column(String(50), nullable=False)  # reading, video, exercise, project, etc.
    default_duration_minutes = Column(Integer, nullable=True)
    default_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="event_templates")
