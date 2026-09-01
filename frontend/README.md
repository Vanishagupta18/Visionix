# Visonix Frontend

React dashboard — not scaffolded inside this zip (React project generators
need to run on your machine / need network access to npm), but here's the
exact setup so you land on the same structure.

## 1. Create the React app (inside this `frontend/` folder)

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install socket.io-client axios recharts react-router-dom
```

(Vite is used here instead of create-react-app — it's faster and is the
current standard; functionally it doesn't matter which you pick.)

## 2. Suggested folder structure once scaffolded

```
frontend/
├── src/
│   ├── components/
│   │   ├── ZoneCard.jsx        (one zone's status tile)
│   │   ├── TrendGraph.jsx      (Recharts line chart)
│   │   ├── AlertsPanel.jsx     (list of recent alerts)
│   ├── pages/
│   │   ├── Dashboard.jsx       (main overview — all zones)
│   │   ├── ZoneDetail.jsx      (one zone: live status + graph + upload)
│   │   ├── Alerts.jsx          (full alerts history)
│   │   ├── Login.jsx
│   ├── services/
│   │   ├── api.js              (axios instance pointing at backend)
│   │   ├── socket.js           (socket.io-client connection)
│   ├── App.jsx
│   └── main.jsx
```

## 3. Environment variable

Create `frontend/.env`:
```
VITE_BACKEND_URL=http://localhost:5000
```

## 4. Minimal starter snippets

`src/services/api.js`
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export default api;
```

`src/services/socket.js`
```js
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default socket;
```

`src/pages/Dashboard.jsx` (starting point — expand as you build)
```jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import socket from '../services/socket';

export default function Dashboard() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    api.get('/api/zones').then((res) => setZones(res.data));

    socket.on('zone-update', (update) => {
      setZones((prev) =>
        prev.map((z) =>
          z._id === update.zoneId ? { ...z, lastCount: update.count, lastStatus: update.status } : z
        )
      );
    });

    return () => socket.off('zone-update');
  }, []);

  return (
    <div>
      <h1>Visonix — Crowd Monitoring Dashboard</h1>
      {zones.map((z) => (
        <div key={z._id}>
          {z.name}: {z.lastCount ?? '—'} people ({z.lastStatus ?? 'No data yet'})
        </div>
      ))}
    </div>
  );
}
```

## Run it

```bash
npm run dev
```

Make sure `ai-service` and `backend` are both already running first.
