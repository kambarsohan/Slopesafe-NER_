# PLAN.md — SlopeSafe NER

**App:** SlopeSafe NER — Landslide Risk Monitoring and Early Warning Prototype
**For:** Smart India Hackathon 2026, Problem Statement SIH26001

> "Prototype only: risk values are based on sample data and rule-based assessment. This is not an official emergency warning service."

**Status:** All components, backend packages, database seeding, frontend packages, Vite build, and live dev servers are now fully set up and running on your machine.

## Step 0 — Setup
- [x] Create folder structure (`frontend/`, `backend/`, `README.md`, `DEMO_SCRIPT.md`, `PLAN.md`, `.gitignore`)

## Step 1 — Backend foundation
- [x] `backend/database.py`, `backend/models.py`, `backend/schemas.py`
- [x] `backend/requirements.txt` and `.env.example`
- [x] Install backend packages (`fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`)

## Step 2 — Risk logic + seed data
- [x] `backend/risk_logic.py` — rule-based risk calculator (verified against all 10 seed locations)
- [x] `backend/seed.py` — 10 sample NER locations
- [x] Run seed script, seed 10 NER locations into SQLite (`slopesafe.db`)

## Step 3 — Backend API (`backend/main.py`)
- [x] All 10 endpoints written: health, locations (GET/GET-by-id/PUT), reports (GET/POST/review), alerts (GET/POST), dashboard-summary
- [x] CORS enabled for `localhost:5173`
- [x] Run backend on http://localhost:8000 and verify endpoints (/api/health, /api/dashboard-summary, /api/reports, /api/locations)

## Step 4 — Frontend foundation
- [x] Vite + React + Tailwind + React Router + Leaflet/React Leaflet + Recharts configured (`package.json`, `vite.config.js`, `tailwind.config.js`)
- [x] Shared components: `Navbar`, `PrototypeNotice`, `RiskBadge`, `SummaryCard`, `LoadingState`, `ErrorState`, `RiskLegend`
- [x] `src/config.js` env config pointing at backend URL
- [x] Install frontend packages (`react`, `leaflet`, `recharts`, `tailwindcss`, `vite`)

## Step 5 — Pages
- [x] Dashboard (`/`), Risk Map (`/map`), Location Details (`/locations/:id`), Field Report (`/report`), Admin (`/admin`) — all written and wired to the API

## Step 6 — End-to-end testing & Live Execution
- [x] Init DB + seed, run backend, run frontend
- [x] Test all API endpoints
- [x] Verify production build (`npm run build`) succeeded with 0 errors
- [x] Start live servers (Backend: http://127.0.0.1:8000, Frontend: http://127.0.0.1:5173)

## Step 7 — Documentation
- [x] `README.md` — purpose, disclaimer, stack, folder structure, Windows setup commands, URLs, API table, risk logic, troubleshooting, limitations, future scope
- [x] `DEMO_SCRIPT.md` — 2-minute judge walkthrough

## Step 8 — Final handoff
- [x] Both servers are running live on your machine right now! Open http://localhost:5173 in your browser to view the app.

