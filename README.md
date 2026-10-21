# Certifyx Web

Full-stack web version of Certifyx: an admin dashboard plus a REST backend. **No npm install needed** — the server uses only Node's built-in modules (Node 18+).

## Run
```bash
node server.js            # http://localhost:3000
```
Sign in with `jayaramsappa09@gmail.com` / `admin123`.

**Change the password before deploying** (environment variables):

| Variable | Default | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | `admin123` | admin password |
| `ADMIN_EMAIL` | `jayaramsappa09@gmail.com` | admin login |
| `ADMIN_NAME` | `Jayaram Sappa` | name shown in the header |
| `PORT` | `3000` | HTTP port |
| `DATA_DIR` | `./data` | database + uploaded files |

## What it does
- Login (signed tokens, 12 h expiry, rate-limited), all `/api/*` routes protected
- Roster of 66 students seeded from the Android project; add, edit, delete, batch CSV import
- 3-way compliance (Drive uploaded + Sheet updated + Submitted), progress rings and breakdown
- Real certificate upload (PDF/PNG/JPG up to 10 MB) stored on the server, view and delete
- Duplicate detection and one-click removal, Drive-vs-Sheet count mismatch filter, Sync that reconciles
- Needs Review queue: approve / reject with reason, notifications written per student
- Seat matrix (desk map, honeycomb, tiles) with hover HUD, filterable audit table
- Export Center: CSV, Excel (.xls), JSON, and an organized ZIP using four folder layouts (original file names preserved)
- Activity log, settings, PWA install (manifest + service worker), dark/light mode

## Data
Everything lives in `DATA_DIR/db.json` and `DATA_DIR/uploads/`. Back those up to back up the app.

## Deploy
Any host that runs a long-lived Node process with a persistent disk (Render, Railway, Fly.io, a VPS). **Vercel's serverless functions cannot keep `db.json` or uploads between requests**; use a persistent-disk host, or replace `load()`/`save()` in `server.js` with a database (e.g. Supabase) and swap the upload storage for object storage.

## Not included
- No real Google Drive / Google Sheets connection (that needs your Google credentials). Sync reconciles the app's own records; the Drive exporter produces a folder plan and ZIP instead.
- No student login portal (admin dashboard only) and no Android APK.

## Vercel deployment (preview only)
This repository includes `vercel.json` and `api/index.js` to route `/api/*` requests to the existing API, and the login screen now reports a useful error if the API responds with HTML/plain text instead of JSON.

1. Push the **contents** of this folder to the GitHub repository connected to Vercel.
2. In Vercel, set the project Root Directory to the folder containing `vercel.json` and `package.json`.
3. Redeploy, then check `https://YOUR-DOMAIN/api/health` — it should return JSON with `ok: true`.
4. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in Vercel → Project → Settings → Environment Variables, then redeploy.

**Important production limitation:** Vercel functions are serverless and their `/tmp` data is temporary. The roster database and uploaded certificates can reset or differ between function instances. This adapter is suitable for diagnosing the route and previewing the UI, not for reliable production data. For a real deployment, use a persistent database and object storage, or host the original long-running Node server on Render/Railway with a persistent disk. Never use the default password on a public deployment.
