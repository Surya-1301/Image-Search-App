// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 10000;

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const USERS_FILE = path.join(__dirname, 'users.json');

// Create a Google OAuth2 client if a client ID is configured. The client can
// verify id_tokens using Google's public keys. If no client ID is present we
// will fall back to the tokeninfo endpoint (less ideal).
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || null;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID || undefined);

// simple file-backed users store helpers
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '{}');
    }
  } catch (e) { console.error('loadUsers error', e); }
  return {};
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) { console.error('saveUsers error', e); }
}

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// CORS configuration
// In development allow requests from localhost/127.0.0.1 (convenience).
// In production, prefer an explicit CORS_ORIGIN environment variable.
const isDev = (process.env.NODE_ENV || '').trim() !== 'production';
let corsOptions;
if (isDev) {
  corsOptions = {
    origin: true, // reflect request origin, allowing localhost during dev
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };
} else {
  corsOptions = {
    origin: process.env.CORS_ORIGIN || 'https://image-search-6h7egk594-surya-1301s-projects.vercel.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };
}

app.use(cors(corsOptions));

app.use(express.json());

// Simple signup endpoint
app.post('/auth/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = loadUsers();
  if (users[username]) return res.status(409).json({ error: 'user exists' });
  const { salt, hash } = hashPassword(password);
  users[username] = { salt, hash, createdAt: new Date().toISOString() };
  saveUsers(users);
  // return a simple token (not JWT) for demo
  const token = crypto.randomBytes(24).toString('hex');
  users[username].token = token;
  saveUsers(users);
  res.json({ username, token });
});

// Simple login endpoint
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = loadUsers();
  const user = users[username];
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const { hash } = hashPassword(password, user.salt);
  if (hash !== user.hash) return res.status(401).json({ error: 'invalid credentials' });
  const token = crypto.randomBytes(24).toString('hex');
  user.token = token;
  saveUsers(users);
  res.json({ username, token });
});

// Google sign-in endpoint: accepts an ID token from the client, verifies it with
// Google's tokeninfo endpoint and creates/returns a demo token for the user.
app.post('/auth/google', async (req, res) => {
  try {
    const { id_token } = req.body || {};
    if (!id_token) return res.status(400).json({ error: 'id_token is required' });

    let payload = null;

    // Prefer verifying the id_token using the google-auth-library (uses
    // Google's public keys and validates audience if provided).
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID || undefined });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // Detailed logging for verification failure
      console.warn('google-auth-library verifyIdToken failed, falling back to tokeninfo. verifyErr:', verifyErr && verifyErr.message);
      if (verifyErr && verifyErr.response) {
        console.warn('verifyErr.response.status:', verifyErr.response.status);
        console.warn('verifyErr.response.data:', verifyErr.response.data);
      } else if (verifyErr && verifyErr.stack) {
        console.warn(verifyErr.stack);
      }

      // If verification with the library fails (for example no client ID set)
      // fall back to the tokeninfo endpoint.
      try {
        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`;
        const gresp = await axios.get(verifyUrl);
        payload = gresp.data || null;
      } catch (tokeninfoErr) {
        console.error('tokeninfo fallback failed:', tokeninfoErr && tokeninfoErr.response ? tokeninfoErr.response.data : tokeninfoErr && tokeninfoErr.message ? tokeninfoErr.message : tokeninfoErr);
        // rethrow to be caught by outer handler
        throw tokeninfoErr;
      }
    }

    if (!payload || !payload.sub) return res.status(400).json({ error: 'Invalid Google token payload' });

    // Optional: ensure email is present and verified where possible
    const email = payload.email || null;
    if (email && payload.email_verified && payload.email_verified !== 'true' && payload.email_verified !== true) {
      return res.status(400).json({ error: 'Google account email not verified' });
    }

    const users = loadUsers();
    const usernameKey = email || payload.sub; // use email as key when available, otherwise the google sub
    const now = new Date().toISOString();
    const existing = users[usernameKey] || {};
    const token = crypto.randomBytes(24).toString('hex');

    users[usernameKey] = {
      username: payload.name || (email || payload.sub),
      email: email,
      googleId: payload.sub,
      picture: payload.picture || null,
      provider: 'google',
      createdAt: existing.createdAt || now,
      token
    };

    saveUsers(users);

    // return email as well so client can persist it
    return res.json({ username: users[usernameKey].username, email: users[usernameKey].email, token });
  } catch (err) {
    console.error('Google auth error:', err && err.message ? err.message : err);
    if (err && err.response) {
      console.error('error.response.status:', err.response.status);
      console.error('error.response.data:', err.response.data);
    }
    if (err && err.stack) console.error(err.stack);
    return res.status(500).json({ error: 'Failed to verify Google token' });
  }
});

// Owner-only dashboard endpoint. Access allowed if the request provides the
// ADMIN_TOKEN or the demo token of the owner user (matched by OWNER_EMAIL).
app.get('/dashboard', (req, res) => {
  const auth = req.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();

  const ownerEmail = process.env.OWNER_EMAIL || process.env.REACT_APP_OWNER_EMAIL || null;

  // If ADMIN_TOKEN exists and matches, allow.
  if (process.env.ADMIN_TOKEN && token && token === process.env.ADMIN_TOKEN) {
    const users = loadUsers();
    const out = Object.keys(users).map(username => ({
      username,
      email: users[username].email || null,
      googleId: users[username].googleId || null,
      provider: users[username].provider || null,
      picture: users[username].picture || null,
      createdAt: users[username].createdAt,
      token: users[username].token || null
    }));
    return res.json({ usersCount: Object.keys(users).length, users: out });
  }

  // Otherwise, if ownerEmail set, allow only if the token belongs to that owner
  if (ownerEmail && token) {
    const users = loadUsers();
    const found = Object.keys(users).map(k => users[k]).find(u => u && u.token === token && (u.email === ownerEmail || u.username === ownerEmail));
    if (found) {
      const out = Object.keys(users).map(username => ({
        username,
        email: users[username].email || null,
        googleId: users[username].googleId || null,
        provider: users[username].provider || null,
        picture: users[username].picture || null,
        createdAt: users[username].createdAt,
        token: users[username].token || null
      }));
      return res.json({ usersCount: Object.keys(users).length, users: out });
    }
  }

  return res.status(401).json({ error: 'unauthorized' });
});

// Get current user by demo token
app.get('/me', (req, res) => {
  const auth = req.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'missing token' });

  const users = loadUsers();
  const found = Object.keys(users).map(k => users[k]).find(u => u && u.token === token);
  if (!found) return res.status(401).json({ error: 'invalid token' });

  // return safe user info (omit password hash/salt)
  const safe = {
    username: found.username || null,
    email: found.email || null,
    googleId: found.googleId || null,
    provider: found.provider || null,
    picture: found.picture || null,
    createdAt: found.createdAt || null
  };
  res.json({ user: safe });
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Image search endpoint
app.get('/api/images', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
  const per = Number(req.query.per_page) || 30; // Get per_page from query params, default to 30
    // provider can be forced via ?provider=pixabay|unsplash|pinterest
    const providerParam = (req.query.provider || '').toLowerCase();
    // Resolve provider preference: query param overrides env flags
    let provider = 'unsplash';
    if (providerParam) provider = providerParam;
    else if (process.env.USE_PIXABAY === 'true') provider = 'pixabay';
    else if (process.env.USE_PINTEREST === 'true') provider = 'pinterest';

    console.log('Search query:', query, 'Page:', page, 'Provider:', provider);

    // Both branch: query both Unsplash and Pixabay and merge results
    if (provider === 'both' || provider === 'pixabay+unsplash' || provider === 'unsplash+pixabay') {
      if (!process.env.UNSPLASH_ACCESS_KEY) {
        return res.status(400).json({ error: 'UNSPLASH_ACCESS_KEY is required when provider=both' });
      }
      if (!process.env.PIXABAY_API_KEY) {
        return res.status(400).json({ error: 'PIXABAY_API_KEY is required when provider=both' });
      }

      const pixabayUrl = process.env.PIXABAY_API_URL || 'https://pixabay.com/api/';

      // Run both requests in parallel
      const unsplashPromise = axios.get(`https://api.unsplash.com/search/photos`, {
        headers: { 'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        params: { query, page, per_page: 10 }
      });

      const pixabayPromise = axios.get(pixabayUrl, {
        params: {
          key: process.env.PIXABAY_API_KEY,
          q: query,
          image_type: 'photo',
          per_page: 10,
          page
        }
      });

      const [unsplashResp, pixabayResp] = await Promise.all([unsplashPromise, pixabayPromise]);

      // Map Unsplash hits and tag provider
      const uResults = (unsplashResp.data && unsplashResp.data.results) || [];
      const unsplashHits = uResults.map(r => ({
        webformatURL: (r.urls && (r.urls.small || r.urls.regular || r.urls.full)) || '',
        tags: r.alt_description || r.description || '',
        likes: r.likes || 0,
        views: r.views || 0,
        user: (r.user && (r.user.username || r.user.name)) || '',
        provider: 'unsplash'
      }));

      // Map Pixabay hits into the same shape and tag provider
      const pResults = (pixabayResp.data && pixabayResp.data.hits) || [];
      const pixabayHits = pResults.map(p => ({
        webformatURL: p.webformatURL || p.previewURL || p.largeImageURL || '',
        tags: p.tags || '',
        likes: p.likes || 0,
        views: p.views || 0,
        user: p.user || '',
        provider: 'pixabay'
      }));

      // Interleave results from both sources to give mixed view
      const maxLen = Math.max(unsplashHits.length, pixabayHits.length);
      const interleaved = [];
      for (let i = 0; i < maxLen; i++) {
        if (unsplashHits[i]) interleaved.push(unsplashHits[i]);
        if (pixabayHits[i]) interleaved.push(pixabayHits[i]);
      }

      // Deduplicate by webformatURL (fall back to user+tags if missing)
      const seen = new Set();
      const mergedUnique = [];
      for (const item of interleaved) {
        const key = (item.webformatURL || (item.user + '|' + item.tags)).trim();
        if (!key) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        mergedUnique.push(item);
      }

      const totalUnique = mergedUnique.length;
      return res.json({ totalHits: totalUnique, hits: mergedUnique });
    }

    // Pixabay branch
    if (provider === 'pixabay') {
      if (!process.env.PIXABAY_API_KEY) {
        return res.status(400).json({ error: 'PIXABAY_API_KEY is required when provider=pixabay' });
      }

      const pixabayUrl = process.env.PIXABAY_API_URL || 'https://pixabay.com/api/';
      console.log('Using Pixabay API at', pixabayUrl);

      const pixabayResp = await axios.get(pixabayUrl, {
        params: {
          key: process.env.PIXABAY_API_KEY,
          q: query,
          image_type: 'photo',
          per_page: per, // Use dynamic per_page value
          page
        }
      });

      console.log('Pixabay API response summary:', { total: pixabayResp.data.totalHits, hits: pixabayResp.data.hits && pixabayResp.data.hits.length });
      return res.json(pixabayResp.data);
    }

    // Pinterest branch
    if (provider === 'pinterest') {
      if (!process.env.PINTEREST_ACCESS_TOKEN) {
        return res.status(400).json({ error: 'PINTEREST_ACCESS_TOKEN is required when provider=pinterest' });
      }

      const pinterestUrl = process.env.PINTEREST_API_URL || 'https://api.pinterest.com/v5/search/pins';
      console.log('Using Pinterest API at', pinterestUrl);

      const pinterestResp = await axios.get(pinterestUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        },
        params: {
          query,
          page: page,
          page_size: 10
        }
      });

      console.log('Pinterest API response keys:', Object.keys(pinterestResp.data || {}));

      const items = pinterestResp.data.items || pinterestResp.data.results || pinterestResp.data.data || [];
      const hits = items.map(item => ({
        webformatURL:
          (item.images && (item.images.original && item.images.original.url)) ||
          item.image_url ||
          (item.media && item.media[0] && (item.media[0].url || item.media[0].src)) ||
          '',
        tags: item.description || item.title || item.alt_text || '',
        likes: item.reactions_count || item.like_count || 0,
        views: item.view_count || 0,
        user: (item.owner && (item.owner.username || item.owner.name)) || (item.creator && (item.creator.username || item.creator.name)) || ''
      }));

      return res.json({
        totalHits: pinterestResp.data.total || (pinterestResp.data.count || items.length),
        hits
      });
    }

    // Default: Unsplash
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return res.status(400).json({ error: 'UNSPLASH_ACCESS_KEY is required for Unsplash provider' });
    }

    const unsplashResp = await axios.get(`https://api.unsplash.com/search/photos`, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      },
      params: {
        query,
        page,
        per_page: 10
      }
    });

    console.log('Unsplash API response:', unsplashResp.data);
    const results = unsplashResp.data.results || [];
    const unsplashHits = results.map(r => ({
      webformatURL: (r.urls && (r.urls.small || r.urls.regular || r.urls.full)) || '',
      tags: r.alt_description || r.description || '',
      likes: r.likes || 0,
      views: r.views || 0,
      user: (r.user && (r.user.username || r.user.name)) || ''
    }));

    return res.json({
      totalHits: unsplashResp.data.total || results.length,
      hits: unsplashHits
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: error.message });
  }
});

// If a frontend build exists at ../build, serve it as a static SPA.
// This allows deploying frontend and backend together on one server.
try {
  const buildPath = path.join(__dirname, '..', 'build');
  if (fs.existsSync(buildPath)) {
    console.log('Frontend build detected at', buildPath, '- enabling static file serving');
    app.use(express.static(buildPath));

    // Fallthrough for client-side routes: send index.html for non-API requests
    app.get('*', (req, res, next) => {
      // Let API/auth routes be handled above
      if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path === '/test' || req.path.startsWith('/dashboard') || req.path.startsWith('/me')) {
        return next();
      }
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  }
} catch (e) {
  console.warn('Error checking/serving build folder:', e && e.message);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('CORS origin:', corsOptions.origin);
});
