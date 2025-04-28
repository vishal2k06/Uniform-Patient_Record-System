import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import httpx
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.main import app, get_db
from app.models import Base, Hospital, User, Patient
from sqlalchemy.future import select
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Test database setup
test_engine = create_async_engine(DATABASE_URL, echo=True)
TestAsyncSessionLocal = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

# Override dependency for testing
async def override_get_db():
    async with TestAsyncSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.mark.asyncio
async def test_list_hospitals():
    response = client.get("/hospitals/")
    assert response.status_code == 200
    hospitals = response.json()
    assert len(hospitals) >= 5  # Expect at least 5 hospitals
    assert all(h["license_number"].startswith("HOSP") for h in hospitals)

@pytest.mark.asyncio
async def test_create_hospital():
    hospital_data = {
        "name": "Test Hospital",
        "license_number": "HOSP999",
        "address": {"street": "123 Test St", "city": "Test City", "state": "TX", "zip": "12345"},
        "contact_email": "test@hospital.com",
        "contact_phone": "555-555-9999"
    }
    response = client.post("/hospitals/", json=hospital_data)
    assert response.status_code == 201
    hospital = response.json()
    assert hospital["name"] == "Test Hospital"
    assert hospital["license_number"] == "HOSP999"

@pytest.mark.asyncio
async def test_list_users():
    response = client.get("/users/")
    assert response.status_code == 200
    users = response.json()
    assert len(users) >= 50  # Expect at least 50 users
    assert any(u["role"] == "admin" for u in users)
    assert any(u["role"] == "patient" for u in users)

@pytest.mark.asyncio
async def test_create_user():
    async with TestAsyncSessionLocal() as session:
        hospital_id = (await session.execute(select(Hospital.hospital_id).limit(1))).scalar()
    user_data = {
        "email": "testuser@example.com",
        "password": "password123",
        "role": "doctor",
        "hospital_id": str(hospital_id),
        "first_name": "Test",
        "last_name": "User"
    }
    response = client.post("/users/", json=user_data)
    assert response.status_code == 201
    user = response.json()
    assert user["email"] == "testuser@example.com"
    assert user["role"] == "doctor"

@pytest.mark.asyncio
async def test_list_patients():
    response = client.get("/patients/")
    assert response.status_code == 200
    patients = response.json()
    assert len(patients) >= 25  # Expect at least 25 patients
    assert all(p["unique_id"].startswith("2025-HOSP") for p in patients)

@pytest.mark.asyncio
async def test_create_patient():
    async with TestAsyncSessionLocal() as session:
        user_id = (await session.execute(select(User.user_id).filter(User.role == "patient").limit(1))).scalar()
        hospital_id = (await session.execute(select(Hospital.hospital_id).limit(1))).scalar()
    patient_data = {
        "user_id": str(user_id),
        "unique_id": "2025-HOSP999-999999",
        "dob": "1980-01-01",
        "gender": "male",
        "contact_phone": "555-555-1234",
        "emergency_contact": {"name": "John Doe", "phone": "555-555-0000", "relation": "spouse"},
        "created_by_hospital_id": str(hospital_id)
    }
    response = client.post("/patients/", json=patient_data)
    assert response.status_code == 201
    patient = response.json()
    assert patient["unique_id"] == "2025-HOSP999-999999"
    assert patient["gender"] == "male"