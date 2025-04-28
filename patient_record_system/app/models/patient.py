from sqlalchemy import Column, String, Date, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
from datetime import datetime
from sqlalchemy.sql import func
import uuid

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    unique_id = Column(String, unique=True, nullable=False)
    dob = Column(Date, nullable=False)
    gender = Column(String)
    contact_phone = Column(String)
    emergency_contact = Column(JSON)
    created_by_hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())