# DEMO_SCRIPT.md — 2-Minute Judge Demo

**Before you start:** have both servers running (backend on :8000, frontend on :5173) and the frontend open at http://localhost:5173.

1. **Open the Dashboard** (`/`)
   Point out the prototype notice banner at the top — say clearly this is sample data and rule-based logic, not a real warning system.

2. **Show the summary cards and chart**
   High-risk count, medium-risk count, field reports received, and the rainfall-vs-risk chart. Mention the "How this prototype calculates risk" panel — this is the transparent rule logic, not a black box.

3. **Open the Risk Map** (`/map`)
   Show the color-coded markers across North East India and the legend (color + icon + text, so it's accessible).

4. **Choose a High-risk location** (e.g. Shillong or Gangtok)
   Click its marker, open the popup, point out the sample rainfall/slope/past-landslide fields and the safety recommendation.

5. **Open Location Details**
   Click "View location details" from the popup. Show the full detail page.

6. **Create a Prototype Alert**
   Click "Create Prototype Alert." Point out the success message explicitly says no real SMS/WhatsApp/email was sent.

7. **Submit one Field Report** (`/report`)
   Fill in a quick example (e.g. "Slope crack" at Aizawl, Medium severity) and submit. Show the success confirmation.

8. **Open Admin** (`/admin`)
   Show the new alert in Alert History and the new report in the Field Reports table (status: Pending).

9. **Edit risk inputs, show automatic recalculation**
   Click "Edit" on a Low-risk location, raise the rainfall to e.g. 120mm and slope to 32°, save. Point out the risk badge updates to High immediately, calculated by the backend — not entered manually.

10. **Wrap up**
    Restate: sample data, rule-based logic, no live feeds, no real alerts — a working demonstration of the full data flow (frontend ↔ backend ↔ database) that a real system would extend with verified weather data, GIS terrain layers, satellite imagery, and field sensors.
