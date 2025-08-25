# Image Search App

A web application that allows users to search for images using the Pixabay API. Built with HTML, CSS, JavaScript, and Node.js.

## Features

- Search for images using keywords
- Responsive design
- Infinite scroll pagination
- Image statistics (likes and views)
- Lazy loading for better performance

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/image-search-app.git
cd image-search-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server.js
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure
image-search-app/
├── server.js          # Express server and API endpoints
├── index.html         # Main HTML file
├── style.css          # Styles
├── script.js          # Frontend JavaScript
├── package.json       # Project dependencies
└── README.md          # Project documentation
```

## API Endpoints

## Prerequisites
Node.js (v16+ recommended)
npm (Node Package Manager)
  - HTML5
## Local development
1. Clone the repository:
```bash
git clone https://github.com/yourusername/image-search-app.git
cd image-search-app
```
2. Install dependencies and run Netlify Dev (serves the frontend and Netlify Functions locally):
```bash
npm install
npm run netlify:dev
```
The app will be available at http://localhost:8888 when using Netlify Dev.
  - CSS3
  - JavaScript (ES6+)
## Project Structure
This project is a React app (Create React App) with Netlify Functions providing the backend API.
```
image-search-app/
├── netlify/functions/  # Serverless API endpoints (auth, images, dashboard)
├── src/                # React source
├── public/             # Static public assets
├── build/              # Production build output (generated)
├── package.json        # Project dependencies and scripts
└── README.md           # Project documentation
```
Backend is implemented as Netlify Functions (serverless). For production you'll want a persistent datastore (Supabase, S3, FaunaDB, etc.) because Netlify Function filesystem is ephemeral.
5. Open a Pull Request
