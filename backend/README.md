# Visonix Backend

Node.js + Express + MongoDB API. Receives frames, forwards them to the AI
service, stores results, raises alerts, and pushes live updates to the
dashboard over Socket.io.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (MongoDB Atlas free tier), AI_SERVICE_URL, etc.
npm run dev
```

Make sure `ai-service` is already running (see `ai-service/README.md`) —
the backend calls it directly.

## Data Model

- **Zone** — one monitored location/video source (name, thresholds, optional
  lat/lng for later map view).
- **Reading** — one AI prediction result for a zone at a point in time. This
  is what the trend graph is built from.
- **Alert** — created automatically whenever a Reading's status is
  "Dangerous".

## Core Endpoints

| Method | Path                                | Purpose                              |
|--------|-------------------------------------|----------------------------------------|
| POST   | `/api/zones`                        | Create a zone                          |
| GET    | `/api/zones`                        | List all zones                         |
| GET    | `/api/zones/:id`                    | Get one zone                           |
| POST   | `/api/zones/:zoneId/process-frame`  | Upload an image, get AI result stored  |
| GET    | `/api/zones/:zoneId/history`        | Reading history for the trend graph    |
| GET    | `/api/alerts`                       | All alerts, most recent first          |

## Live Updates

The server emits a `zone-update` Socket.io event every time a frame is
processed, with shape:

```json
{
  "zoneId": "...",
  "zoneName": "Zone 1 - Entrance",
  "count": 42,
  "status": "Safe",
  "timestamp": "...",
  "alert": false
}
```

The React frontend listens for this event to update the dashboard live,
without polling.

## Testing Without the Frontend Yet

You can create a zone and process a frame with curl once both this server
and `ai-service` are running:

```bash
curl -X POST http://localhost:5000/api/zones \
  -H "Content-Type: application/json" \
  -d '{"name": "Zone 1 - Test"}'

curl -X POST http://localhost:5000/api/zones/<ZONE_ID>/process-frame \
  -F "file=@/path/to/test-image.jpg"
```
