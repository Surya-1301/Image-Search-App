// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

// Enable CORS for all origins during development
app.use(cors());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Pixabay API configuration
const PIXABAY_API_KEY = '29904377-5d788804b733434f876aed7ea';
const PIXABAY_API_URL = 'https://pixabay.com/api/';

// Route to handle image search
app.get('/api/images', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const response = await axios.get(PIXABAY_API_URL, {
      params: {
        key: PIXABAY_API_KEY,
        q: query,
        image_type: 'photo',
        per_page: 20 // Limit results per page
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error.message 
    });
  }
});

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Define port for server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
