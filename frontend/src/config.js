// Environment configuration.
// Uses relative '/api' when deployed to production (e.g. Vercel),
// or fallback to local FastAPI backend on port 8000 during local development.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "/api"
    : "http://localhost:8000/api");
