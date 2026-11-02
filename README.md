# Weather App with Supabase

A simple weather application that fetches weather data from OpenWeatherMap and stores private, per-user search history in Supabase with Row Level Security.

## Features

- Search weather by city name
- Display current temperature, humidity, wind speed, pressure, and "feels like" temperature
- Sign up and sign in with email and password (Supabase Auth)
- Search history stored in Supabase database, private per user
- Guest access: search weather without an account (history is only saved for signed-in users)
- Row Level Security (RLS) enabled on Supabase table
- Responsive design works on mobile and desktop

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and run the contents of `supabase_setup.sql`
4. Enable the email provider: Authentication → Providers → Email. Whether new accounts must confirm their email before signing in is controlled by the "Confirm email" setting on that page.
5. Get your project URL and anon key from Settings → API

### 2. OpenWeatherMap API Key

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Get your free API key

### 3. Configure the Application

**Local:** copy `config.example.js` to `config.js` (gitignored) and fill in your keys:

```javascript
window.APP_CONFIG = {
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key',
    OPENWEATHER_API_KEY: 'your-openweather-api-key'
};
```

**GitHub Pages:** in the repo go to Settings → Pages and set Source to **GitHub Actions**. Then add three repository secrets under Settings → Secrets and variables → Actions: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENWEATHER_API_KEY`. The workflow in `.github/workflows/deploy.yml` generates `config.js` from them on every push to `main`. Note that the keys are still visible to anyone using the deployed page; restrict them accordingly.

### 4. Run the Application

Since this is a client-side only application, you can:

**Option A: Open directly in browser**
- Double-click `index.html` to open in your default browser

**Option B: Serve with a local server (recommended)**
```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have npx)
npx serve

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

## Database Schema

The `weather_history` table stores:
- `city_name` - Name of the city
- `country_code` - ISO country code
- `temperature` - Current temperature in Celsius
- `feels_like` - "Feels like" temperature
- `humidity` - Humidity percentage
- `pressure` - Atmospheric pressure in hPa
- `wind_speed` - Wind speed in m/s
- `weather_main` - Main weather condition (Clear, Clouds, Rain, etc.)
- `weather_description` - Detailed weather description
- `weather_icon` - OpenWeatherMap icon code
- `timestamp` - When the search was made
- `user_id` - The Supabase auth user ID of the owner (NULL for legacy rows created before multi-user support)

## Authentication

- Users sign up and sign in with email and password via [Supabase Auth](https://supabase.com/docs/guides/auth)
- Sessions persist across page reloads via `localStorage` (Supabase's default session storage)
- Guests can use the app and search weather, but history is only saved and shown for signed-in users

## Row Level Security

RLS is enabled on `weather_history` with two policies (for the `authenticated` role only):
- **SELECT**: a user can read only their own rows (`auth.uid() = user_id`)
- **INSERT**: a user can only insert rows for their own user ID (`auth.uid() = user_id`)

Guests (the `anon` role) have no access to the table at all. There are no UPDATE or DELETE policies, so existing rows can't be modified or removed through the API. Column length checks limit what can be inserted.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES Modules)
- **Database**: Supabase (PostgreSQL)
- **Weather API**: OpenWeatherMap
- **No backend required** - runs entirely in the browser

## Browser Support

Modern browsers with ES Module support:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## License

MIT