from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Gender(str, Enum):
    Male = "Male"
    Female = "Female"


class MaritalStatus(str, Enum):
    Single = "Single"
    Married = "Married"


class EducationLevel(str, Enum):
    Graduate = "Graduate"
    NotGraduate = "Not Graduate"


class EmploymentStatus(str, Enum):
    Salaried = "Salaried"
    SelfEmployed = "Self-employed"
    Contract = "Contract"
    Unemployed = "Unemployed"


class EmployerCategory(str, Enum):
    Government = "Government"
    MNC = "MNC"
    Private = "Private"
    Business = "Business"
    Unemployed = "Unemployed"


class LoanPurpose(str, Enum):
    Car = "Car"
    Education = "Education"
    Home = "Home"
    Personal = "Personal"
    Business = "Business"


class PropertyArea(str, Enum):
    Rural = "Rural"
    Semiurban = "Semiurban"
    Urban = "Urban"


class LoanTerm(int, Enum):
    twelve = 12
    twenty_four = 24
    thirty_six = 36
    sixty = 60
    eighty_four = 84


class ApplicationStatus(str, Enum):
    PendingReview = "Pending Review"
    Approved = "Approved"
    Rejected = "Rejected"
    ApprovedManual = "Approved (Manual)"
    SentToReview = "Sent to Review"


# ── Predict ────────────────────────────────────────────────

class PredictRequest(BaseModel):
    # Identity
    age: int = Field(..., ge=18, le=80)
    gender: Gender
    marital_status: MaritalStatus
    dependents: int = Field(..., ge=0, le=10)
    education_level: EducationLevel

    # Employment
    employment_status: EmploymentStatus
    employer_category: EmployerCategory

    # Financials
    applicant_income: float = Field(..., gt=0)
    coapplicant_income: float = Field(0, ge=0)
    savings: float = Field(0, ge=0)
    collateral_value: float = Field(0, ge=0)
    existing_loans: int = Field(0, ge=0)
    dti_ratio: float = Field(..., ge=0.0, le=1.0)

    # Credit
    credit_score: int = Field(..., ge=300, le=850)

    # Loan
    loan_amount: float = Field(..., gt=0)
    loan_term: LoanTerm
    loan_purpose: LoanPurpose
    property_area: PropertyArea


class PredictResponse(BaseModel):
    prediction: str           # "Approved" | "Rejected"
    confidence: float         # 0.0 – 1.0
    approved_probability: float
    risk_factors: List[str]


# ── Applications ───────────────────────────────────────────

class ApplicationCreate(PredictRequest):
    applicant_name: Optional[str] = None
    officer_id: Optional[str] = None
    officer_name: Optional[str] = None
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    risk_factors: Optional[List[str]] = None


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus
    officer_name: Optional[str] = None
    notes: Optional[str] = None


class Application(ApplicationCreate):
    id: str
    status: ApplicationStatus = ApplicationStatus.PendingReview
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    officer_override: Optional[str] = None


class ApplicationListResponse(BaseModel):
    items: List[Application]
    total: int
    page: int
    page_size: int
    total_pages: int
