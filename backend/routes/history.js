import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { saveWeatherHistory, getWeatherHistory } from '../services/supabase.js';

const router = express.Router();

// All history routes require authentication
router.use(authMiddleware);

/**
 * POST /api/history
 * Save weather to history
 * Body: { weatherData: <OpenWeatherMap response> }
 */
router.post('/', async (req, res) => {
  try {
    const { weatherData } = req.body;
    
    if (!weatherData) {
      return res.status(400).json({ error: 'weatherData is required' });
    }
    
    const userId = req.user.id;
    const saved = await saveWeatherHistory(userId, weatherData);
    
    res.status(201).json(saved);
  } catch (error) {
    console.error('Save history error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/history
 * Get user's weather history
 * Query: ?limit=50
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    
    const history = await getWeatherHistory(userId, limit);
    res.json(history);
  } catch (error) {
    console.error('Load history error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;