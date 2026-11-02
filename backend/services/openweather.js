const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

if (!OPENWEATHER_API_KEY) {
  throw new Error('Missing OPENWEATHER_API_KEY environment variable');
}

/**
 * Fetch weather data from OpenWeatherMap
 * @param {string} city - City name to search for
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('City not found. Please check the spelling and try again.');
    }
    if (response.status === 401) {
      throw new Error('Invalid OpenWeatherMap API key.');
    }
    throw new Error(`Failed to fetch weather: ${response.statusText}`);
  }
  
  return response.json();
}