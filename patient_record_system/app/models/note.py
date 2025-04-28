from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
from datetime import datetime
import uuid

class Note(Base):
    __tablename__ = "notes"
    note_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)