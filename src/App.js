// src/App.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Optional: Import the CSS file for styling

function App() {
  const [query, setQuery] = useState(''); // State to hold the search query
  const [images, setImages] = useState([]); // State to hold images fetched from the backend
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to handle the search when the button is clicked
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting search for query:', query);
      
      const backendUrl = 'https://image-search-app-9gya.onrender.com';
      const url = `${backendUrl}/api/images?query=${encodeURIComponent(query)}`;
      console.log('Making request to:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Received response:', response.data);
      setImages(response.data.hits || []);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });
      setError(error.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Image Search</h1>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search images"
        value={query}
        onChange={(e) => setQuery(e.target.value)} // Update query state on input change
      />

      {/* Search button */}
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button> {/* Trigger image search on button click */}

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {/* Image display grid */}
      <div className="grid-container">
        {loading ? (
          <p>Loading images...</p>
        ) : images.length > 0 ? (
          // If images are found, display them in a grid
          images.map((image, index) => (
            <div key={index} className="image-card">
              <img src={image.webformatURL} alt={image.tags} />
              <p>{image.tags}</p>
            </div>
          ))
        ) : (
          // If no images found, display a message
          <p>No images found. Please try a different search.</p>
        )}
      </div>
    </div>
  );
}

export default App;
