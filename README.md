<p align="center">
  <img src="https://img.shields.io/badge/🧬-PharmaGuard-0d7377?style=for-the-badge&labelColor=0a0a0a&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZDczNzciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMiAxNWMwLTQuNCAxLjktNC40IDEuOS05LjUgMC0xLjcgMS4xLTMuNSAzLjEtMy41IDIgMCAzLjEgMS44IDMuMSAzLjVDMTAuMSAxMC42IDEyIDE0IDEyIDE1Ii8+PHBhdGggZD0iTTIyIDE1YzAtNC40LTEuOS00LjQtMS45LTkuNSAwLTEuNy0xLjEtMy41LTMuMS0zLjUtMiAwLTMuMSAxLjgtMy4xIDMuNS0uMSA1LjEtMiA0LjYtMiA5LjUiLz48cGF0aCBkPSJNNiA5aDEyIi8+PHBhdGggZD0iTTcgNmgxMCIvPjxwYXRoIGQ9Ik04IDNoOCIvPjxwYXRoIGQ9Ik05IDEyaDYiLz48cGF0aCBkPSJNMiAxNWgyMCIvPjxwYXRoIGQ9Ik0yIDE4aDIwIi8+PHBhdGggZD0iTTIgMjFoMjAiLz48L3N2Zz4=" alt="PharmaGuard" width="350" />
</p>

<h3 align="center">AI-Powered Pharmacogenomics Risk Prediction Platform</h3>

<p align="center">
  <em>Personalized Precision Medicine — Upload your genomic VCF file and receive real-time pharmacogenomic drug safety insights powered by AI.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/FastAPI-0.100-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Groq-LLaMA_3.1-F55036?style=flat-square&logo=meta&logoColor=white" alt="Groq LLaMA" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-api-reference">API Reference</a>
</p>

---

## 🩺 What is PharmaGuard?

PharmaGuard is a full-stack clinical decision support platform that bridges the gap between **raw genomic data** and **actionable drug safety insights**. Clinicians, researchers, and patients can upload a standard VCF (Variant Call Format) file, select medications of interest, and receive AI-generated pharmacogenomic risk assessments aligned with **CPIC (Clinical Pharmacogenetics Implementation Consortium)** guidelines.

### The Problem

> Over **95% of people** carry at least one pharmacogenomic variant that affects drug response. Adverse drug reactions cause **~100,000 deaths/year** in the US alone. Most clinicians don't have time to manually cross-reference genetic variants with drug interaction databases.

### Our Solution

PharmaGuard automates the entire pipeline — from VCF parsing to clinical recommendation — delivering structured risk reports with confidence scores, severity levels, mechanistic explanations, and dosage recommendations in seconds.

---

## ✨ Features

### 🔬 Core Analysis Engine
- **VCF File Upload** — Drag-and-drop support for VCF v4.1/v4.2 files (up to 5MB)
- **Multi-Drug Analysis** — Analyze multiple medications simultaneously against genomic variants
- **AI-Powered Risk Assessment** — LLM-generated explanations with risk labels (Safe / Adjust / Toxic / Ineffective)
- **CPIC-Aligned Guidelines** — Recommendations based on clinical pharmacogenetics standards (v24.2)
- **Confidence Scoring** — Each prediction includes a transparent confidence percentage

### 📊 Interactive Report Dashboard
- **Comprehensive Drug Cards** — Risk level, severity, gene-drug interactions, and dosage recommendations
- **Risk Heatmap Visualizations** — Gene-drug interaction matrix with color-coded risk levels
- **Clinical Decision Panel** — Structured clinical recommendations for each drug
- **Advanced Insights** — Polygenic risk scores, drug-drug interaction layers, and variant details
- **Export Center** — Download reports as PDF or JSON for clinical records

### 🤖 AI Clinical Chat Assistant
- **Context-Aware Conversations** — The AI assistant has access to the patient's full pharmacogenomic report
- **Three Explanation Modes** — Clinical (technical), Patient (simplified), Research (academic)
- **Quick Prompts** — One-click questions like "Which drug is safest?", "Why this confidence?", "What-if analysis?"
- **Drug Ranking & What-If Simulation** — Compare drug safety and simulate gene variant changes

### 🔐 Authentication & User Management
- **JWT-Based Auth** — Secure token-based authentication with HTTP-only cookies
- **Google OAuth (OpenID Connect)** — One-click sign-in with Google
- **Email Verification** — OTP-based email verification and password reset
- **User Profiles** — Personal dashboards with analysis history and settings

### 🎨 UI/UX
- **Dark Mode First** — Premium dark theme with teal accent palette
- **Animated DNA Logo** — Spinning DNA helix with pulse ring animation in navbar
- **Typing Animations** — Hero section "Precision Medicine" types letter-by-letter
- **Framer Motion** — Smooth page transitions, hover effects, and micro-animations
- **Responsive Design** — Fully responsive across desktop, tablet, and mobile

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│              React 19 + TypeScript + Vite                    │
│         Framer Motion • Recharts • Lucide Icons              │
│                  localhost:5173 / Vercel                      │
└──────────────┬────────────────────────┬─────────────────────┘
               │ /api/v1/users/*        │ /api/v1/upload
               │ /api/v1/records/*      │ /api/v1/analyze
               ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS API                             │
│          Auth • Upload • Records • Analysis Proxy            │
│        JWT + Google OAuth • Multer • Mongoose                │
│                  localhost:3000 / Vercel                      │
└──────────────┬──────────────────────────────────────────────┘
               │ POST /analyze (VCF data + drug list)
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI SERVICE                            │
│            AI Analysis • Groq LLaMA 3.1 • Gemini             │
│           VCF Parsing • Risk Scoring • CPIC Lookup           │
│                  localhost:8000 / Render                      │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS                              │
│        Users • Genomic Records • Analysis Results            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework with hooks & concurrent features |
| **TypeScript 5.5** | Type-safe development |
| **Vite 5.4** | Lightning-fast dev server & bundler |
| **Framer Motion 12** | Animations & page transitions |
| **Recharts 2.12** | Data visualization & charts |
| **React Router 7** | Client-side routing |
| **Lucide React** | Icon system |
| **GSAP** | Advanced scroll-based animations |

### Backend (Express.js)
| Technology | Purpose |
|---|---|
| **Express 4.18** | REST API framework |
| **Mongoose 9.2** | MongoDB ODM |
| **JSON Web Token** | Authentication |
| **bcrypt.js** | Password hashing |
| **Multer 2.0** | File upload handling |
| **Helmet** | Security headers |
| **jwks-rsa** | Google OAuth token verification |
| **Nodemailer** | Email service (OTP, verification) |

### Backend (FastAPI)
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance Python API |
| **Groq SDK** | LLaMA 3.1 8B inference |
| **Google Gemini** | Alternative AI model |
| **Pandas** | VCF data processing |
| **Pydantic** | Request/response validation |

### Infrastructure
| Service | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud database |
| **Vercel** | Frontend + Express deployment |
| **Render** | FastAPI deployment |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.11
- **MongoDB** (Atlas or local)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/PharmaGuard.git
cd PharmaGuard
```

### 2. Start the Express Backend

```bash
cd backend/express-service
cp .env.example .env          # Configure your env vars
npm install
npm run dev                   # Runs on http://localhost:3000
```

<details>
<summary><strong>Required Environment Variables (Express)</strong></summary>

```env
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/

# Auth
JWT_SECRET=your-jwt-secret
ACCESSTOKEN_SECRET=your-access-secret
ACCESSTOKEN_EXPIRY=5m
REFRESHTOKEN_SECRET=your-refresh-secret
REFRESHTOKEN_EXPIRY=24h

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/users/google/callback

# AI Keys
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key

# FastAPI URL
FASTAPI_URL=http://localhost:8000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

</details>

### 3. Start the FastAPI Service

```bash
cd backend/fastapi-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000   # Runs on http://localhost:8000
```

<details>
<summary><strong>Required Environment Variables (FastAPI)</strong></summary>

```env
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=groq/llama-3.1-8b-instant
GEMINI_API_KEY=your-gemini-api-key
```

</details>

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev                   # Runs on http://localhost:5173
```

The Vite dev server automatically proxies `/api/*` requests to `http://localhost:3000`.

### Quick Start (All Services)

```bash
# From root directory
start-app.bat                 # Windows: starts all 3 services
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
# In Vercel project settings:
# Root Directory: frontend
# Build Command: npm run build
# Output Directory: dist
```

**Environment Variable:**
```
VITE_API_BASE_URL=https://your-express-backend.vercel.app
```

### Express Backend → Vercel

```bash
# In Vercel project settings:
# Root Directory: backend/express-service
```

The `vercel.json` routes all requests to the Express serverless function.

Set all environment variables from the Express `.env` in the Vercel dashboard.

### FastAPI → Render

```bash
# Render Web Service settings:
# Root Directory: backend/fastapi-service
# Build Command: pip install -r requirements.txt
# Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

> **Note:** If FastAPI is unavailable, Express returns CPIC-aligned fallback results so the UI flow remains functional.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/register` | Create new account |
| `POST` | `/api/v1/users/login` | Email/password login |
| `POST` | `/api/v1/users/logout` | Logout (clears cookie) |
| `GET` | `/api/v1/users/get-profile` | Get user profile (auth required) |
| `PUT` | `/api/v1/users/update-profile` | Update profile (auth required) |
| `GET` | `/api/v1/users/google/login` | Initiate Google OAuth |
| `GET` | `/api/v1/users/google/callback` | Google OAuth callback |
| `POST` | `/api/v1/users/forgot-password` | Request password reset OTP |
| `POST` | `/api/v1/users/verify-reset-otp` | Verify reset OTP |
| `POST` | `/api/v1/users/reset-password` | Set new password |

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/upload` | Upload VCF file |
| `POST` | `/api/v1/analyze` | Trigger drug analysis |
| `GET` | `/api/v1/records` | List user's records |
| `GET` | `/api/v1/records/id/:recordId` | Get specific record |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Express health check |
| `GET` | `http://fastapi-host/health` | FastAPI health check |

---

## 📂 Project Structure

```
PharmaGuard/
├── frontend/                          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── ai-chat/               # AI Chat Assistant (5 files)
│   │   │   └── ui/                    # Background effects, cards
│   │   ├── contexts/                  # Auth & Theme providers
│   │   ├── pages/                     # 28 page components
│   │   │   ├── LandingPage.tsx        # Hero + features
│   │   │   ├── LoginPage.tsx          # Email + Google OAuth login
│   │   │   ├── VCFUpload.tsx          # 2-step upload wizard
│   │   │   ├── ReportPage.tsx         # Full analysis dashboard
│   │   │   ├── UserDashboard.tsx      # User home with history
│   │   │   └── ...                    # 23 more components
│   │   └── services/                  # API clients
│   └── vite.config.ts
│
├── backend/
│   ├── express-service/               # Node.js API
│   │   ├── src/
│   │   │   ├── controllers/           # Upload & analysis logic
│   │   │   ├── models/                # Mongoose schemas
│   │   │   ├── routes/                # Express routes
│   │   │   └── index.js               # Server entry
│   │   ├── auth/                      # Auth module
│   │   │   ├── controllers/           # Login, register, OAuth
│   │   │   ├── middlewares/           # JWT verification
│   │   │   ├── models/               # User schema
│   │   │   └── routes/               # Auth routes
│   │   └── vercel.json               # Vercel serverless config
│   │
│   └── fastapi-service/              # Python AI service
│       ├── app/
│       │   ├── api/                   # /analyze endpoint
│       │   └── main.py               # FastAPI app
│       └── requirements.txt
│
├── render.yaml                       # Render Blueprint (IaC)
├── start-app.bat                     # Local dev launcher
└── README.md
```

---

## 🔒 Security

- **HTTP-Only Cookies** — JWT tokens stored in secure, HTTP-only cookies
- **Helmet.js** — Security headers (CSP, HSTS, X-Frame-Options)
- **bcrypt** — Password hashing with salt rounds
- **CORS** — Strict origin validation with credentials support
- **Input Validation** — express-validator on all endpoints
- **Google OAuth** — OpenID Connect with PKCE-like state/nonce verification

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Built with 🧬 by the PharmaGuard Team
</p>
