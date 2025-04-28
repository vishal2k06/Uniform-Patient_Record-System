import asyncio
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from sqlalchemy import func
import uuid
import random
import os
from dotenv import load_dotenv
from app.models.hospital import Hospital
from app.models.user import User
from app.models.patient import Patient
from app.models.test_type import TestType
from app.models.test_result import TestResult
from app.models.consent import Consent
from app.models.health_summary import HealthSummary
from app.models.note import Note
from passlib.context import CryptContext

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
fake = Faker()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def format_phone_number(phone):
    """Truncate phone number to 20 characters and remove extensions."""
    # Remove any extensions (e.g., 'x1234')
    phone = phone.split('x')[0]
    # Truncate to 20 characters (though VARCHAR(30) allows more)
    return phone[:20]

async def generate_synthetic_data():
    async with AsyncSessionLocal() as db:
        try:
            # 1. Insert Users
            users = []
            for _ in range(5):  # Admins
                users.append(User(
                    email=fake.email(),
                    password_hash=pwd_context.hash("password123"),
                    role="admin",
                    hospital_id=None,
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                ))
            for _ in range(10):  # Doctors
                users.append(User(
                    email=fake.email(),
                    password_hash=pwd_context.hash("password123"),
                    role="doctor",
                    hospital_id=None,
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                ))
            for _ in range(10):  # Staff
                users.append(User(
                    email=fake.email(),
                    password_hash=pwd_context.hash("password123"),
                    role="staff",
                    hospital_id=None,
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                ))
            for _ in range(25):  # Patients
                users.append(User(
                    email=fake.email(),
                    password_hash=pwd_context.hash("password123"),
                    role="patient",
                    hospital_id=None,
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                ))
            db.add_all(users)
            await db.commit()
            print("Inserted 50 users")

            # 2. Insert Hospitals
            admin_users = (await db.execute(select(User).filter(User.role == "admin"))).scalars().all()
            hospitals = [
                Hospital(
                    name=f"{fake.city()} General Hospital",
                    license_number=f"HOSP{random.randint(100, 999)}",
                    address={"street": fake.street_address(), "city": fake.city(), "state": fake.state(), "zip": fake.zipcode()},
                    contact_email=fake.email(),
                    contact_phone=format_phone_number(fake.phone_number()),  # Format phone number
                    admin_user_id=random.choice(admin_users).user_id,
                ) for _ in range(5)
            ]
            db.add_all(hospitals)
            await db.commit()
            print("Inserted 5 hospitals")

            # Update users with hospital_id
            hospitals = (await db.execute(select(Hospital))).scalars().all()
            hospital_ids = [h.hospital_id for h in hospitals]
            for user in users:
                if user.role in ["admin", "doctor", "staff"]:
                    user.hospital_id = random.choice(hospital_ids)
            await db.commit()
            print("Updated user hospital IDs")

            # 3. Insert Patients
            patient_users = (await db.execute(select(User).filter(User.role == "patient"))).scalars().all()
            patients = []
            for user in patient_users:
                hospital = random.choice(hospitals)
                patients.append(Patient(
                    user_id=user.user_id,
                    unique_id=f"{datetime.now().year}-{hospital.license_number}-{random.randint(100000, 999999)}",
                    dob=fake.date_of_birth(minimum_age=18, maximum_age=80),
                    gender=random.choice(["male", "female", "other"]),
                    contact_phone=format_phone_number(fake.phone_number()),  # Format phone number
                    emergency_contact={"name": fake.name(), "phone": format_phone_number(fake.phone_number()), "relation": random.choice(["spouse", "parent", "sibling"])},
                    created_by_hospital_id=hospital.hospital_id,
                ))
            db.add_all(patients)
            await db.commit()
            print("Inserted 25 patients")

            # 4. Insert Test Types
            test_types = [
                TestType(name="Complete Blood Count", standard_code="LOINC:58410-2"),
                TestType(name="X-Ray Chest", standard_code="LOINC:42272-5"),
                TestType(name="MRI Brain", standard_code="LOINC:24590-2"),
                TestType(name="Lipid Panel", standard_code="LOINC:57698-3"),
                TestType(name="Blood Glucose", standard_code="LOINC:2345-7"),
                TestType(name="Urinalysis", standard_code="LOINC:24356-8"),
                TestType(name="ECG", standard_code="LOINC:11524-6"),
                TestType(name="CT Abdomen", standard_code="LOINC:78970-6"),
                TestType(name="Hemoglobin A1c", standard_code="LOINC:4548-4"),
                TestType(name="Thyroid Panel", standard_code="LOINC:24348-5"),
            ]
            db.add_all(test_types)
            await db.commit()
            print("Inserted 10 test types")

            # 5. Insert Test Results
            patients = (await db.execute(select(Patient))).scalars().all()
            test_types = (await db.execute(select(TestType))).scalars().all()
            users = (await db.execute(select(User).filter(User.role.in_(["doctor", "staff"])))).scalars().all()
            test_results = []
            for _ in range(100):
                patient = random.choice(patients)
                test_type = random.choice(test_types)
                test_results.append(TestResult(
                    patient_id=patient.patient_id,
                    hospital_id=patient.created_by_hospital_id,
                    test_type_id=test_type.test_type_id,
                    file_url=f"https://s3.amazonaws.com/mock-bucket/test-results/{uuid.uuid4()}.pdf",
                    result_data={
                        "value": random.uniform(5.0, 15.0),
                        "unit": random.choice(["g/dL", "mg/dL", "mmol/L"]),
                        "reference_range": "Normal"
                    },
                    uploaded_by=random.choice(users).user_id,
                ))
            db.add_all(test_results)
            await db.commit()
            print("Inserted 100 test results")

            # 6. Insert Consents
            consents = []
            for patient in patients:
                for _ in range(2):  # 2 consents per patient
                    consents.append(Consent(
                        patient_id=patient.patient_id,
                        hospital_id=patient.created_by_hospital_id,
                        user_id=random.choice(users).user_id,
                        access_type=random.choice(["view", "edit"]),
                        expires_at=datetime.utcnow() + timedelta(days=30),
                    ))
            db.add_all(consents)
            await db.commit()
            print("Inserted 50 consents")

            # 7. Insert Health Summaries
            health_summaries = []
            for patient in patients:
                health_summaries.append(HealthSummary(
                    patient_id=patient.patient_id,
                    diagnoses=[{"code": "E11.9", "system": "ICD-10", "display": "Type 2 diabetes mellitus"}],
                    medications=[{"name": "Metformin", "dose": "500mg", "frequency": "twice daily"}],
                    allergies=[{"name": "Penicillin", "reaction": "Rash"}],
                ))
            db.add_all(health_summaries)
            await db.commit()
            print("Inserted 25 health summaries")

            # 8. Insert Notes
            notes = []
            for _ in range(50):
                patient = random.choice(patients)
                notes.append(Note(
                    patient_id=patient.patient_id,
                    user_id=random.choice(users).user_id,
                    content=fake.sentence(nb_words=20),
                ))
            db.add_all(notes)
            await db.commit()
            print("Inserted 50 notes")

            print("Synthetic data inserted successfully!")
        except Exception as e:
            print(f"Error inserting synthetic data: {str(e)}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(generate_synthetic_data())