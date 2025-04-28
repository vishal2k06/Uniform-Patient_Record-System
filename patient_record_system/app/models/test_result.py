from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
from datetime import datetime
from sqlalchemy.sql import func
import uuid

class TestResult(Base):
    __tablename__ = "test_results"
    test_result_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)
    test_type_id = Column(UUID(as_uuid=True), ForeignKey("test_types.test_type_id"), nullable=False)
    result = Column(String, nullable=False)
    test_date = Column(DateTime, nullable=False)
    created_by_hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.hospital_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())