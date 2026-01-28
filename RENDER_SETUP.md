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

## Alle User in Production löschen

1. Render Dashboard → dein **Web Service** → **Shell** (oder "Run Command" / One-off Job).
2. Im Container:

   ```bash
   cd /app
   CONFIRM_DELETE_ALL_USERS=yes node scripts/delete-all-users.js
   ```

   Oder mit npm (falls `package.json` Scripts ausführbar sind):

   ```bash
   cd /app
   CONFIRM_DELETE_ALL_USERS=yes npm run db:delete-users
   ```

3. In Production ist die Bestätigung **Pflicht**: `CONFIRM_DELETE_ALL_USERS=yes`, sonst bricht das Script ab.

Es werden alle User sowie zugehörige Tokens, Timelines, Events und Event-Images gelöscht. Die Bilddateien auf dem Disk (`/var/data/events/`) bleiben erhalten und können bei Bedarf manuell gelöscht werden.

---

## E-Mails in Production (550 B-URL / SpAM blockiert)

Fehler wie **550 5.7.1 Refused by local policy. Sending of SPAM is not permitted! (B-URL)** entstehen oft, wenn:

- Ein normaler SMTP-Anbieter (z. B. GMX, Web.de, Office) genutzt wird – die lehnen Links in Mails oft ab.
- **APP_URL** auf `http://` steht oder eine unbekannte Domain ist.
- Die **From-Adresse** nicht zur SMTP-Domain passt.

**Empfehlung für Production:** Einen **Transactional-E-Mail-Dienst** nutzen:

| Anbieter   | SMTP_HOST           | Port | Hinweis                    |
|-----------|----------------------|------|----------------------------|
| **Resend** | smtp.resend.com      | 465  | API-Key als SMTP_PASSWORD |
| **SendGrid** | smtp.sendgrid.net  | 587  | API-Key als SMTP_PASSWORD |
| **Mailgun** | smtp.mailgun.org    | 587  | Domain verifizieren        |

**Wichtig:**

1. **APP_URL** in Production auf deine echte Frontend-URL setzen (mit **https**), z. B. `https://deine-app.vercel.app`.
2. **SMTP_FROM_EMAIL** muss eine Adresse auf deiner verifizierten Domain sein (z. B. `noreply@deinedomain.com`).
3. Beim Anbieter Domain verifizieren und ggf. SPF/DKIM einrichten (wird oft in der Doku erklärt).

---

## Troubleshooting

- **Bilder werden nicht gespeichert**: Prüfe, ob `STORAGE_DIR` gesetzt ist und der Mount Path korrekt ist
- **Permission Error**: Der Disk sollte automatisch die richtigen Permissions haben
- **Disk nicht sichtbar**: Stelle sicher, dass der Disk zum Service attached ist
