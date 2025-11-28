// Quote Database
const quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "motivation"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        category: "success"
    },
    {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
        category: "motivation"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "motivation"
    },
    {
        text: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius",
        category: "wisdom"
    },
    {
        text: "Everything you've ever wanted is on the other side of fear.",
        author: "George Addair",
        category: "motivation"
    },
    {
        text: "Success is not how high you have climbed, but how you make a positive difference to the world.",
        author: "Roy T. Bennett",
        category: "success"
    },
    {
        text: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins",
        category: "motivation"
    },
    {
        text: "Life is 10% what happens to you and 90% how you react to it.",
        author: "Charles R. Swindoll",
        category: "life"
    },
    {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb",
        category: "wisdom"
    },
    {
        text: "Your limitation—it's only your imagination.",
        author: "Unknown",
        category: "motivation"
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson",
        category: "success"
    },
    {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        category: "motivation"
    },
    {
        text: "In the middle of every difficulty lies opportunity.",
        author: "Albert Einstein",
        category: "wisdom"
    },
    {
        text: "Life is what happens when you're busy making other plans.",
        author: "John Lennon",
        category: "life"
    },
    {
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author: "Nelson Mandela",
        category: "motivation"
    },
    {
        text: "Success usually comes to those who are too busy to be looking for it.",
        author: "Henry David Thoreau",
        category: "success"
    },
    {
        text: "Don't let yesterday take up too much of today.",
        author: "Will Rogers",
        category: "life"
    },
    {
        text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
        author: "Unknown",
        category: "wisdom"
    },
    {
        text: "It's not whether you get knocked down, it's whether you get up.",
        author: "Vince Lombardi",
        category: "motivation"
    }
];

// State Management
let currentQuote = null;
let currentCategory = 'all';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {
    quotesViewed: 0,
    favoriteCount: 0,
    shareCount: 0
};
let autoPlayInterval = null;
let currentTheme = localStorage.getItem('theme') || 'purple';
let fontSize = localStorage.getItem('fontSize') || 22;

// DOM Elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCategory = document.getElementById('quoteCategory');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const categoryButtons = document.querySelectorAll('.category-btn');
const quotesViewedEl = document.getElementById('quotesViewed');
const favoriteCountEl = document.getElementById('favoriteCount');
const shareCountEl = document.getElementById('shareCount');
const favoritesList = document.getElementById('favoritesList');
const favoriteBadge = document.getElementById('favoriteBadge');
const clearFavoritesBtn = document.getElementById('clearFavorites');
const toast = document.getElementById('toast');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const themeButtons = document.querySelectorAll('.theme-btn');
const fontSlider = document.getElementById('fontSlider');
const fontValue = document.getElementById('fontValue');
const autoPlayToggle = document.getElementById('autoPlay');

// Initialize App
function init() {
    loadStats();
    loadFavorites();
    applyTheme(currentTheme);
    applyFontSize(fontSize);
    displayRandomQuote();
    setupEventListeners();
    
    // Apply saved autoplay setting
    const autoPlaySetting = localStorage.getItem('autoPlay') === 'true';
    autoPlayToggle.checked = autoPlaySetting;
    if (autoPlaySetting) {
        startAutoPlay();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    newQuoteBtn.addEventListener('click', displayRandomQuote);
    copyBtn.addEventListener('click', copyQuote);
    shareBtn.addEventListener('click', shareQuote);
    favoriteBtn.addEventListener('click', toggleFavorite);
    clearFavoritesBtn.addEventListener('click', clearAllFavorites);
    settingsBtn.addEventListener('click', () => settingsPanel.classList.add('active'));
    closeSettings.addEventListener('click', () => settingsPanel.classList.remove('active'));
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayRandomQuote();
        });
    });
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyTheme(theme);
        });
    });
    
    fontSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        applyFontSize(size);
    });
    
    autoPlayToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        localStorage.setItem('autoPlay', isEnabled);
        if (isEnabled) {
            startAutoPlay();
        } else {
            stopAutoPlay();
        }
    });
}

// Display Random Quote
function displayRandomQuote() {
    const filteredQuotes = currentCategory === 'all' 
        ? quotes 
        : quotes.filter(q => q.category === currentCategory);
    
    if (filteredQuotes.length === 0) {
        showToast('No quotes available in this category');
        return;
    }
    
    let newQuote;
    do {
        newQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    } while (newQuote === currentQuote && filteredQuotes.length > 1);
    
    currentQuote = newQuote;
    
    // Animate quote change
    quoteText.style.animation = 'none';
    setTimeout(() => {
        quoteText.textContent = currentQuote.text;
        quoteAuthor.textContent = `— ${currentQuote.author}`;
        quoteCategory.textContent = currentQuote.category;
        quoteText.style.animation = 'fadeIn 0.6s ease-in';
        
        // Update favorite button state
        updateFavoriteButton();
        
        // Update stats
        stats.quotesViewed++;
        saveStats();
        loadStats();
    }, 50);
}

// Copy Quote to Clipboard
function copyQuote() {
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Quote copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy quote');
    });
}

// Share Quote
function shareQuote() {
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Inspirational Quote',
            text: text,
        }).then(() => {
            stats.shareCount++;
            saveStats();
            loadStats();
            showToast('Quote shared successfully!');
        }).catch(() => {
            // User cancelled share
        });
    } else {
        // Fallback to copy
        navigator.clipboard.writeText(text).then(() => {
            stats.shareCount++;
            saveStats();
            loadStats();
            showToast('Quote copied! (Share not supported on this device)');
        });
    }
}

// Toggle Favorite
function toggleFavorite() {
    if (!currentQuote) return;
    
    const existingIndex = favorites.findIndex(
        fav => fav.text === currentQuote.text && fav.author === currentQuote.author
    );
    
    if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1);
        showToast('Removed from favorites');
    } else {
        favorites.push(currentQuote);
        showToast('Added to favorites!');
    }
    
    stats.favoriteCount = favorites.length;
    saveFavorites();
    saveStats();
    loadFavorites();
    loadStats();
    updateFavoriteButton();
}

// Update Favorite Button State
function updateFavoriteButton() {
    if (!currentQuote) return;
    
    const isFavorite = favorites.some(
        fav => fav.text === currentQuote.text && fav.author === currentQuote.author
    );
    
    if (isFavorite) {
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.classList.remove('active');
    }
}

// Load Favorites
function loadFavorites() {
    favoriteBadge.textContent = favorites.length;
    favoriteCountEl.textContent = favorites.length;
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No favorites yet. Click the ❤️ to save quotes!</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map((fav, index) => `
        <div class="favorite-item">
            <p>"${fav.text}"</p>
            <small>— ${fav.author}</small>
            <button class="remove-favorite" onclick="removeFavorite(${index})">×</button>
        </div>
    `).join('');
}

// Remove Favorite
function removeFavorite(index) {
    favorites.splice(index, 1);
    stats.favoriteCount = favorites.length;
    saveFavorites();
    saveStats();
    loadFavorites();
    loadStats();
    updateFavoriteButton();
    showToast('Removed from favorites');
}

// Clear All Favorites
function clearAllFavorites() {
    if (favorites.length === 0) {
        showToast('No favorites to clear');
        return;
    }
    
    if (confirm('Are you sure you want to clear all favorites?')) {
        favorites = [];
        stats.favoriteCount = 0;
        saveFavorites();
        saveStats();
        loadFavorites();
        loadStats();
        updateFavoriteButton();
        showToast('All favorites cleared');
    }
}

// Save/Load Functions
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function saveStats() {
    localStorage.setItem('stats', JSON.stringify(stats));
}

function loadStats() {
    quotesViewedEl.textContent = stats.quotesViewed;
    favoriteCountEl.textContent = stats.favoriteCount;
    shareCountEl.textContent = stats.shareCount;
}

// Theme Functions
function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

// Font Size Functions
function applyFontSize(size) {
    quoteText.style.fontSize = `${size}px`;
    fontSlider.value = size;
    fontValue.textContent = `${size}px`;
    fontSize = size;
    localStorage.setItem('fontSize', size);
}

// Auto-play Functions
function startAutoPlay() {
    stopAutoPlay(); // Clear any existing interval
    autoPlayInterval = setInterval(() => {
        displayRandomQuote();
    }, 5000);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

// Toast Notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        displayRandomQuote();
    } else if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        copyQuote();
    } else if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        toggleFavorite();
    }
});

// Close settings panel when clicking outside
document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
        settingsPanel.classList.remove('active');
    }
});

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}