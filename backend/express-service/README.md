# PharmaGuard Backend (Express)

Single Express service for:
- Auth APIs: `/api/v1/users/*`
- VCF upload + records: `/api/v1/*`
- Analysis trigger: `/api/v1/analyze`

## Local Run

```bash
npm install
npm run dev
```

Default URL: `http://localhost:3000`

## Environment

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

Required minimum:
- `PORT`
- `FRONTEND_URL`
- `MONGO_URI`
- `JWT_SECRET`

Optional:
- `FASTAPI_URL` (if unavailable, backend returns fallback CPIC-aligned demo results)
- Google OAuth variables

## Key Endpoints

- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `GET /api/v1/users/get-profile`
- `POST /api/v1/upload` (multipart: `vcfFile`, `patientId`)
- `POST /api/v1/analyze` (`recordId`, `drugs[]`)
- `GET /api/v1/records`
- `GET /api/v1/records/id/:recordId`

## Deploy (Render)

- Root directory: `backend/express-service`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env.example`
- Set `FRONTEND_URL` to your Vercel domain (or comma-separated list if multiple)
