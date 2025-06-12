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
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://backend-id9id1e31-surya-1301s-projects.vercel.app';
      const url = `${backendUrl}/api/images?query=${encodeURIComponent(query)}`;
      
      const response = await axios.get(url);
      setImages(response.data.hits || []);
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <h1>Image Search</h1>
          </div>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <div className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for images..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
              {query && (
                <button 
                  type="button" 
                  className="clear-button"
                  onClick={() => setQuery('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
              <button 
                type="submit" 
                className="search-button"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching for images...</p>
          </div>
        ) : images.length > 0 ? (
          <div className="image-grid">
            {images.map((image, index) => (
              <div key={index} className="image-card">
                <div className="image-container">
                  <img 
                    src={image.webformatURL} 
                    alt={image.tags} 
                    loading="lazy"
                  />
                  <div className="image-overlay">
                    <div className="image-stats">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        {image.likes}
                      </span>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        {image.views}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="image-info">
                  <p className="image-tags">{image.tags}</p>
                  <p className="image-user">by {image.user}</p>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p>No images found. Try a different search term.</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Pixabay API</p>
      </footer>
    </div>
  );
}

export default App;
