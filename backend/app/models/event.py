import uuid
from sqlalchemy import Column, String, DateTime, Date, Integer, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class LearningEvent(Base):
    __tablename__ = "learning_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(String(50), nullable=False)  # reading, video, course, article, documentation, tutorial
    notes = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    skill = relationship("Skill", back_populates="learning_events")
    user = relationship("User", back_populates="learning_events")

    # Indexes
    __table_args__ = (
        Index("idx_learning_events_skill", "skill_id", "date"),
    )


class PracticeEvent(Base):
    __tablename__ = "practice_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(String(50), nullable=False)  # exercise, project, work, teaching, writing, building
    notes = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    skill = relationship("Skill", back_populates="practice_events")
    user = relationship("User", back_populates="practice_events")

    # Indexes
    __table_args__ = (
        Index("idx_practice_events_skill", "skill_id", "date"),
    )
