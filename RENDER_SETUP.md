# Render.com Setup mit Disk Storage

## 1. Disk Volume in Render.com erstellen

1. Gehe zu deinem Render Dashboard
2. Klicke auf **"New"** → **"Disk"**
3. Name: `timeline-storage`
4. Größe: z.B. 10 GB (kann später erweitert werden)
5. Erstelle den Disk

## 2. Web Service konfigurieren

### Option A: Über render.yaml (empfohlen)

Die `render.yaml` ist bereits erstellt. Beim Deploy auf Render.com wird sie automatisch verwendet.

### Option B: Über Dashboard

1. Gehe zu deinem Web Service
2. **Settings** → **Disks**
3. Klicke **"Attach Disk"**
4. Wähle `timeline-storage`
5. Mount Path: `/var/data`
6. Speichern

## 3. Environment Variable setzen

Im Render Dashboard → **Environment**:

```
STORAGE_DIR=/var/data
```

**Wichtig:** Der Mount Path muss mit `STORAGE_DIR` übereinstimmen!

## 4. Weitere Environment Variables

Setze auch diese Variablen im Render Dashboard:

```
NODE_ENV=production
PORT=3000
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=... (mind. 32 Zeichen)
CORS_ORIGIN=https://deine-frontend-url.com
APP_URL=https://deine-frontend-url.com
```

## 5. Deploy

Nach dem Deploy werden Bilder automatisch unter:
- `/var/data/events/{eventId}/{filename}` gespeichert

Der Disk ist persistent - Bilder bleiben auch nach Neustarts erhalten!

## Troubleshooting

- **Bilder werden nicht gespeichert**: Prüfe, ob `STORAGE_DIR` gesetzt ist und der Mount Path korrekt ist
- **Permission Error**: Der Disk sollte automatisch die richtigen Permissions haben
- **Disk nicht sichtbar**: Stelle sicher, dass der Disk zum Service attached ist
