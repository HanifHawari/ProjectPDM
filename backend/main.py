import os
import uuid
from datetime import datetime, timedelta
from typing import Optional
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import json
from schemas import (
    PredictRequest, PredictResponse,
    ApplicationCreate, ApplicationUpdate, Application,
    ApplicationListResponse, ApplicationStatus,
)
import model as ml


DB_FILE = "database.json"

def _load_db() -> dict[str, Application]:
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, "r") as f:
            data = json.load(f)
            return {k: Application(**v) for k, v in data.items()}
    except Exception as e:
        print(f"[db] Load error: {e}")
        return {}

def _save_db(apps: dict[str, Application]):
    try:
        # Create temp data to ensure it's serializable
        json_data = {k: v.model_dump(mode='json') for k, v in apps.items()}
        with open(DB_FILE, "w") as f:
            json.dump(json_data, f, indent=2)
        print(f"[db] Successfully saved {len(apps)} items to {DB_FILE}")
    except Exception as e:
        print(f"[db] Save error: {str(e)}")
        # Log the full error for debugging
        import traceback
        traceback.print_exc()

_applications: dict[str, Application] = _load_db()

def _get_all_apps() -> list[Application]:
    return list(_applications.values())

def _get_app(app_id: str) -> Optional[Application]:
    return _applications.get(app_id)

def _save_app(app: Application):
    _applications[app.id] = app
    _save_db(_applications)





@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ml.get_model()
        print("[startup] ML model loaded OK")
    except Exception as e:
        print(f"[startup] Model load warning: {e}")
    print(f"[startup] Loaded {len(_applications)} applications from database.json")
    yield



app = FastAPI(
    title="Loan Approval Intelligence API",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def root():
    return {
        "message": "Loan Approval Intelligence API is running",
        "mode": "Local Persistence (JSON)",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "model": "RandomForestClassifier"}


# Mock user for local mode
MOCK_USER = {"uid": "local-admin", "name": "Admin Lokal", "role": "admin"}

@app.post("/api/predict", response_model=PredictResponse)
async def predict(
    request: PredictRequest,
    # user: dict = Depends(verify_token),
):
    # Skip role check for local mode
    result = ml.predict(request.model_dump())
    return PredictResponse(**result)


@app.get("/api/applications", response_model=ApplicationListResponse)
async def list_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    loan_purpose: Optional[str] = None,
    property_area: Optional[str] = None,
    employment_status: Optional[str] = None,
    status: Optional[str] = None,
    # user: dict = Depends(verify_token),
):
    items = _get_all_apps()


    if loan_purpose:
        items = [a for a in items if a.loan_purpose == loan_purpose]
    if property_area:
        items = [a for a in items if a.property_area == property_area]
    if employment_status:
        items = [a for a in items if a.employment_status == employment_status]
    if status:
        items = [a for a in items if a.status == status]


    items.sort(key=lambda a: a.created_at, reverse=True)

    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]
    import math
    return ApplicationListResponse(
        items=page_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size),
    )


@app.post("/api/applications", response_model=Application, status_code=201)
async def create_application(payload: ApplicationCreate):
    try:
        app_id = f"APP-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.utcnow()
        
        # Merge payload with required system fields
        app_data = payload.model_dump()
        app_data.update({
            "id": app_id,
            "status": ApplicationStatus.PendingReview,
            "officer_id": MOCK_USER["uid"],
            "officer_name": MOCK_USER["name"],
            "created_at": now,
            "updated_at": now
        })
        
        application = Application(**app_data)
        _save_app(application)
        return application
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create application: {str(e)}")


@app.patch("/api/applications/{app_id}", response_model=Application)
async def update_application(app_id: str, payload: ApplicationUpdate):
    try:
        application = _get_app(app_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        application.status = payload.status
        application.updated_at = datetime.utcnow()
        if payload.status == ApplicationStatus.ApprovedManual:
            application.officer_override = MOCK_USER["name"]
        
        _save_app(application)
        return application
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update application: {str(e)}")


@app.get("/api/analytics/summary")
async def analytics_summary(): # user: dict = Depends(verify_token)
    apps = _get_all_apps()
    total = len(apps)
    approved = sum(1 for a in apps if a.status in (ApplicationStatus.Approved, ApplicationStatus.ApprovedManual))
    approval_rate = round(approved / total * 100, 1) if total else 0
    avg_loan = round(sum(a.loan_amount for a in apps) / total) if total else 0
    avg_credit = round(sum(a.credit_score for a in apps) / total) if total else 0


    purposes = {}
    for a in apps:
        p = a.loan_purpose
        if p not in purposes:
            purposes[p] = {"total": 0, "approved": 0}
        purposes[p]["total"] += 1
        if a.status in (ApplicationStatus.Approved, ApplicationStatus.ApprovedManual):
            purposes[p]["approved"] += 1

    by_purpose = [
        {"purpose": k, "total": v["total"],
         "approval_rate": round(v["approved"] / v["total"] * 100, 1) if v["total"] else 0}
        for k, v in purposes.items()
    ]


    emp_dist = {}
    for a in apps:
        emp_dist[a.employment_status] = emp_dist.get(a.employment_status, 0) + 1


    from collections import defaultdict
    monthly: dict = defaultdict(int)
    now = datetime.utcnow()
    for a in apps:
        diff = (now.year - a.created_at.year) * 12 + (now.month - a.created_at.month)
        if 0 <= diff <= 11:
            key = a.created_at.strftime("%Y-%m")
            monthly[key] += 1

    monthly_trend = [{"month": k, "count": v} for k, v in sorted(monthly.items())]

    return {
        "total_applications": total,
        "approval_rate": approval_rate,
        "avg_loan_amount": avg_loan,
        "avg_credit_score": avg_credit,
        "by_purpose": by_purpose,
        "employment_distribution": [{"status": k, "count": v} for k, v in emp_dist.items()],
        "monthly_trend": monthly_trend,
    }
