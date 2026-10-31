# BITS GOT LATENT — Live Production & Streaming Platform

BITS GOT LATENT is an interactive collegiate talent competition system built for BITS Pilani. It features a Netflix-style public streaming platform, a single-operator 5-judge scoring desk, a secure contestant self-prediction vault, backstage producer controls, and real-time live projector presentation synchronized via Server-Sent Events (SSE).

---

## Architecture & Workspaces

The application runs as a unified full-stack Node.js Express & React service:

- **Public Website (`/` / `#streaming`)**: Netflix-inspired showcase of performers, guest evaluators, and competition details.
- **Producer Admin Control Room (`#admin`)**: Stage director console controlling active performers, slide changes, independent 3-moment score reveals, act reveal resets, and roster CMS.
- **5-Evaluator Scoring Desk (`#judge`)**: Single-laptop operator scoring interface for recording all 5 panel scores (Guest Judges & ComHub Arbiters) strictly in 0.5 increments.
- **Contestant Vault (`#contestant` or `?token=...`)**: Sealed private self-prediction submission portal for performers before taking the stage.
- **Live Stage Projector (`#presentation`)**: Clean, auditorium-scale presentation display supporting fullscreen mode with synchronized animations and celebratory confetti.

Both the **Admin laptop** and **Projector laptop** connect to the same backend instance. All stage transitions, reveals, and score updates broadcast in real-time over `/api/events` Server-Sent Events without page reloads.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server (with Vite HMR)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Production Build & Run

```bash
# 1. Build optimized frontend assets to dist/
npm run build

# 2. Start production server
npm start
```

The production server serves both the compiled React frontend from `dist` and all `/api/*` backend routes on `http://0.0.0.0:${PORT:-3000}`.

---

## Deployment on Render

This repository is ready for deployment on [Render](https://render.com) as a single persistent Web Service:

### 1. Build and Start Commands
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`

### 2. Environment Variables
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render defaults to 10000; the server automatically reads `process.env.PORT`)
- `DATA_DIR`: `/var/data`
- `UPLOADS_DIR`: `/var/data/uploads`

### 3. Persistent Disk Storage (Recommended)
To ensure contestant scores, predictions, and newly uploaded image assets survive restarts and redeployments, attach a Render Persistent Disk:
- **Mount Path:** `/var/data`
- **Size:** `1 GB` (or as required)

When `DATA_DIR=/var/data` is configured:
1. The server automatically initializes `/var/data/.bits_latent_store.json` from the bundled seed data on first boot if not yet present.
2. All newly uploaded image files are stored in `/var/data/uploads`.
3. Existing bundled assets in `public/uploads/` remain available as static fallbacks.

A `render.yaml` blueprint is included in the root directory for one-click Infrastructure-as-Code deployment.

---

## Health Check Endpoints

- `GET /api/health`: Returns system status JSON including uptime, connected SSE clients, and active show state.
- `GET /healthz`: Returns `200 OK` for container orchestrator liveness checks.

---

## Mathematical Scoring Rules

1. **Evaluator Scores:** All 5 individual scores (2 Guest Judges + 3 ComHub Arbiters) must be between 0.0 and 10.0 in multiples of 0.5.
2. **Contestant Self-Predictions:** Contestants predict their own score between 0.0 and 10.0 in multiples of 0.5.
3. **Panel Average:** Arithmetic mean of all 5 scores, ceiled UP to the nearest multiple of 0.5 (`Math.ceil(rawAverage * 2) / 2`).
4. **Calibration Difference (Δ):** `difference = Math.abs(selfPrediction - finalPanelScore)`.
5. **Leaderboard Ranking:** Smallest difference ranks highest (#1). Ties share the rank (1, 1, 3, 4...). Unrevealed acts remain unranked and sealed until official presentation reveal.
