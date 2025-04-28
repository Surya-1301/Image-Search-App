const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const imagesGrid = document.getElementById('images-grid');
const loading = document.getElementById('loading');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent form from refreshing page

  const query = input.value.trim();
  if (!query) return; // If input is empty, do nothing

  imagesGrid.innerHTML = ''; // Clear previous results
  loading.style.display = 'block'; // Show loading spinner

  const apiKey = '29904377-5d788804b733434f876aed7ea'; // Your real Pixabay API key
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    loading.style.display = 'none'; // Hide loading spinner after data arrives

    if (data.hits.length === 0) {
      imagesGrid.innerHTML = "<p>No images found. Try another search.</p>";
      return;
    }

    // Only ONE loop to create nice image cards
    data.hits.forEach((hit) => {
      const card = document.createElement('div');
      card.className = 'image-card';

      const img = document.createElement('img');
      img.src = hit.webformatURL;
      img.alt = hit.tags;

      const title = document.createElement('p');
      title.textContent = hit.tags;

      card.appendChild(img);
      card.appendChild(title);
      imagesGrid.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error fetching images:', error);
    loading.style.display = 'none'; // Hide loading spinner on error too
    imagesGrid.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
});
