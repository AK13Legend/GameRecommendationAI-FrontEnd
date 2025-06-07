document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const carouselContainer = document.getElementById('carousel-container');
  const rightArrow = document.getElementById('right-arrow');
  const leftArrow = document.getElementById('left-arrow') || null;
  const submitBtn = document.getElementById('submit-btn');
  const textarea = document.getElementById('autoGrowTextarea');
  const template = document.getElementById('card-template');
  const loader = document.getElementById('loader');

  // State
  let cards = [];
  let isScrolling = false;
  let currentRequest = null;

  // Initialize
  rightArrow.classList.add('hidden');
  if(leftArrow) leftArrow.classList.add('hidden');

  // Fetch games from your API
  async function fetchGames(query) {
    // Show loader immediately for new request
    showLoader();
    
    // Cancel previous request if it exists
    if(currentRequest) {
      currentRequest.abort();
    }

    try {
      const controller = new AbortController();
      currentRequest = controller;
      
      const response = await fetch('https://bestgameai.runasp.net/api/GameRecommendation/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query
        }),
        signal: controller.signal
      });

      if(!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if(error.name !== 'AbortError') {
        console.error('Error fetching games:', error);
        alert('Failed to fetch recommendations. Please try again.');
        return [];
      }
      return []; // Return empty array if request was aborted
    } finally {
      currentRequest = null;
      hideLoader();
    }
  }

  // Loader functions
  function showLoader() {
    loader.classList.remove('hidden');
    carouselContainer.classList.add('opacity-50', 'pointer-events-none');
  }

  function hideLoader() {
    loader.classList.add('hidden');
    carouselContainer.classList.remove('opacity-50', 'pointer-events-none');
  }

  // Create cards from API data
  function createCards(games) {
    if (!games || games.length === 0) {
      carouselContainer.innerHTML = '<div class="text-cyan-50 p-4">No games found. Try a different search.</div>';
      rightArrow.classList.add('hidden');
      if(leftArrow) leftArrow.classList.add('hidden');
      return;
    }

    carouselContainer.innerHTML = '';
    cards = games;
    
    // Clone first and last cards for infinite effect
    const firstCard = createCard(games[0]);
    const lastCard = createCard(games[games.length - 1]);
    
    // Append clones
    carouselContainer.appendChild(lastCard.cloneNode(true));
    games.forEach(game => carouselContainer.appendChild(createCard(game)));
    carouselContainer.appendChild(firstCard.cloneNode(true));
    
    // Set initial scroll position
    setTimeout(() => {
      carouselContainer.scrollLeft = carouselContainer.offsetWidth;
    }, 50);
    
    // Show arrows if we have multiple cards
    const shouldShowArrows = games.length > 1;
    rightArrow.classList.toggle('hidden', !shouldShowArrows);
    if(leftArrow) leftArrow.classList.toggle('hidden', !shouldShowArrows);
  }

  function createCard(game) {
    const card = template.content.cloneNode(true);
    const img = card.querySelector('img');
    img.src = game.imageUrl || 'https://via.placeholder.com/400x225?text=No+Image';
    img.onerror = () => { img.src = 'https://via.placeholder.com/400x225?text=Image+Error' };
    
    card.querySelector('.game-name').textContent = game.name || 'Unknown';
    card.querySelector('.game-year').textContent = game.year || 'N/A';
    card.querySelector('.game-genre').textContent = game.genre || 'Unknown';
    card.querySelector('.game-desc').textContent = game.description || 'No description available';
    return card;
  }

  // Infinite scroll logic
  function setupInfiniteScroll() {
    let isManualScroll = false;
    
    carouselContainer.addEventListener('scroll', () => {
      if (isScrolling) return;
      
      const { scrollLeft, scrollWidth, offsetWidth } = carouselContainer;
      const threshold = 50; // pixels from edge
      
      // Snap to clone if at beginning/end
      if (scrollLeft <= threshold) {
        isScrolling = true;
        carouselContainer.scrollLeft = scrollWidth - (2 * offsetWidth) + threshold;
      } else if (scrollLeft >= scrollWidth - offsetWidth - threshold) {
        isScrolling = true;
        carouselContainer.scrollLeft = offsetWidth - threshold;
      }
      
      setTimeout(() => { isScrolling = false }, 100);
    });
  }

  // Arrow click handlers
  rightArrow.addEventListener('click', () => {
    carouselContainer.scrollBy({
      left: carouselContainer.offsetWidth,
      behavior: 'smooth'
    });
  });

  if(leftArrow) {
    leftArrow.addEventListener('click', () => {
      carouselContainer.scrollBy({
        left: -carouselContainer.offsetWidth,
        behavior: 'smooth'
      });
    });
  }

  // Submit handler
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const query = textarea.value.trim();
    if (!query) {
      alert('Please enter a search query');
      return;
    }
    
    // Clear previous results immediately
    carouselContainer.innerHTML = '';
    rightArrow.classList.add('hidden');
    if(leftArrow) leftArrow.classList.add('hidden');
    
    // Show loader before making the request
    showLoader();
    
    const games = await fetchGames(query);
    createCards(games);
    setupInfiniteScroll();
  });

  // Handle Enter key in textarea
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitBtn.click();
    }
  });

  // Initialize
  setupInfiniteScroll();
});