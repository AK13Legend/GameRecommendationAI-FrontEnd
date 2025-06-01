document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('autoGrowTextarea');
    const submitButton = document.getElementById('submitButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const gameCardsGrid = document.getElementById('gameCardsGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const gameCardTemplate = document.getElementById('gameCardTemplate');

    // API endpoint - replace with your actual endpoint
    const API_URL = 'https://localhost:7198/api/GameRecommendation/recommend';

    // Handle form submission
    async function handleSubmit() {
        const query = textarea.value.trim();
        
        if (!query) {
            showError('Please enter what kind of games you are looking for');
            return;
        }

        try {
            // Show loading state
            showLoading();
            
            // Fetch recommendations from your API
            const games = await fetchGameRecommendations(query);
            
            // Display the results
            displayGameCards(games);
        } catch (error) {
            console.error('Error fetching game recommendations:', error);
            showError('Failed to get recommendations. Please try again.');
        }
    }

    // Fetch game recommendations from your API
    async function fetchGameRecommendations(query) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
    }

    // Display game cards in the grid
    function displayGameCards(games) {
        // Clear previous results
        gameCardsGrid.innerHTML = '';
        
        if (!games || games.length === 0) {
            showError('No games found matching your criteria. Try a different description.');
            return;
        }

        // Create and append a card for each game
        games.forEach(game => {
            const card = createGameCard(game);
            gameCardsGrid.appendChild(card);
        });

        // Show results container
        resultsContainer.classList.remove('hidden');
        loadingIndicator.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }

    // Create a game card from template
    function createGameCard(game) {
        // Clone the template content
        const card = gameCardTemplate.content.cloneNode(true);
        
        // Fill in the data
        const img = card.querySelector('img');
        img.src = game.imageUrl;
        img.alt = `${game.name} cover art`;
        
        const title = card.querySelector('h3');
        title.textContent = game.name;
        
        const year = card.querySelector('.game-year');
        year.textContent = game.year;
        
        const genre = card.querySelector('.game-genre');
        genre.textContent = game.genre;
        
        const description = card.querySelector('p');
        description.textContent = game.description;
        
        return card;
    }

    // Show loading state
    function showLoading() {
        gameCardsGrid.innerHTML = '';
        resultsContainer.classList.remove('hidden');
        loadingIndicator.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        loadingIndicator.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
    }

    // Event listeners
    submitButton.addEventListener('click', handleSubmit);
    
    // Also handle Enter key (but not Shift+Enter)
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    });
});