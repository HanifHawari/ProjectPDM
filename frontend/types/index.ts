// Core types shared across the app

export type Role = "admin" | "credit_officer" | "viewer";

export interface AuthUser {
  uid: string;
  name: string;
  email?: string;
  role: Role;
}

export type Gender = "Male" | "Female";
export type MaritalStatus = "Single" | "Married";
export type EducationLevel = "Graduate" | "Not Graduate";
export type EmploymentStatus = "Salaried" | "Self-employed" | "Contract" | "Unemployed";
export type EmployerCategory = "Government" | "MNC" | "Private" | "Business" | "Unemployed";
export type LoanPurpose = "Car" | "Education" | "Home" | "Personal" | "Business";
export type PropertyArea = "Rural" | "Semiurban" | "Urban";
export type LoanTerm = 12 | 24 | 36 | 60 | 84;
export type ApplicationStatus =
  | "Pending Review"
  | "Approved"
  | "Rejected"
  | "Approved (Manual)"
  | "Sent to Review";

export interface PredictRequest {
  age: number;
  gender: Gender;
  marital_status: MaritalStatus;
  dependents: number;
  education_level: EducationLevel;
  employment_status: EmploymentStatus;
  employer_category: EmployerCategory;
  applicant_income: number;
  coapplicant_income: number;
  savings: number;
  collateral_value: number;
  existing_loans: number;
  dti_ratio: number;
  credit_score: number;
  loan_amount: number;
  loan_term: LoanTerm;
  loan_purpose: LoanPurpose;
  property_area: PropertyArea;
}

export interface PredictResponse {
  prediction: "Approved" | "Rejected";
  confidence: number;
  approved_probability: number;
  risk_factors: string[];
}

export interface Application extends PredictRequest {
  id: string;
  applicant_name?: string;
  officer_id?: string;
  officer_name?: string;
  prediction?: string;
  confidence?: number;
  risk_factors?: string[];
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  officer_override?: string;
}

export interface ApplicationListResponse {
  items: Application[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AnalyticsSummary {
  total_applications: number;
  approval_rate: number;
  avg_loan_amount: number;
  avg_credit_score: number;
  by_purpose: { purpose: string; total: number; approval_rate: number }[];
  employment_distribution: { status: string; count: number }[];
  monthly_trend: { month: string; count: number }[];
}
