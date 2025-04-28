from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
from datetime import datetime
import uuid

class Consent(Base):
    __tablename__ = "consents"
    consent_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"))
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    access_type = Column(String(20), nullable=False)
    granted_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at = Column(DateTime(timezone=True))
    revoked_at = Column(DateTime(timezone=True))