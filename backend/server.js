import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import weatherRoutes from './routes/weather.js';
import historyRoutes from './routes/history.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
const CODESPACES_ORIGIN = /^https:\/\/[a-z0-9-]+-5173\.app\.github\.dev$/;
app.use(cors({
  origin: (origin, callback) => {
    const allowed = !origin || origin === FRONTEND_URL ||
      (process.env.CODESPACES === 'true' && CODESPACES_ORIGIN.test(origin));
    callback(null, allowed ? origin || true : false);
  },
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/history', historyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});