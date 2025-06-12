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

```
image-search-app/
├── server.js          # Express server and API endpoints
├── index.html         # Main HTML file
├── style.css          # Styles
├── script.js          # Frontend JavaScript
├── package.json       # Project dependencies
└── README.md          # Project documentation
```

## API Endpoints

- `GET /api/images?query=<search_term>` - Search for images
  - Query parameters:
    - `query`: Search term (required)
    - `page`: Page number for pagination (optional)

## Technologies Used

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
- Backend:
  - Node.js
  - Express.js
- API:
  - Pixabay API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
