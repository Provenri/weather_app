import express from 'express';
import { fetchWeather } from '../services/openweather.js';

const router = express.Router();

/**
 * GET /api/weather?city=<city_name>
 * Proxy endpoint for OpenWeatherMap API
 */
router.get('/', async (req, res) => {
  const { city } = req.query;
  
  if (!city || typeof city !== 'string' || !city.trim()) {
    return res.status(400).json({ error: 'City parameter is required' });
  }
  
  try {
    const weatherData = await fetchWeather(city.trim());
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('API key') ? 401 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

export default router;