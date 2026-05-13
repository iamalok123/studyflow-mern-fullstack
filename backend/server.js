import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import securityHeaders from './middlewares/securityHeaders.js';
import { createRateLimiter } from './middlewares/rateLimiter.js';
import { validateEnv } from './utils/env.js';
import connectDB, { getDbStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';


// Initialize express app
validateEnv();
const app = express();

app.use(securityHeaders);

// Middleware to handle CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, "http://localhost:5173"]
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Exact match against allowed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any Vercel preview deployment (*.vercel.app)
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const generalRateLimit = createRateLimiter({
  keyPrefix: "general",
  windowMs: 60 * 1000,
  max: 180,
});

const authRateLimit = createRateLimiter({
  keyPrefix: "auth",
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many authentication attempts. Please try again later.",
});

const uploadRateLimit = createRateLimiter({
  keyPrefix: "upload",
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many upload attempts. Please try again later.",
});

const aiRateLimit = createRateLimiter({
  keyPrefix: "ai",
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many AI requests. Please slow down and try again.",
});

app.use(generalRateLimit);

const ensureDbConnected = async (req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      error: "Database connection unavailable. Please try again shortly.",
      statusCode: 503,
    });
  }
};

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StudyFlow API is running',
    database: getDbStatus(),
  });
});

// Routes
app.use('/api', ensureDbConnected);
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/documents/upload', uploadRateLimit);
app.use('/api/documents', documentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai', aiRateLimit, aiRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);


// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    statusCode: 404
  });
});

app.use(errorHandler);


// Start server locally (Vercel handles routing automatically via export)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`StudyFlow API running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  connectDB().catch(() => {
    // connectDB logs one concise, actionable database status line.
  });
}

// Export for Vercel Serverless Functions
export default app;

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
