import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';


// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai', aiRoutes);
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
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Export for Vercel Serverless Functions
export default app;

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});