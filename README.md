# Weather App with Supabase

A weather application with a **Node.js/Express backend** and **vanilla JS frontend** that fetches weather data from OpenWeatherMap and stores private, per-user search history in Supabase with Row Level Security.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Frontend      │────▶│    Backend      │────▶│   OpenWeatherMap │
│   (Vanilla JS)  │     │  (Express API)  │     │      API         │
│   Port 5173     │     │   Port 3001     │     │                  │
└─────────────────┘     └────────┬────────┘     └──────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    Supabase     │
                        │  (PostgreSQL +  │
                        │   Auth + RLS)   │
                        └─────────────────┘
```

### Backend Responsibilities
- **Weather API Proxy** (`/api/weather`) - Hides OpenWeatherMap API key
- **History CRUD** (`/api/history`) - Save/load user search history using Supabase service role
- **Auth Verification** - Validates Supabase JWT tokens for protected routes

### Frontend Responsibilities
- **UI/UX** - All user interface logic
- **Authentication** - Supabase Auth (signup, signin, signout) using anon key
- **API Client** - Calls backend endpoints with user's access token

## Features

- Search weather by city name
- Display current temperature, humidity, wind speed, pressure, and "feels like" temperature
- Sign up and sign in with email and password (Supabase Auth)
- Search history stored in Supabase database, private per user
- Guest access: search weather without an account (history only saved for signed-in users)
- Row Level Security (RLS) enabled on Supabase table
- Responsive design works on mobile and desktop

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and run the contents of `supabase_setup.sql`
4. Enable the email provider: Authentication → Providers → Email
5. Get your project URL and keys from Settings → API:
   - **Project URL** → `SUPABASE_URL`
   - **Anon/Public Key** → `SUPABASE_ANON_KEY` (for frontend)
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (for backend - keep secret!)

### 2. OpenWeatherMap API Key

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Get your free API key → `OPENWEATHER_API_KEY`

### 3. Configure the Application

#### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your keys
```

Required backend environment variables:
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENWEATHER_API_KEY=your-openweather-api-key
FRONTEND_URL=http://localhost:5173
```

#### Frontend
```bash
cd frontend
cp config.example.js config.js
# Edit config.js with your keys
```

Required frontend config:
```javascript
window.APP_CONFIG = {
    API_BASE_URL: 'http://localhost:3001/api',
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key'
};
```

### 4. Install Dependencies

```bash
# From root directory
npm run install:all
```

Or manually:
```bash
npm install           # Root (for concurrently, serve)
cd backend && npm install
cd ../frontend && npm install
```

### 5. Run the Application

#### Development (both frontend and backend)
```bash
npm run dev
```

This starts:
- Backend on http://localhost:3001
- Frontend on http://localhost:5173

#### Production-like (separate terminals)
```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

## Project Structure

```
weather-app/
├── backend/
│   ├── package.json
│   ├── server.js              # Express app entry point
│   ├── .env.example           # Backend env template
│   ├── routes/
│   │   ├── weather.js         # GET /api/weather?city=X
│   │   └── history.js         # GET/POST /api/history (auth required)
│   ├── services/
│   │   ├── openweather.js     # OpenWeatherMap API client
│   │   └── supabase.js        # Supabase service role client
│   └── middleware/
│       └── auth.js            # JWT verification middleware
├── frontend/
│   ├── index.html             # Main HTML
│   ├── styles.css             # All styles
│   ├── app.js                 # Main entry point
│   ├── config.example.js      # Frontend config template
│   ├── auth.js                # Supabase Auth management
│   ├── weather.js             # Weather search & display
│   ├── history.js             # History loading & display
│   └── ui.js                  # DOM manipulation utilities
├── supabase_setup.sql         # Database schema + RLS policies
├── package.json               # Root scripts
└── README.md
```

## API Endpoints

### Weather
```
GET /api/weather?city=London
```
Returns OpenWeatherMap response (proxied, API key hidden).

### History (requires Authorization: Bearer <token>)
```
GET /api/history?limit=50
POST /api/history
  Body: { "weatherData": { ...OpenWeatherMap response... } }
```

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
- `user_id` - The Supabase auth user ID of the owner

## Authentication

- Users sign up and sign in with email and password via Supabase Auth
- Frontend uses **anon key** for auth operations
- Backend uses **service role key** to bypass RLS for history operations
- JWT tokens are sent to backend via `Authorization: Bearer <token>` header
- Sessions persist across page reloads via localStorage (Supabase's default)

## Row Level Security

RLS is enabled on `weather_history` with policies for the `authenticated` role:
- **SELECT**: Users can read only their own rows (`auth.uid() = user_id`)
- **INSERT**: Users can only insert rows for their own user ID (`auth.uid() = user_id`)

The backend uses the service role key which bypasses RLS, but enforces user isolation by explicitly filtering by `user_id` in all queries.

## Deployment

### GitHub Pages (Frontend) + Render/Railway/Fly.io (Backend)

1. **Backend**: Deploy to any Node.js hosting (Render, Railway, Fly.io, etc.)
   - Set environment variables in hosting platform
   - Update `FRONTEND_URL` to your deployed frontend URL

2. **Frontend**: Deploy to GitHub Pages
   - Update `config.js` with production backend URL
   - Or use GitHub Actions to inject config at build time

### Environment Variables for Production

**Backend:**
```env
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENWEATHER_API_KEY=...
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (config.js):**
```javascript
window.APP_CONFIG = {
    API_BASE_URL: 'https://your-backend-domain.com/api',
    SUPABASE_URL: '...',
    SUPABASE_ANON_KEY: '...'
};
```

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES Modules)
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Weather API**: OpenWeatherMap
- **Dev Tools**: concurrently, serve

## Browser Support

Modern browsers with ES Module support:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## License

MIT