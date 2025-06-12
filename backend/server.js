// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 10000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://image-search-6h7egk594-surya-1301s-projects.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

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
    console.log('Search query:', query, 'Page:', page);
    
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      },
      params: {
        query,
        page,
        per_page: 10
      }
    });
    
    console.log('Unsplash API response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('CORS origin:', corsOptions.origin);
});
