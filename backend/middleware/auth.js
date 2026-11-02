import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
}

// Create a client with anon key for JWT verification
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { transport: ws }
});

/**
 * Middleware to verify Supabase JWT token
 * Expects Authorization: Bearer <token> header
 */
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer '
  
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional auth middleware - adds user if token is valid, continues anyway
 */
export async function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (!error && user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore errors, continue without user
  }
  
  next();
}