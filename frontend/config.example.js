// Copy this to config.js and fill in your keys (config.js is gitignored)
window.APP_CONFIG = {
    // Backend API URL
    // In Codespaces the backend is on the forwarded port 3001 (must be set to Public)
    API_BASE_URL: location.hostname.endsWith('.app.github.dev')
        ? `https://${location.hostname.replace(/-5173\./, '-3001.')}/api`
        : 'http://localhost:3001/api',
    
    // Supabase (for auth only - frontend uses anon key)
    SUPABASE_URL: 'https://xcnagadvxqbnbcaevwax.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_SHD6SsNxEPAjpgi0rdRFjw_vMkGdn_i'
};