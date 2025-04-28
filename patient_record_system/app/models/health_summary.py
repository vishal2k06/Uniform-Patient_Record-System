from sqlalchemy import Column, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
from datetime import datetime
import uuid

class HealthSummary(Base):
    __tablename__ = "health_summaries"
    summary_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), unique=True)
    diagnoses = Column(JSON)
    medications = Column(JSON)
    allergies = Column(JSON)
    last_updated = Column(DateTime(timezone=True), default=datetime.utcnow)