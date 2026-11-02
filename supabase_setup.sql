-- Supabase setup for the Weather App. Run in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.weather_history (
    id BIGSERIAL PRIMARY KEY,
    city_name TEXT NOT NULL CHECK (char_length(city_name) <= 100),
    country_code TEXT NOT NULL CHECK (char_length(country_code) <= 10),
    temperature REAL NOT NULL,
    feels_like REAL NOT NULL,
    humidity INTEGER NOT NULL,
    pressure INTEGER NOT NULL,
    wind_speed REAL NOT NULL,
    weather_main TEXT NOT NULL CHECK (char_length(weather_main) <= 100),
    weather_description TEXT NOT NULL CHECK (char_length(weather_description) <= 200),
    weather_icon TEXT NOT NULL CHECK (char_length(weather_icon) <= 10),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_history_timestamp ON public.weather_history (timestamp DESC);

-- Row Level Security: with RLS on and no matching policy, access is denied.
ALTER TABLE public.weather_history ENABLE ROW LEVEL SECURITY;

-- The app has no login, so visitors use the anon role. They may read all rows
-- (the shared city list) and add new rows, but never update or delete.
DROP POLICY IF EXISTS "Anyone can read weather history" ON public.weather_history;
DROP POLICY IF EXISTS "Anyone can insert weather history" ON public.weather_history;

CREATE POLICY "Anyone can read weather history"
    ON public.weather_history
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Anyone can insert weather history"
    ON public.weather_history
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
