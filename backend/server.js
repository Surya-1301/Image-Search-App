// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Enable CORS for specific origins
app.use(cors({
  origin: 'https://voluble-melomakarona-866e9c.netlify.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://voluble-melomakarona-866e9c.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Basic middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Pixabay API configuration
const PIXABAY_API_KEY = '29904377-5d788804b733434f876aed7ea';
const PIXABAY_API_URL = 'https://pixabay.com/api/';

// Route to handle image search
app.get('/api/images', async (req, res) => {
  try {
    console.log('Received request for images with query:', req.query);
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const response = await axios.get(PIXABAY_API_URL, {
      params: {
        key: PIXABAY_API_KEY,
        q: query,
        image_type: 'photo',
        per_page: 20
      }
    });

    console.log('Pixabay API response status:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error.message 
    });
  }
});

// Basic route for testing
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Define port for server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
