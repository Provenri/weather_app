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

        -- ---------------------------------------------------------------------------
        -- PROFILES
        -- ---------------------------------------------------------------------------
        -- Stores each user's details (full name). A row is created automatically when
        -- a user signs up (see trigger below). The sign-up form's "Full name" field is
        -- sent to Supabase Auth as user metadata (display_name), which the trigger
        -- copies into this table.

        CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
        CREATE POLICY "Users can view their own profile"
            ON public.profiles
            FOR SELECT
            TO authenticated
            USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
        CREATE POLICY "Users can update their own profile"
            ON public.profiles
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);

        -- Automatically creates a profile when a new user signs up.
        -- SECURITY DEFINER + fixed search_path so it works from the auth schema.
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.profiles (id, full_name)
            VALUES (
                NEW.id,
                COALESCE(NEW.raw_user_meta_data ->> 'display_name', '')
            );
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

        -- Drop and recreate the trigger so this script can be re-run safely.
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

        -- Note: rows created before login support existed have user_id = NULL and are
        -- therefore invisible to everyone, including their original creator.
