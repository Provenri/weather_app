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
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    );

    -- For databases created before the app had login support, add the column
    -- if the table already existed.
    ALTER TABLE public.weather_history
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

    CREATE INDEX IF NOT EXISTS idx_weather_history_timestamp ON public.weather_history (timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_weather_history_user_id ON public.weather_history (user_id);

    -- Row Level Security: with RLS on and no matching policy, access is denied.
    ALTER TABLE public.weather_history ENABLE ROW LEVEL SECURITY;

    -- History is private per user. Signed-in (authenticated) users can read and
    -- insert only rows where user_id matches their own account. Guests (the anon
    -- role) have no access to history at all.
    DROP POLICY IF EXISTS "Anyone can read weather history" ON public.weather_history;
    DROP POLICY IF EXISTS "Anyone can insert weather history" ON public.weather_history;
    DROP POLICY IF EXISTS "Users can read their own weather history" ON public.weather_history;
    DROP POLICY IF EXISTS "Users can insert their own weather history" ON public.weather_history;

    CREATE POLICY "Users can read their own weather history"
        ON public.weather_history
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own weather history"
        ON public.weather_history
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

    -- Note: rows created before login support existed have user_id = NULL and are
    -- therefore invisible to everyone, including their original creator.
