import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

// Create Supabase client with service role key (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: { transport: ws },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Save weather history for a user
 * @param {string} userId - The Supabase user ID
 * @param {Object} weatherData - Weather data from OpenWeatherMap
 * @returns {Promise<Object>} The inserted record
 */
export async function saveWeatherHistory(userId, weatherData) {
  const { data, error } = await supabase
    .from('weather_history')
    .insert({
      user_id: userId,
      city_name: weatherData.name,
      country_code: weatherData.sys.country,
      temperature: weatherData.main.temp,
      feels_like: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      wind_speed: weatherData.wind.speed,
      weather_main: weatherData.weather[0].main,
      weather_description: weatherData.weather[0].description,
      weather_icon: weatherData.weather[0].icon,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save weather history: ${error.message}`);
  }

  return data;
}

/**
 * Get weather history for a user
 * @param {string} userId - The Supabase user ID
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of history records
 */
export async function getWeatherHistory(userId, limit = 50) {
  const { data, error } = await supabase
    .from('weather_history')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load weather history: ${error.message}`);
  }

  return data || [];
}