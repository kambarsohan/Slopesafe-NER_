# SlopeSafe NER

**Landslide Risk Monitoring and Early Warning Prototype**
Built for Smart India Hackathon 2026 — Problem Statement **SIH26001**: *AI-Based Early Warning and Landslide Risk Monitoring System in North Eastern Region (NER), India.*

## ⚠️ Honest prototype disclaimer

> **Prototype only: risk values are based on sample data and rule-based assessment. This is not an official emergency warning service.**

This project does **not** use:
- Live IMD (India Meteorological Department) data
- Live satellite feeds or soil sensors
- Any official government data integration
- A trained machine-learning prediction model
- Real SMS, WhatsApp, or email delivery

Every "alert" created in this app is a database record only, shown inside the app. Rainfall and slope values are **approximate, illustrative sample numbers** chosen to demonstrate the risk logic — not verified measurements.

## Purpose

This is an educational hackathon MVP that demonstrates, end-to-end, what a landslide early-warning platform for North East India could look like: a risk dashboard, an interactive map, citizen field reporting, and an admin panel — all backed by a transparent rule-based risk calculation instead of a black-box model, so judges and users can see exactly why a location is rated High/Medium/Low.

## Technology stack

**Frontend:** React 18, Vite, JavaScript, Tailwind CSS, React Router, Leaflet + React Leaflet, Recharts
**Backend:** Python, FastAPI, Uvicorn, SQLAlchemy, Pydantic
**Database:** SQLite (single file: `backend/slopesafe.db`)

No Docker, no Firebase, no paid APIs or API keys, no user authentication, no cloud deployment — everything runs locally.

## Folder structure

```
slopesafe-ner/
  frontend/
    src/
      components/    # Navbar, PrototypeNotice, RiskBadge, SummaryCard, LoadingState, ErrorState, RiskLegend
      pages/          # Dashboard, RiskMap, LocationDetails, FieldReport, Admin
      App.jsx
      main.jsx
      config.js       # backend URL configuration
      index.css
    index.html
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
  backend/
    main.py           # FastAPI app + all endpoints
    database.py       # SQLite/SQLAlchemy setup
    models.py         # Location, FieldReport, Alert tables
    schemas.py         # Pydantic request/response schemas
    risk_logic.py       # the rule-based risk calculator
    seed.py            # populates 10 sample NER locations
    requirements.txt
    .env.example
  README.md
  DEMO_SCRIPT.md
  PLAN.md
  .gitignore
```

## Setup instructions (Windows)

These are the exact commands to run, in order, using **PowerShell or Command Prompt**. Run them from inside the `slopesafe-ner` folder.

### 1. Backend setup

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000
```

Leave this terminal window running. It starts the API server at **http://localhost:8000**.
You can open **http://localhost:8000/docs** in a browser to see and try every endpoint interactively.

### 2. Frontend setup (open a **second** terminal window)

```
cd frontend
npm install
npm run dev
```

This starts the React app at **http://localhost:5173** — open that URL in your browser.

> Both the backend (port 8000) and frontend (port 5173) need to be running at the same time.

## URLs to open

| What | URL |
|---|---|
| Frontend app | http://localhost:5173 |
| Backend API docs (Swagger UI) | http://localhost:8000/docs |
| Backend health check | http://localhost:8000/api/health |

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Confirms the backend is running |
| GET | `/api/locations` | List all monitored locations |
| GET | `/api/locations/{id}` | Get one location's full details |
| PUT | `/api/locations/{id}` | Update rainfall/slope/past-landslide — risk is recalculated automatically |
| GET | `/api/reports` | List all field reports |
| POST | `/api/reports` | Submit a new field report |
| PUT | `/api/reports/{id}/review` | Mark a field report as Reviewed |
| GET | `/api/alerts` | List all prototype alerts |
| POST | `/api/alerts` | Create a new prototype alert for a location |
| GET | `/api/dashboard-summary` | Combined stats for the Dashboard page |

## How risk is calculated

There is no machine learning here — this is a transparent, rule-based calculation, recalculated automatically by the backend any time a location's data is edited:

- **High** — sample rainfall ≥ 100mm **and** slope ≥ 30°, **or** a past landslide is recorded **and** rainfall ≥ 90mm.
- **Medium** — exactly one major warning indicator is present (high rainfall, high slope, or a past landslide).
- **Low** — none of the above indicators are present.

See `backend/risk_logic.py` for the exact implementation.

## Hackathon demo flow

See `DEMO_SCRIPT.md` for the full 2-minute walkthrough.

## Troubleshooting

- **`'python' is not recognized`** — Install Python from python.org and make sure "Add to PATH" is checked during install. Restart your terminal afterwards.
- **`'npm' is not recognized`** — Install Node.js (LTS version) from nodejs.org, then restart your terminal.
- **Frontend shows "Unable to load data" everywhere** — Make sure the backend terminal is still running and shows no errors. Visit http://localhost:8000/api/health directly to confirm.
- **CORS error in the browser console** — Confirm the frontend is running on port 5173 (the default). If you changed the port, add it to the `allow_origins` list in `backend/main.py`.
- **Map doesn't show tiles** — Requires an internet connection, since map tiles are loaded live from OpenStreetMap.
- **`python seed.py` says "already has locations"** — This is expected on a second run; it won't duplicate data. Delete `backend/slopesafe.db` and re-run `python seed.py` if you want a completely fresh database.
- **Port already in use** — Stop whatever else is using port 8000 or 5173, or change the port in the `uvicorn` command / `vite.config.js`.

## Limitations

- All rainfall and slope values are sample/illustrative, not real measurements.
- Risk is calculated with simple fixed rules, not a trained ML model.
- No real-time data feed of any kind.
- No real alert delivery (SMS/WhatsApp/email) — alerts are database records shown only inside this app.
- No authentication — the Admin page is open to anyone who opens `/admin`, appropriate only for a local demo.

## Future scope

- Integrating verified weather data feeds (e.g. IMD)
- GIS terrain layers for more accurate slope analysis
- Real satellite imagery for landslide detection
- Field sensor integration (soil moisture, tilt sensors)
- Multilingual alerts for NER's diverse language groups
- Offline sync for areas with poor connectivity
- Proper model validation against historical landslide records before any real-world use
