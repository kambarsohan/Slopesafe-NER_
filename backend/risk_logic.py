"""
risk_logic.py
-------------
This is the ENTIRE "AI" of this prototype: a transparent, rule-based
risk calculator. There is no machine learning model here — this is a
hackathon MVP, and we are explicit about that everywhere in the app.

The same function is used every time a location's data changes, so the
backend — not the user — always decides the final risk_level.
"""

HIGH_RAINFALL_THRESHOLD = 100      # mm
HIGH_SLOPE_THRESHOLD = 30          # degrees
PAST_LANDSLIDE_RAINFALL_THRESHOLD = 90  # mm


def calculate_risk_level(rainfall_mm: float, slope_degrees: float, past_landslide: bool) -> str:
    """
    Rule-based risk logic (documented so it can be explained to judges):

    HIGH risk if:
      - rainfall_mm >= 100 AND slope_degrees >= 30, OR
      - past_landslide is True AND rainfall_mm >= 90

    MEDIUM risk if exactly ONE major warning indicator is present:
      - rainfall_mm >= 100, OR
      - slope_degrees >= 30, OR
      - past_landslide is True

    LOW risk otherwise (fewer warning indicators present).
    """
    high_rainfall = rainfall_mm >= HIGH_RAINFALL_THRESHOLD
    high_slope = slope_degrees >= HIGH_SLOPE_THRESHOLD

    # Rule 1: HIGH
    if (high_rainfall and high_slope) or (past_landslide and rainfall_mm >= PAST_LANDSLIDE_RAINFALL_THRESHOLD):
        return "High"

    # Rule 2: MEDIUM — count how many warning indicators are present
    indicators = sum([high_rainfall, high_slope, past_landslide])
    if indicators >= 1:
        return "Medium"

    # Rule 3: LOW
    return "Low"


def get_safety_recommendation(risk_level: str) -> str:
    """Returns a plain-language safety recommendation for a given risk level."""
    recommendations = {
        "High": (
            "High risk indicators detected in this prototype's sample data. "
            "In a real deployment, residents in this area would be advised to stay alert, "
            "avoid unnecessary travel on steep slopes, and follow local authority guidance. "
            "This is a demo recommendation, not an official directive."
        ),
        "Medium": (
            "Medium risk indicators detected in this prototype's sample data. "
            "In a real deployment, residents would be advised to monitor conditions "
            "and report any visible ground cracks or unusual water flow. "
            "This is a demo recommendation, not an official directive."
        ),
        "Low": (
            "Low risk indicators in this prototype's sample data. "
            "No specific precautions are suggested at this time. "
            "This is a demo recommendation, not an official directive."
        ),
    }
    return recommendations.get(risk_level, recommendations["Low"])
