import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, Float, Text, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


# Association table for skill dependencies (many-to-many self-referential)
skill_dependencies = Table(
    'skill_dependencies',
    Base.metadata,
    Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column('skill_id', UUID(as_uuid=True), ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
    Column('depends_on_id', UUID(as_uuid=True), ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
    Column('created_at', DateTime, default=datetime.utcnow),
    UniqueConstraint('skill_id', 'depends_on_id', name='uq_skill_dependency')
)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    decay_rate = Column(Float, default=0.02, nullable=False)  # Custom decay rate per skill
    target_freshness = Column(Float, nullable=True)  # Personal freshness threshold
    notes = Column(Text, nullable=True)  # Persistent notes for the skill
    created_at = Column(DateTime, default=datetime.utcnow)
    archived_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="skills")
    category_obj = relationship("Category", back_populates="skills")
    learning_events = relationship("LearningEvent", back_populates="skill", cascade="all, delete-orphan")
    practice_events = relationship("PracticeEvent", back_populates="skill", cascade="all, delete-orphan")

    # Self-referential many-to-many for dependencies
    dependencies = relationship(
        "Skill",
        secondary=skill_dependencies,
        primaryjoin=id == skill_dependencies.c.skill_id,
        secondaryjoin=id == skill_dependencies.c.depends_on_id,
        backref="dependents"
    )

    # Constraints
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_user_skill_name"),
    )
