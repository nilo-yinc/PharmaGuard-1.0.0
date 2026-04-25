const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const connectDB = require('./config/database');

// Import routes
const uploadRoutes = require('./routes/upload.routes');
const userRoutes = require('../auth/routes/user.routes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  'http://localhost:5173,http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalhost = (origin) => /^https?:\/\/localhost(:\d+)?$/.test(origin);
const allowVercelPreviews = String(process.env.ALLOW_VERCEL_PREVIEWS || '').toLowerCase() === 'true';
const vercelFrontendPrefix = (process.env.VERCEL_FRONTEND_PREFIX || '').trim().toLowerCase();

const isAllowedVercelPreview = (origin) => {
  if (!allowVercelPreviews) return false;
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (!host.endsWith('.vercel.app')) return false;
    if (!vercelFrontendPrefix) return true;
    return host.startsWith(`${vercelFrontendPrefix}-`) || host === `${vercelFrontendPrefix}.vercel.app`;
  } catch (_) {
    return false;
  }
};

// Middleware — CORS must come BEFORE helmet so preflight OPTIONS passes
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, server-to-server)
    if (!origin) return callback(null, true);
    // In development, allow any localhost port
    if (process.env.NODE_ENV !== 'production' && isLocalhost(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || isAllowedVercelPreview(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to PharmaGuard Express API',
    service: 'Express.js',
    version: '1.0.0',
    database: 'MongoDB',
    endpoints: {
      auth: 'POST /api/v1/users/login',
      upload: 'POST /api/v1/upload',
      records: 'GET /api/v1/records',
      patientRecord: 'GET /api/v1/records/:patientId',
      status: 'GET /api/v1/records/:recordId/status'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'express-service',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on http://localhost:${PORT}`);
    console.log(`📚 Service: PharmaGuard Express API`);

    // ── Keep-Alive Pinger ─────────────────────────────────────────────
    // Prevent free-tier services (Render/Vercel) from sleeping after
    // 15 min of inactivity by self-pinging every 14 minutes.
    if (process.env.NODE_ENV === 'production') {
      const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

      const selfUrl =
        process.env.BACKEND_BASE_URL ||
        `http://localhost:${PORT}`;
      const fastApiUrl = process.env.FASTAPI_URL;

      const keepAlive = async () => {
        const timestamp = new Date().toISOString();
        // Ping Express (self)
        try {
          await axios.get(`${selfUrl}/health`, { timeout: 10000 });
          console.log(`💚 [${timestamp}] Keep-alive: Express OK`);
        } catch (err) {
          console.warn(`⚠️  [${timestamp}] Keep-alive: Express ping failed —`, err.message);
        }
        // Ping FastAPI
        if (fastApiUrl) {
          try {
            await axios.get(`${fastApiUrl}/health`, { timeout: 10000 });
            console.log(`💚 [${timestamp}] Keep-alive: FastAPI  OK`);
          } catch (err) {
            console.warn(`⚠️  [${timestamp}] Keep-alive: FastAPI  ping failed —`, err.message);
          }
        }
      };

      setInterval(keepAlive, PING_INTERVAL);
      console.log(`⏰ Keep-alive pinger active — pinging every 14 min`);
    }
  });
}

module.exports = app;
