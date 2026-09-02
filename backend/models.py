"""
models.py
---------
Defines the three database tables as Python classes, using SQLAlchemy.
Each class becomes one table in slopesafe.db.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


def utc_now():
    """Returns the current time in UTC, used as a default timestamp."""
    return datetime.now(timezone.utc)


class Location(Base):
    """
    A monitored location in the North Eastern Region (NER).
    Stores SAMPLE rainfall/slope data and the risk level calculated from it.
    """
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)          # SAMPLE rainfall value
    slope_degrees = Column(Float, nullable=False)        # SAMPLE slope value
    past_landslide = Column(Boolean, default=False)      # has this area had a landslide before?
    risk_level = Column(String, default="Low")           # "Low" / "Medium" / "High" — auto-calculated
    safety_recommendation = Column(Text, default="")
    last_updated = Column(DateTime, default=utc_now, onupdate=utc_now)

    field_reports = relationship("FieldReport", back_populates="location")
    alerts = relationship("Alert", back_populates="location")


class FieldReport(Base):
    """
    A report submitted by a citizen/field volunteer about ground conditions
    (e.g. a crack in a slope, a road blockage, a debris flow).
    """
    __tablename__ = "field_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String, nullable=False)
    phone_optional = Column(String, nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    report_type = Column(String, nullable=False)   # e.g. "Slope crack", "Road blockage"
    severity = Column(String, nullable=False)      # "Low" / "Medium" / "High"
    description = Column(Text, nullable=False)
    image_url_optional = Column(String, nullable=True)
    status = Column(String, default="Pending")     # "Pending" / "Reviewed"
    created_at = Column(DateTime, default=utc_now)

    location = relationship("Location", back_populates="field_reports")


class Alert(Base):
    """
    A prototype alert record created for a location (e.g. from the
    Location Details page). This is stored in the database only —
    NOT sent as a real SMS/WhatsApp/email notification.
    """
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    risk_level = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="Active")   # "Active" / "Resolved"
    created_at = Column(DateTime, default=utc_now)

    location = relationship("Location", back_populates="alerts")
