# PharmaGuard Frontend

React + Vite client for PharmaGuard pharmacogenomic workflow.

## Local Run

```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## Environment

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

`VITE_API_BASE_URL` behavior:
- Empty: use same-origin `/api/v1/*` (recommended with Vite proxy in local dev)
- Set value (e.g. `https://your-render-backend.onrender.com`): use absolute backend URL

## Build

```bash
npm run build
```

## Deploy (Vercel)

- Deploy from `frontend/` directory.
- Add env var:
  - `VITE_API_BASE_URL=https://<your-render-backend>`
- `vercel.json` includes SPA rewrite to `index.html`.
