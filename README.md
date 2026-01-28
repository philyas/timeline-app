# Timeline App

## Entwicklung (DB in Docker, Backend & Frontend lokal)

1. **Datenbank starten**
   ```bash
   docker compose up -d db
   ```

2. **Backend** (im Ordner `backend`)
   ```bash
   cd backend
   npm install
   npm start
   ```
   Startet den Server mit **nodemon** (Neustart bei Änderungen) auf `http://localhost:3000`.

3. **Frontend** (im Ordner `frontend`)
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Startet den Dev-Server mit **ng serve** auf `http://localhost:4200` (Proxy zu `/api` → Backend).

Backend erwartet eine `.env` mit DB-Zugang (siehe `backend/.env.example`). Bei lokaler DB über Docker: `DB_HOST=localhost`.

---

## Optional: Alles mit Docker

```bash
docker compose --profile full up -d
```
Startet DB, Backend und Frontend in Containern (Frontend auf Port 4200).
# timeline-app
# timeline-app
