from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from app.models import Base, Hospital, User, Patient, TestResult, TestType
from app.schemas import TestResultCreate
from contextlib import asynccontextmanager
from uuid import UUID
from datetime import datetime, date, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

# Initialize database
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Password hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# JWT
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Lifespan for database setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

# FastAPI app
app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# JWT functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_hospital(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        hospital_id: str = payload.get("sub")
        login_type: str = payload.get("type")
        if hospital_id is None or login_type != "hospital":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    result = await db.execute(select(Hospital).filter(Hospital.hospital_id == hospital_id))
    hospital = result.scalars().first()
    if hospital is None:
        raise credentials_exception
    return hospital

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        login_type: str = payload.get("type")
        if user_id is None or login_type != "user":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    result = await db.execute(select(User).filter(User.user_id == user_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_patient(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        patient_id: str = payload.get("sub")
        login_type: str = payload.get("type")
        if patient_id is None or login_type != "patient":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    result = await db.execute(select(Patient).filter(Patient.patient_id == patient_id))
    patient = result.scalars().first()
    if patient is None:
        raise credentials_exception
    return patient

# Pydantic models
class HospitalCreate(BaseModel):
    name: str
    license_number: str
    address: dict
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    password: str

class HospitalResponse(BaseModel):
    hospital_id: UUID
    name: str
    license_number: str
    address: dict
    contact_email: Optional[str]
    contact_phone: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }

class UserCreate(BaseModel):
    email: str
    password: str
    role: str
    hospital_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserResponse(BaseModel):
    user_id: UUID
    email: str
    role: str
    hospital_id: Optional[UUID]
    first_name: Optional[str]
    last_name: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }

class PatientCreate(BaseModel):
    user_id: str
    unique_id: str
    dob: date
    gender: Optional[str] = None
    contact_phone: Optional[str] = None
    emergency_contact: Optional[dict] = None
    created_by_hospital_id: str

class PatientUpdate(BaseModel):
    dob: Optional[str] = None
    gender: Optional[str] = None
    contact_phone: Optional[str] = None
    emergency_contact: Optional[dict] = None

class PatientResponse(BaseModel):
    patient_id: UUID
    user_id: UUID
    unique_id: str
    dob: date
    gender: Optional[str]
    contact_phone: Optional[str]
    emergency_contact: Optional[dict]
    created_by_hospital_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
        }

class TestResultResponse(BaseModel):
    test_result_id: UUID
    patient_id: UUID
    test_type_id: UUID
    result: str
    test_date: date
    created_by_hospital_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
        }

class Token(BaseModel):
    access_token: str
    token_type: str

# Token endpoint
@app.post("/token", response_model=Token)
async def login(
    grant_type: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    logger.debug(f"Received form data: grant_type={grant_type}, username={username}, password={password}")
    
    if not grant_type or not username or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=[
                {"loc": ["body", "grant_type"], "msg": "field required", "type": "value_error.missing"} if not grant_type else None,
                {"loc": ["body", "username"], "msg": "field required", "type": "value_error.missing"} if not username else None,
                {"loc": ["body", "password"], "msg": "field required", "type": "value_error.missing"} if not password else None
            ],
        )

    if grant_type == "hospital":
        result = await db.execute(select(Hospital).filter(Hospital.license_number == username))
        entity = result.scalars().first()
        if not entity or not pwd_context.verify(password, entity.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect license number or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(data={"sub": str(entity.hospital_id), "type": "hospital"})
    elif grant_type == "user":
        result = await db.execute(select(User).filter(User.email == username))
        entity = result.scalars().first()
        if not entity or not pwd_context.verify(password, entity.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(data={"sub": str(entity.user_id), "type": "user"})
    elif grant_type == "patient":
        result = await db.execute(select(Patient).filter(Patient.unique_id == username))
        entity = result.scalars().first()
        if not entity:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect patient ID",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_result = await db.execute(select(User).filter(User.user_id == entity.user_id))
        user = user_result.scalars().first()
        if not user or not pwd_context.verify(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(data={"sub": str(entity.patient_id), "type": "patient"})
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid login type",
        )
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoints (unchanged)
@app.get("/hospitals/", response_model=List[HospitalResponse])
async def list_hospitals(db: AsyncSession = Depends(get_db), current_hospital: Hospital = Depends(get_current_hospital)):
    result = await db.execute(select(Hospital))
    hospitals = result.scalars().all()
    return hospitals

@app.post("/hospitals/", response_model=HospitalResponse, status_code=201)
async def create_hospital(hospital: HospitalCreate, db: AsyncSession = Depends(get_db)):
    db_hospital = Hospital(
        **hospital.dict(exclude={"password"}),
        password_hash=pwd_context.hash(hospital.password)
    )
    db.add(db_hospital)
    await db.commit()
    await db.refresh(db_hospital)
    return db_hospital


@app.get("/hospitals/patients/", response_model=List[PatientResponse])
async def list_hospital_patients(
    unique_id: Optional[str] = None,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: AsyncSession = Depends(get_db)
):
    query = select(Patient).filter(Patient.created_by_hospital_id == current_hospital.hospital_id)
    if unique_id:
        query = query.filter(Patient.unique_id == unique_id)
    result = await db.execute(query)
    patients = result.scalars().all()
    return patients

@app.post("/hospitals/patients/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_hospital_patient(
    patient: PatientCreate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: AsyncSession = Depends(get_db)
):
    # Verify hospital_id matches current hospital
    if str(patient.created_by_hospital_id) != str(current_hospital.hospital_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create patient for another hospital"
        )
    # Check if unique_id already exists
    existing_patient = await db.execute(
        select(Patient).filter(Patient.unique_id == patient.unique_id)
    )
    if existing_patient.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient with this unique_id already exists"
        )
    # Create new patient
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    await db.commit()
    await db.refresh(db_patient)
    return db_patient

@app.patch("/hospitals/patients/{patient_id}", response_model=PatientResponse)
async def update_hospital_patient(
    patient_id: str,
    patient_update: PatientUpdate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Patient).filter(
            Patient.patient_id == patient_id,
            Patient.created_by_hospital_id == current_hospital.hospital_id
        )
    )
    db_patient = result.scalars().first()
    if not db_patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or not associated with this hospital"
        )
    update_data = patient_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_patient, key, value)
    await db.commit()
    await db.refresh(db_patient)
    return db_patient

@app.post(
    "/hospitals/patients/{patient_id}/test_results/",
    response_model=TestResultResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_test_result(
    patient_id: str,
    test_result: TestResultCreate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: AsyncSession = Depends(get_db)
):
    # Verify patient exists and belongs to this hospital
    result = await db.execute(
        select(Patient).filter(
            Patient.patient_id == patient_id,
            Patient.created_by_hospital_id == current_hospital.hospital_id
        )
    )
    patient = result.scalars().first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or not associated with this hospital"
        )
    # Verify test_type_id exists
    result = await db.execute(
        select(TestType).filter(TestType.test_type_id == test_result.test_type_id)
    )
    test_type = result.scalars().first()
    if not test_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid test_type_id"
        )
    # Create test result
    db_test_result = TestResult(
        patient_id=patient_id,
        test_type_id=test_result.test_type_id,
        result=test_result.result,
        test_date=test_result.test_date,
        created_by_hospital_id=current_hospital.hospital_id
    )
    db.add(db_test_result)
    await db.commit()
    await db.refresh(db_test_result)
    return db_test_result

@app.get("/patients/me/", response_model=PatientResponse)
async def get_patient_details(current_patient: Patient = Depends(get_current_patient)):
    return current_patient

@app.get("/patients/test_results/", response_model=List[TestResultResponse])
async def get_patient_test_results(current_patient: Patient = Depends(get_current_patient), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TestResult).filter(TestResult.patient_id == current_patient.patient_id))
    test_results = result.scalars().all()
    return test_results
@app.get("/health")
async def health_check():
    return {"status": "ok"}