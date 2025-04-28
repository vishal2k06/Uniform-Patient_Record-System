from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class HospitalBase(BaseModel):
    name: str
    license_number: str
    address: Optional[dict] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None

class HospitalCreate(HospitalBase):
    admin_user_id: UUID

class Hospital(HospitalBase):
    hospital_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date

class HospitalResponse(BaseModel):
    hospital_id: str
    license_number: str
    name: str
    address: Optional[str] = None
    contact_phone: Optional[str] = None

    class Config:
        orm_mode = True

class PatientCreate(BaseModel):
    user_id: str
    unique_id: str
    dob: date
    gender: Optional[str] = None
    contact_phone: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    created_by_hospital_id: str

class PatientUpdate(BaseModel):
    gender: Optional[str] = None
    contact_phone: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None

class PatientResponse(BaseModel):
    patient_id: str
    user_id: str
    unique_id: str
    dob: date
    gender: Optional[str] = None
    contact_phone: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    created_by_hospital_id: str

    class Config:
        orm_mode = True

class TestResultCreate(BaseModel):
    test_type_id: str
    result: str
    test_date: date

class TestResultResponse(BaseModel):
    test_result_id: str
    patient_id: str
    test_type_id: str
    result: str
    test_date: date
    created_by_hospital_id: str

    class Config:
        orm_mode = True

class UserResponse(BaseModel):
    user_id: str
    email: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    hospital_id: Optional[str] = None

    class Config:
        orm_mode = True