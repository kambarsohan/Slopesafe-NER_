"""
schemas.py
----------
Pydantic "schemas" describe the shape of data going in and out of the API.
FastAPI uses these to validate incoming requests automatically and to
control exactly what fields get sent back in responses.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# ---------- Location ----------

class LocationBase(BaseModel):
    name: str
    state: str
    latitude: float
    longitude: float
    rainfall_mm: float
    slope_degrees: float
    past_landslide: bool


class LocationOut(LocationBase):
    """What we send back to the frontend for a location."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    risk_level: str
    safety_recommendation: str
    last_updated: datetime


class LocationUpdate(BaseModel):
    """
    Only these three fields can ever be edited by a user (Admin page).
    risk_level is deliberately NOT included here — it is always
    recalculated by the backend, never trusted from the client.
    """
    rainfall_mm: float = Field(..., ge=0, description="Sample rainfall in mm, must be 0 or more")
    slope_degrees: float = Field(..., ge=0, le=90, description="Sample slope in degrees, 0-90")
    past_landslide: bool


# ---------- Field Report ----------

REPORT_TYPES = [
    "Road blockage",
    "Slope crack",
    "Water seepage",
    "Debris flow",
    "Landslide observed",
    "Other",
]

SEVERITY_LEVELS = ["Low", "Medium", "High"]


class FieldReportCreate(BaseModel):
    reporter_name: str = Field(..., min_length=1)
    phone_optional: Optional[str] = None
    location_id: int
    report_type: str
    severity: str
    description: str = Field(..., min_length=1)
    image_url_optional: Optional[str] = None


class FieldReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reporter_name: str
    phone_optional: Optional[str] = None
    location_id: int
    report_type: str
    severity: str
    description: str
    image_url_optional: Optional[str] = None
    status: str
    created_at: datetime


# ---------- Alert ----------

class AlertCreate(BaseModel):
    location_id: int
    message: Optional[str] = None  # if not given, backend writes a default message


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    location_id: int
    risk_level: str
    message: str
    status: str
    created_at: datetime


# ---------- Dashboard summary ----------

class DashboardSummary(BaseModel):
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    field_reports_count: int
    latest_alerts: List[AlertOut]
    rainfall_chart_data: List[dict]  # [{"name": "Shillong", "rainfall_mm": 120, "risk_level": "High"}, ...]
