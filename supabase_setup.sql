-- Supabase Database Setup for Weather App
-- Run this in your Supabase SQL Editor

-- Create the weather_history table
CREATE TABLE weather_history (
    id BIGSERIAL PRIMARY KEY,
    city_name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    temperature REAL NOT NULL,
    feels_like REAL NOT NULL,
    humidity INTEGER NOT NULL,
    pressure INTEGER NOT NULL,
    wind_speed REAL NOT NULL,
    weather_main TEXT NOT NULL,
    weather_description TEXT NOT NULL,
    weather_icon TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE weather_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own weather history
-- (For anonymous access, we'll use a different approach - see below)
CREATE POLICY "Users can view their own weather history"
    ON weather_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own weather history
CREATE POLICY "Users can insert their own weather history"
    ON weather_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own weather history
CREATE POLICY "Users can update their own weather history"
    ON weather_history
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own weather history
CREATE POLICY "Users can delete their own weather history"
    ON weather_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_weather_history_user_id ON weather_history(user_id);
CREATE INDEX idx_weather_history_timestamp ON weather_history(timestamp DESC);
CREATE INDEX idx_weather_history_city ON weather_history(city_name);

-- Alternative: If you want to allow anonymous/public access (no auth required)
-- Uncomment the following and comment out the user-specific policies above:

/*
-- Policy: Allow public read access (for anonymous users)
CREATE POLICY "Public read access"
    ON weather_history
    FOR SELECT
    USING (true);

-- Policy: Allow public insert (for anonymous users)
CREATE POLICY "Public insert access"
    ON weather_history
    FOR INSERT
    WITH CHECK (true);
*/

-- For the current implementation (anonymous access), use these policies instead:
-- The app uses the anon key, so we need policies that work with anon role

-- Drop the user-specific policies if they exist
DROP POLICY IF EXISTS "Users can view their own weather history" ON weather_history;
DROP POLICY IF EXISTS "Users can insert their own weather history" ON weather_history;
DROP POLICY IF EXISTS "Users can update their own weather history" ON weather_history;
DROP POLICY IF EXISTS "Users can delete their own weather history" ON weather_history;

-- Create policies for anonymous access (using anon role)
CREATE POLICY "Anon can read weather history"
    ON weather_history
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Anon can insert weather history"
    ON weather_history
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Optional: Add a policy for authenticated users to manage their own data
CREATE POLICY "Authenticated users can read all"
    ON weather_history
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert"
    ON weather_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);