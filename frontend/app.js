// Main application entry point
import { AuthManager } from './auth.js';
import { WeatherManager } from './weather.js';
import { HistoryManager } from './history.js';
import { UIManager } from './ui.js';

// Initialize managers
const ui = new UIManager();
const auth = new AuthManager(ui);
const weather = new WeatherManager(ui, auth);
const history = new HistoryManager(ui, auth);

// Make managers globally accessible for debugging
window.app = { auth, weather, history, ui };

// Initialize app
async function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Check for existing session
    await auth.initialize();
    
    // Load history if signed in
    if (auth.isSignedIn()) {
        await history.load();
    }
    
    console.log('Weather App initialized');
}

function setupEventListeners() {
    // Search
    document.getElementById('searchBtn').addEventListener('click', () => weather.search());
    document.getElementById('cityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') weather.search();
    });
    
    // Auth
    document.getElementById('signInForm').addEventListener('submit', (e) => auth.signIn(e));
    document.getElementById('signUpForm').addEventListener('submit', (e) => auth.signUp(e));
    document.getElementById('switchToSignUp').addEventListener('click', () => auth.showSignUp());
    document.getElementById('switchToSignIn').addEventListener('click', () => auth.showSignIn());
    document.getElementById('signOutBtn').addEventListener('click', () => auth.signOut());
    
    // Listen for auth state changes
    window.addEventListener('authChange', async (e) => {
        if (e.detail.signedIn) {
            await history.load();
        } else {
            history.clear();
        }
    });
}

init();