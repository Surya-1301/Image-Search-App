// src/App.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Optional: Import the CSS file for styling

function App() {
  const [query, setQuery] = useState(''); // State to hold the search query
  const [images, setImages] = useState([]); // State to hold images fetched from the backend

  // Function to handle the search when the button is clicked
  const handleSearch = async () => {
    try {
      // Send GET request to backend with the search query
      const response = await axios.get(`http://localhost:5000/images?query=${query}`);
      // Set the images from the response
      setImages(response.data.images);
    } catch (error) {
      console.error('Error fetching images:', error); // Log any error if fetching fails
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
      <button onClick={handleSearch}>Search</button> {/* Trigger image search on button click */}

      {/* Image display grid */}
      <div className="grid-container">
        {images.length > 0 ? (
          // If images are found, display them in a grid
          images.map((image, index) => (
            <div key={index} className="image-card">
              <img src={image} alt={`result-${index}`} />
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
