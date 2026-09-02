"""
main.py
-------
This is the FastAPI application: it defines every API endpoint the
frontend calls. Run it with:

    uvicorn main:app --reload --port 8000

Then open http://localhost:8000/docs to see (and try) all endpoints
in an interactive Swagger UI.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from database import engine, get_db, Base
import models
import schemas
from risk_logic import calculate_risk_level, get_safety_recommendation

# Create tables if they don't exist yet (safe to call even if seed.py already did this)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SlopeSafe NER API",
    description=(
        "Prototype only: risk values are based on sample data and rule-based assessment. "
        "This is not an official emergency warning service."
    ),
    version="0.1.0",
)

# Allow the local React dev server to call this API.
# Vite's default port is 5173; CRA's default is 3000 — both included for safety.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health_check():
    """Simple endpoint the frontend can call to confirm the backend is running."""
    return {
        "status": "ok",
        "message": "SlopeSafe NER API is running (prototype, sample data only).",
        "time": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Locations
# ---------------------------------------------------------------------------

@app.get("/api/locations", response_model=list[schemas.LocationOut])
def get_locations(db: Session = Depends(get_db)):
    """Returns every monitored location, used by the Dashboard, Map, and Admin pages."""
    return db.query(models.Location).order_by(models.Location.name).all()


@app.get("/api/locations/{location_id}", response_model=schemas.LocationOut)
def get_location(location_id: int, db: Session = Depends(get_db)):
    """Returns a single location's full details, used by the Location Details page."""
    location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail=f"No location found with id {location_id}")
    return location


@app.put("/api/locations/{location_id}", response_model=schemas.LocationOut)
def update_location(location_id: int, update: schemas.LocationUpdate, db: Session = Depends(get_db)):
    """
    Updates a location's rainfall/slope/past-landslide sample values (Admin page).
    The risk_level is NEVER taken from the client — it is always recalculated
    here on the backend using risk_logic.calculate_risk_level().
    """
    location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail=f"No location found with id {location_id}")

    location.rainfall_mm = update.rainfall_mm
    location.slope_degrees = update.slope_degrees
    location.past_landslide = update.past_landslide

    # Recalculate risk automatically — this is the whole point of the rule.
    new_risk = calculate_risk_level(update.rainfall_mm, update.slope_degrees, update.past_landslide)
    location.risk_level = new_risk
    location.safety_recommendation = get_safety_recommendation(new_risk)
    location.last_updated = datetime.now(timezone.utc)

    db.commit()
    db.refresh(location)
    return location


# ---------------------------------------------------------------------------
# Field reports
# ---------------------------------------------------------------------------

@app.get("/api/reports", response_model=list[schemas.FieldReportOut])
def get_reports(db: Session = Depends(get_db)):
    """Returns all field reports, newest first, used by the Admin page."""
    return db.query(models.FieldReport).order_by(models.FieldReport.created_at.desc()).all()


@app.post("/api/reports", response_model=schemas.FieldReportOut, status_code=201)
def create_report(report: schemas.FieldReportCreate, db: Session = Depends(get_db)):
    """Submits a new field report from the Field Report page."""
    # Validate the location exists
    location = db.query(models.Location).filter(models.Location.id == report.location_id).first()
    if not location:
        raise HTTPException(status_code=400, detail=f"No location found with id {report.location_id}")

    if report.report_type not in schemas.REPORT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"report_type must be one of {schemas.REPORT_TYPES}",
        )
    if report.severity not in schemas.SEVERITY_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"severity must be one of {schemas.SEVERITY_LEVELS}",
        )

    new_report = models.FieldReport(
        reporter_name=report.reporter_name,
        phone_optional=report.phone_optional,
        location_id=report.location_id,
        report_type=report.report_type,
        severity=report.severity,
        description=report.description,
        image_url_optional=report.image_url_optional,
        status="Pending",
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report


@app.put("/api/reports/{report_id}/review", response_model=schemas.FieldReportOut)
def review_report(report_id: int, db: Session = Depends(get_db)):
    """Marks a field report as 'Reviewed' (Admin page action)."""
    report = db.query(models.FieldReport).filter(models.FieldReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"No report found with id {report_id}")

    report.status = "Reviewed"
    db.commit()
    db.refresh(report)
    return report


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

@app.get("/api/alerts", response_model=list[schemas.AlertOut])
def get_alerts(db: Session = Depends(get_db)):
    """Returns all alerts, newest first."""
    return db.query(models.Alert).order_by(models.Alert.created_at.desc()).all()


@app.post("/api/alerts", response_model=schemas.AlertOut, status_code=201)
def create_alert(alert: schemas.AlertCreate, db: Session = Depends(get_db)):
    """
    Creates a prototype alert record for a location, e.g. from the
    "Create Prototype Alert" button on the Location Details page.
    This ONLY writes a row to the database — it does NOT send any
    real SMS, WhatsApp, or email notification.
    """
    location = db.query(models.Location).filter(models.Location.id == alert.location_id).first()
    if not location:
        raise HTTPException(status_code=400, detail=f"No location found with id {alert.location_id}")

    message = alert.message or (
        f"[PROTOTYPE ALERT] {location.name}, {location.state} is currently at "
        f"{location.risk_level} risk based on sample data. This is a demo alert only."
    )

    new_alert = models.Alert(
        location_id=alert.location_id,
        risk_level=location.risk_level,
        message=message,
        status="Active",
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert


# ---------------------------------------------------------------------------
# Dashboard summary
# ---------------------------------------------------------------------------

@app.get("/api/dashboard-summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    A single endpoint that returns everything the Dashboard page needs:
    risk counts, total field reports, latest 3 alerts, and chart data.
    """
    locations = db.query(models.Location).all()

    high_count = sum(1 for l in locations if l.risk_level == "High")
    medium_count = sum(1 for l in locations if l.risk_level == "Medium")
    low_count = sum(1 for l in locations if l.risk_level == "Low")

    reports_count = db.query(func.count(models.FieldReport.id)).scalar() or 0

    latest_alerts = (
        db.query(models.Alert).order_by(models.Alert.created_at.desc()).limit(3).all()
    )

    chart_data = [
        {"name": l.name, "rainfall_mm": l.rainfall_mm, "risk_level": l.risk_level}
        for l in locations
    ]

    return schemas.DashboardSummary(
        high_risk_count=high_count,
        medium_risk_count=medium_count,
        low_risk_count=low_count,
        field_reports_count=reports_count,
        latest_alerts=latest_alerts,
        rainfall_chart_data=chart_data,
    )
