"""
seed.py
-------
Fills the database with sample data for 10 real North East India locations.

IMPORTANT: The rainfall_mm and slope_degrees values below are APPROXIMATE,
ILLUSTRATIVE SAMPLE VALUES chosen to demonstrate the risk logic across
High/Medium/Low cases. They are NOT verified meteorological or geological
measurements. Real coordinates (latitude/longitude) are approximate town-centre
values, accurate enough for a demo map.

Run this file once to create the tables and insert the sample rows:
    python seed.py
"""

from database import engine, SessionLocal, Base
from models import Location
from risk_logic import calculate_risk_level, get_safety_recommendation

# Create all tables (if they don't already exist)
Base.metadata.create_all(bind=engine)

# name, state, latitude, longitude, rainfall_mm (SAMPLE), slope_degrees (SAMPLE), past_landslide
SAMPLE_LOCATIONS = [
    ("Shillong",  "Meghalaya",          25.5788, 91.8933, 135, 34, True),   # High
    ("Gangtok",   "Sikkim",             27.3389, 88.6065, 110, 32, True),   # High
    ("Aizawl",    "Mizoram",            23.7271, 92.7176, 95,  28, True),   # High (past_landslide + rainfall>=90)
    ("Itanagar",  "Arunachal Pradesh",  27.0844, 93.6053, 105, 22, False),  # Medium (high rainfall only)
    ("Kohima",    "Nagaland",           25.6751, 94.1086, 80,  33, False),  # Medium (high slope only)
    ("Imphal",    "Manipur",            24.8170, 93.9368, 70,  18, True),   # Medium (past landslide only, rainfall<90)
    ("Guwahati",  "Assam",              26.1445, 91.7362, 55,  10, False),  # Low
    ("Agartala",  "Tripura",            23.8315, 91.2868, 60,  15, False),  # Low
    ("Dimapur",   "Nagaland",           25.9091, 93.7266, 65,  20, False),  # Low
    ("Mangan",    "Sikkim",             27.5117, 88.5316, 118, 31, False),  # High (high rainfall + high slope)
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Location).count()
        if existing > 0:
            print(f"Database already has {existing} locations. Skipping seed to avoid duplicates.")
            print("If you want to reseed from scratch, delete slopesafe.db and run this script again.")
            return

        for name, state, lat, lon, rainfall, slope, past_landslide in SAMPLE_LOCATIONS:
            risk = calculate_risk_level(rainfall, slope, past_landslide)
            recommendation = get_safety_recommendation(risk)
            location = Location(
                name=name,
                state=state,
                latitude=lat,
                longitude=lon,
                rainfall_mm=rainfall,
                slope_degrees=slope,
                past_landslide=past_landslide,
                risk_level=risk,
                safety_recommendation=recommendation,
            )
            db.add(location)

        db.commit()
        print(f"Seeded {len(SAMPLE_LOCATIONS)} sample NER locations into slopesafe.db")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
