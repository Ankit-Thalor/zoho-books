import { database, auth } from './firebase-config.js';
import { 
    ref, 
    set, 
    push,
    onValue,
    get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Sample book data - 12 books across 6 genres
const sampleBooks = [
    {
        id: 1,
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        genre: "fiction",
        rating: 5,
        description: "A captivating story about a reclusive Hollywood icon who finally decides to tell her story to an unknown journalist.",
        cover: "📚"
    },
    {
        id: 2,
        title: "Atomic Habits",
        author: "James Clear",
        genre: "self-help",
        rating: 5,
        description: "An easy and proven way to build good habits and break bad ones through small changes that make a big difference.",
        cover: "💪"
    },
    {
        id: 3,
        title: "The Thursday Murder Club",
        author: "Richard Osman",
        genre: "mystery",
        rating: 4,
        description: "In a peaceful retirement village, four unlikely friends meet weekly to investigate cold cases.",
        cover: "🔍"
    },
    {
        id: 4,
        title: "Dune",
        author: "Frank Herbert",
        genre: "sci-fi",
        rating: 5,
        description: "Set in the distant future amidst a feudal interstellar society, this epic science fiction novel follows young Paul Atreides.",
        cover: "🚀"
    },
    {
        id: 5,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        genre: "romance",
        rating: 5,
        description: "The classic tale of Elizabeth Bennet and Mr. Darcy, exploring themes of love, reputation, and class.",
        cover: "💕"
    },
    {
        id: 6,
        title: "Steve Jobs",
        author: "Walter Isaacson",
        genre: "biography",
        rating: 4,
        description: "The exclusive biography of Steve Jobs, based on more than forty interviews with Jobs over two years.",
        cover: "👤"
    },
    {
        id: 7,
        title: "The Alchemist",
        author: "Paulo Coelho",
        genre: "fiction",
        rating: 5,
        description: "A symbolic tale of destiny and self-discovery, following a shepherd's journey to find his purpose.",
        cover: "🌄"
    },
    {
        id: 8,
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        genre: "self-help",
        rating: 5,
        description: "A groundbreaking exploration of the mind's dual systems that drive our thoughts, choices, and decisions.",
        cover: "🧠"
    },
    {
        id: 9,
        title: "Gone Girl",
        author: "Gillian Flynn",
        genre: "mystery",
        rating: 4,
        description: "A psychological thriller that delves into the dark side of marriage and media frenzy after a woman's disappearance.",
        cover: "🔦"
    },
    {
        id: 10,
        title: "Foundation",
        author: "Isaac Asimov",
        genre: "sci-fi",
        rating: 5,
        description: "A classic sci-fi saga about the decline and rebuilding of a galactic empire through science and strategy.",
        cover: "🚢"
    },
    {
        id: 11,
        title: "Me Before You",
        author: "Jojo Moyes",
        genre: "romance",
        rating: 4,
        description: "A moving love story intersecting themes of disability, hope, and personal transformation.",
        cover: "🥀"
    },
    {
        id: 12,
        title: "Long Walk to Freedom",
        author: "Nelson Mandela",
        genre: "biography",
        rating: 5,
        description: "The autobiography of Nelson Mandela, chronicling his struggle for freedom and racial equality.",
        cover: "🌍"
    }
];

// Sample reviews data
const sampleReviews = [
    {
        id: 1,
        bookTitle: "The Seven Husbands of Evelyn Hugo",
        rating: 5,
        text: "Absolutely captivating! I couldn't put it down. The character development is phenomenal and the plot twists kept me guessing until the very end.",
        author: "BookLover123"
    },
    {
        id: 2,
        bookTitle: "Atomic Habits",
        rating: 5,
        text: "Life-changing book! The concepts are easy to understand and implement. I've already started seeing positive changes in my daily routine.",
        author: "ProductivityFan"
    },
    {
        id: 3,
        bookTitle: "The Thursday Murder Club",
        rating: 4,
        text: "Charming and witty! The elderly protagonists are delightful and the mystery is well-crafted. Perfect for cozy mystery lovers.",
        author: "MysteryReader"
    }
];

// Current user info
let currentUser = null;
let currentUserData = null;

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            currentUserData = snapshot.val();
            updateUIForLoggedInUser();
        }
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
});

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const navMenu = document.querySelector('.nav-menu');
    
    if (!document.getElementById('userInfo')) {
        const userInfoLi = document.createElement('li');
        userInfoLi.id = 'userInfo';
        userInfoLi.innerHTML = `
            <span style="color: #667eea; font-weight: 600;">
                <i class="fas fa-user"></i> ${currentUserData.fullName}
                ${currentUserData.userType === 'admin' ? '<i class="fas fa-shield-alt" style="color: #f39c12;"></i>' : ''}
            </span>
        `;
        navMenu.appendChild(userInfoLi);
        
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" onclick="handleLogout()" style="color: #e74c3c;"><i class="fas fa-sign-out-alt"></i> Logout</a>`;
        navMenu.appendChild(logoutLi);
    }
}

// Handle logout
window.handleLogout = async function() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await signOut(auth);
            sessionStorage.clear();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
        }
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFirebaseData();
    setupEventListeners();
});

// Initialize Firebase data
async function initializeFirebaseData() {
    try {
        const booksRef = ref(database, 'books');
        const booksSnapshot = await get(booksRef);
        
        if (!booksSnapshot.exists()) {
            for (const book of sampleBooks) {
                await set(ref(database, 'books/' + book.id), book);
            }
            console.log('Sample books initialized in Firebase');
        }
        
        const reviewsRef = ref(database, 'reviews');
        const reviewsSnapshot = await get(reviewsRef);
        
        if (!reviewsSnapshot.exists()) {
            for (const review of sampleReviews) {
                const newReviewRef = push(ref(database, 'reviews'));
                await set(newReviewRef, {
                    ...review,
                    userId: 'system',
                    timestamp: new Date().toISOString()
                });
            }
            console.log('Sample reviews initialized in Firebase');
        }
        
        loadBooksFromFirebase();
        loadReviewsFromFirebase();
        
    } catch (error) {
        console.error('Error initializing Firebase data:', error);
        displayFeaturedBooks();
        displayReviews();
    }
}

// Load books from Firebase
function loadBooksFromFirebase() {
    const booksRef = ref(database, 'books');
    onValue(booksRef, (snapshot) => {
        const booksData = snapshot.val();
        if (booksData) {
            const booksArray = Object.values(booksData);
            displayFeaturedBooks(booksArray);
        }
    });
}

// Load reviews from Firebase
function loadReviewsFromFirebase() {
    const reviewsRef = ref(database, 'reviews');
    onValue(reviewsRef, (snapshot) => {
        const reviewsData = snapshot.val();
        if (reviewsData) {
            const reviewsArray = Object.values(reviewsData);
            displayReviews(reviewsArray);
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmission);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Toggle mobile menu
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Display featured books
function displayFeaturedBooks(books = sampleBooks) {
    const featuredBooksContainer = document.getElementById('featuredBooks');
    if (!featuredBooksContainer) return;

    featuredBooksContainer.innerHTML = '';

    books.forEach(book => {
        const bookCard = createBookCard(book);
        featuredBooksContainer.appendChild(bookCard);
    });
}

// Create a book card element
function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    
    const stars = generateStarRating(book.rating);
    
    bookCard.innerHTML = `
        <div class="book-cover">${book.cover}</div>
        <div class="book-info">
            <h3>${book.title}</h3>
            <p class="author">by ${book.author}</p>
            <span class="genre">${book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}</span>
            <div class="rating">${stars}</div>
            <p>${book.description}</p>
        </div>
    `;
    
    return bookCard;
}

// Generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star">★</span>';
        } else {
            stars += '<span class="star" style="color: #ddd;">★</span>';
        }
    }
    return stars;
}

// Display reviews
function displayReviews(reviews = sampleReviews) {
    const reviewsContainer = document.getElementById('reviewsGrid');
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = '';

    const displayReviews = Array.isArray(reviews) ? reviews.slice(-6).reverse() : [];
    
    displayReviews.forEach(review => {
        const reviewCard = createReviewCard(review);
        reviewsContainer.appendChild(reviewCard);
    });
}

// Create a review card element
function createReviewCard(review) {
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    const stars = generateStarRating(review.rating);
    
    reviewCard.innerHTML = `
        <div class="review-header">
            <div class="review-book">${review.bookTitle}</div>
            <div class="review-rating">${stars}</div>
        </div>
        <div class="review-text">"${review.text}"</div>
        <div class="review-author">- ${review.author}</div>
    `;
    
    return reviewCard;
}

// Handle review form submission
async function handleReviewSubmission(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login to submit a review');
        return;
    }
    
    const bookTitle = document.getElementById('bookTitle').value;
    const author = document.getElementById('author').value;
    const genre = document.getElementById('genre').value;
    const rating = parseInt(document.querySelector('input[name="rating"]:checked')?.value || 0);
    const reviewText = document.getElementById('review').value;

    if (!bookTitle || !author || !genre || !rating || !reviewText) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const newReview = {
            bookTitle: bookTitle,
            rating: rating,
            text: reviewText,
            author: currentUserData.fullName,
            userId: currentUser.uid,
            timestamp: new Date().toISOString()
        };

        const newReviewRef = push(ref(database, 'reviews'));
        await set(newReviewRef, newReview);
        
        e.target.reset();
        
        showSuccessMessage('Review submitted successfully!');
        
        document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review. Please try again.');
    }
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 500;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Search books function
window.searchBooks = function() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    const booksRef = ref(database, 'books');
    get(booksRef).then((snapshot) => {
        if (snapshot.exists()) {
            const booksData = snapshot.val();
            let booksArray = Object.values(booksData);
            
            if (searchTerm) {
                booksArray = booksArray.filter(book => 
                    book.title.toLowerCase().includes(searchTerm) ||
                    book.author.toLowerCase().includes(searchTerm) ||
                    book.genre.toLowerCase().includes(searchTerm)
                );
            }
            
            displayFeaturedBooks(booksArray);
            document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Filter books by genre
window.filterByGenre = function(genre) {
    const booksRef = ref(database, 'books');
    get(booksRef).then((snapshot) => {
        if (snapshot.exists()) {
            const booksData = snapshot.val();
            const booksArray = Object.values(booksData);
            const filteredBooks = booksArray.filter(book => book.genre === genre);
            
            displayFeaturedBooks(filteredBooks);
            document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Handle Enter key press in search input
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.id === 'searchInput') {
        searchBooks();
    }
});

// Add scroll-to-top functionality
window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        if (!document.querySelector('.scroll-to-top')) {
            createScrollToTopButton();
        }
    } else {
        const scrollBtn = document.querySelector('.scroll-to-top');
        if (scrollBtn) {
            scrollBtn.remove();
        }
    }
});

function createScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: background 0.3s ease;
    `;
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.background = '#2980b9';
    });
    
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.background = '#3498db';
    });
    
    document.body.appendChild(scrollBtn);
}

console.log('ZOHO Books initialized with Firebase! 12 books in database.');
