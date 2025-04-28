from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
from datetime import datetime
from sqlalchemy.sql import func
import uuid

class Hospital(Base):
    __tablename__ = "hospitals"
    hospital_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    address = Column(JSON, nullable=False)
    contact_email = Column(String)
    contact_phone = Column(String)
    password_hash = Column(String, nullable=False)  # Added for hospital login
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())