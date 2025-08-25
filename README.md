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

Google Images (Programmable Search) support
- To enable Google Images provider set the following environment variables on Netlify (or in your local `.env` for dev):
  - `GOOGLE_API_KEY` - API key for Google Custom Search JSON API
  - `GOOGLE_CSE_ID` - Custom Search Engine ID (cx) configured for Image search

Use provider `google` or `googleimages` when calling `/api/images`.
 
Unsplash provider enhancements
- The Unsplash provider now accepts extra query params passed to `/api/images`:
  - `per_page` (number) — results per page (1..30, defaults to 10)
  - `orientation` (string) — one of `landscape`, `portrait`, `squarish`
  - `color` (string) — color filter supported by Unsplash (e.g., `black_and_white`, `black`, `white`, `yellow`, `orange`, `red`, `purple`, `magenta`, `green`, `teal`, `blue`)

Example request:

```
/api/images?provider=unsplash&query=mountains&per_page=15&orientation=landscape&color=blue
```

Enhanced Unsplash response shape (each hit contains):
- `id` — Unsplash image ID
- `webformatURL`, `smallURL`, `fullURL`, `rawURL` — various image sizes/URLs
- `tags` — alt text or description
- `likes`, `views` — numeric stats (when available)
- `user` — photographer username or name
- `userProfile` — photographer profile URL (for attribution)
- `provider` — `unsplash`

Pixabay provider enhancements
- The Pixabay provider now accepts additional query params:
  - `per_page` (number) — results per page (1..200, defaults to 20)
  - `image_type` (string) — e.g., `photo`, `illustration`, `vector`
  - `safesearch` (true|false) — filter explicit content (defaults to `true`)
  - `order` (string) — `popular` or `latest` (defaults to `popular`)
  - `category` (string) — Pixabay category slug (e.g., `nature`, `fashion`)

Example request:

```
/api/images?provider=pixabay&query=mountains&per_page=24&image_type=photo&order=latest
```

Enhanced Pixabay response shape (each hit contains):
- `id` — Pixabay image id
- `webformatURL`, `largeImageURL`, `pageURL` — image links
- `tags` (string) and `tagsArray` (array)
- `likes`, `views` — numeric stats
- `user`, `userImageURL` — photographer/creator info
- `provider` — `pixabay`
5. Open a Pull Request
