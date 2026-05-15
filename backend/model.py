import pickle
import warnings
import numpy as np
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "loan_approval_model.pkl"

FEATURE_NAMES = [
    'Applicant_Income', 'Coapplicant_Income', 'Age', 'Dependents',
    'Credit_Score', 'Existing_Loans', 'DTI_Ratio', 'Savings',
    'Collateral_Value', 'Loan_Amount', 'Loan_Term',
    'Employment_Status_Salaried', 'Employment_Status_Self-employed',
    'Employment_Status_Unemployed',
    'Marital_Status_Single',
    'Loan_Purpose_Car', 'Loan_Purpose_Education',
    'Loan_Purpose_Home', 'Loan_Purpose_Personal',
    'Property_Area_Semiurban', 'Property_Area_Urban',
    'Education_Level_Not Graduate',
    'Gender_Male',
    'Employer_Category_Government', 'Employer_Category_MNC',
    'Employer_Category_Private', 'Employer_Category_Unemployed',
]

_model = None


def get_model():
    global _model
    if _model is None:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            with open(MODEL_PATH, "rb") as f:
                _model = pickle.load(f)
    return _model


def _encode(data: dict) -> np.ndarray:
    emp = data.get("employment_status", "Salaried")
    marital = data.get("marital_status", "Married")
    purpose = data.get("loan_purpose", "Business")
    area = data.get("property_area", "Rural")
    edu = data.get("education_level", "Graduate")
    gender = data.get("gender", "Female")
    employer = data.get("employer_category", "Business")

    vec = {
        'Applicant_Income':               float(data.get("applicant_income", 0)),
        'Coapplicant_Income':             float(data.get("coapplicant_income", 0)),
        'Age':                            float(data.get("age", 30)),
        'Dependents':                     float(data.get("dependents", 0)),
        'Credit_Score':                   float(data.get("credit_score", 600)),
        'Existing_Loans':                 float(data.get("existing_loans", 0)),
        'DTI_Ratio':                      float(data.get("dti_ratio", 0.3)),
        'Savings':                        float(data.get("savings", 0)),
        'Collateral_Value':               float(data.get("collateral_value", 0)),
        'Loan_Amount':                    float(data.get("loan_amount", 0)),
        'Loan_Term':                      float(data.get("loan_term", 36)),
        'Employment_Status_Salaried':     1.0 if emp == "Salaried" else 0.0,
        'Employment_Status_Self-employed':1.0 if emp == "Self-employed" else 0.0,
        'Employment_Status_Unemployed':   1.0 if emp == "Unemployed" else 0.0,
        'Marital_Status_Single':          1.0 if marital == "Single" else 0.0,
        'Loan_Purpose_Car':               1.0 if purpose == "Car" else 0.0,
        'Loan_Purpose_Education':         1.0 if purpose == "Education" else 0.0,
        'Loan_Purpose_Home':              1.0 if purpose == "Home" else 0.0,
        'Loan_Purpose_Personal':          1.0 if purpose == "Personal" else 0.0,
        'Property_Area_Semiurban':        1.0 if area == "Semiurban" else 0.0,
        'Property_Area_Urban':            1.0 if area == "Urban" else 0.0,
        'Education_Level_Not Graduate':   1.0 if edu == "Not Graduate" else 0.0,
        'Gender_Male':                    1.0 if gender == "Male" else 0.0,
        'Employer_Category_Government':   1.0 if employer == "Government" else 0.0,
        'Employer_Category_MNC':          1.0 if employer == "MNC" else 0.0,
        'Employer_Category_Private':      1.0 if employer == "Private" else 0.0,
        'Employer_Category_Unemployed':   1.0 if employer == "Unemployed" else 0.0,
    }
    return np.array([vec[f] for f in FEATURE_NAMES]).reshape(1, -1)


def _risk_factors(X: np.ndarray, data: dict) -> list[str]:
    model = get_model()
    imp = model.feature_importances_
    idx = {f: i for i, f in enumerate(FEATURE_NAMES)}
    v = X[0]
    candidates = []

    loan = float(data.get("loan_amount", 1))
    income = float(data.get("applicant_income", 1)) or 1

    if v[idx['DTI_Ratio']] > 0.5:
        candidates.append(("Rasio hutang (DTI) terlalu tinggi", imp[idx['DTI_Ratio']] * v[idx['DTI_Ratio']]))
    if v[idx['Credit_Score']] < 600:
        candidates.append(("Skor kredit rendah", imp[idx['Credit_Score']] * (800 - v[idx['Credit_Score']]) / 800))
    if v[idx['Existing_Loans']] >= 2:
        candidates.append(("Memiliki terlalu banyak pinjaman aktif", imp[idx['Existing_Loans']] * v[idx['Existing_Loans']]))
    if v[idx['Savings']] < loan * 0.1:
        candidates.append(("Tabungan tidak mencukupi dibanding pinjaman", imp[idx['Savings']]))
    if v[idx['Employment_Status_Unemployed']] == 1.0:
        candidates.append(("Status saat ini tidak bekerja", imp[idx['Employment_Status_Unemployed']] * 2))
    if v[idx['Collateral_Value']] < loan * 0.5:
        candidates.append(("Nilai jaminan/agunan terlalu rendah", imp[idx['Collateral_Value']]))
    if loan / income > 10:
        candidates.append(("Rasio pinjaman terhadap pendapatan terlalu besar", imp[idx['Loan_Amount']]))

    candidates.sort(key=lambda x: x[1], reverse=True)
    return [c[0] for c in candidates[:3]]


def predict(data: dict) -> dict:
    model = get_model()
    X = _encode(data)
    proba = model.predict_proba(X)[0]
    pred_class = int(np.argmax(proba))
    confidence = float(proba[pred_class])
    prediction = "Approved" if pred_class == 1 else "Rejected"
    risk_factors = _risk_factors(X, data)
    return {
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "approved_probability": round(float(proba[1]), 4),
        "risk_factors": risk_factors,
    }
