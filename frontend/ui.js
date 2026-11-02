// UI Manager - Handles all DOM manipulations
export class UIManager {
    constructor() {
        this.elements = this.cacheElements();
        this.weatherIcons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️',
            'Dust': '🌫️',
            'Sand': '🌫️',
            'Ash': '🌫️',
            'Squall': '💨',
            'Tornado': '🌪️'
        };
    }
    
    cacheElements() {
        return {
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            loading: document.getElementById('loading'),
            errorMessage: document.getElementById('errorMessage'),
            weatherDisplay: document.getElementById('weatherDisplay'),
            historyList: document.getElementById('historyList'),
            emptyHistory: document.getElementById('emptyHistory'),
            historyCount: document.getElementById('historyCount'),
            historyGuestNote: document.getElementById('historyGuestNote'),
            
            // Auth elements
            authForms: document.getElementById('authForms'),
            signInForm: document.getElementById('signInForm'),
            signInEmail: document.getElementById('signInEmail'),
            signInPassword: document.getElementById('signInPassword'),
            signInBtn: document.getElementById('signInBtn'),
            signUpForm: document.getElementById('signUpForm'),
            signUpName: document.getElementById('signUpName'),
            signUpEmail: document.getElementById('signUpEmail'),
            signUpPassword: document.getElementById('signUpPassword'),
            signUpBtn: document.getElementById('signUpBtn'),
            switchToSignIn: document.getElementById('switchToSignIn'),
            switchToSignUp: document.getElementById('switchToSignUp'),
            authMessage: document.getElementById('authMessage'),
            signedInBar: document.getElementById('signedInBar'),
            signedInEmail: document.getElementById('signedInEmail'),
            signOutBtn: document.getElementById('signOutBtn'),
            
            // Weather display elements
            weatherIcon: document.getElementById('weatherIcon'),
            cityName: document.getElementById('cityName'),
            temperature: document.getElementById('temperature'),
            description: document.getElementById('description'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            pressure: document.getElementById('pressure'),
            feelsLike: document.getElementById('feelsLike')
        };
    }
    
    // Loading state
    setLoading(isLoading) {
        this.elements.loading.classList.toggle('visible', isLoading);
        this.elements.searchBtn.disabled = isLoading;
        this.elements.cityInput.disabled = isLoading;
    }
    
    // Error handling
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.add('visible');
        this.elements.weatherDisplay.classList.remove('visible');
    }
    
    hideError() {
        this.elements.errorMessage.classList.remove('visible');
    }
    
    // Auth UI
    setAuthMessage(text, type) {
        this.elements.authMessage.textContent = text;
        this.elements.authMessage.className = `auth-message visible ${type}`.trim();
    }
    
    clearAuthMessage() {
        this.elements.authMessage.textContent = '';
        this.elements.authMessage.className = 'auth-message';
    }
    
    showSignIn() {
        this.elements.signInForm.classList.add('active');
        this.elements.signUpForm.classList.remove('active');
        this.clearAuthMessage();
    }
    
    showSignUp() {
        this.elements.signUpForm.classList.add('active');
        this.elements.signInForm.classList.remove('active');
        this.clearAuthMessage();
    }
    
    updateAuthUI(session) {
        const signedIn = Boolean(session && session.user);
        this.elements.authForms.style.display = signedIn ? 'none' : 'block';
        this.elements.signedInBar.style.display = signedIn ? 'flex' : 'none';
        if (signedIn) {
            this.elements.signedInEmail.textContent = session.user.email;
        }
    }
    
    // Weather display
    displayWeather(data) {
        const icon = this.weatherIcons[data.weather[0].main] || '🌤️';
        this.elements.weatherIcon.textContent = icon;
        this.elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
        this.elements.temperature.textContent = `${Math.round(data.main.temp)}°C`;
        this.elements.description.textContent = data.weather[0].description;
        this.elements.humidity.textContent = `${data.main.humidity}%`;
        this.elements.windSpeed.textContent = `${data.wind.speed} m/s`;
        this.elements.pressure.textContent = `${data.main.pressure} hPa`;
        this.elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        
        this.elements.weatherDisplay.classList.add('visible');
        this.hideError();
    }
    
    // History display
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    
    escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, ch => ({
            '&': '&', '<': '<', '>': '>', '"': '"', "'": '''
        }[ch]));
    }
    
    renderHistory(history, isGuest) {
        this.elements.historyCount.textContent = isGuest ? 0 : history.length;
        
        if (isGuest) {
            this.elements.emptyHistory.style.display = 'none';
            this.elements.historyList.innerHTML = '';
            this.elements.historyList.appendChild(this.elements.historyGuestNote);
            this.elements.historyGuestNote.classList.add('visible');
            return;
        }
        
        this.elements.historyGuestNote.classList.remove('visible');
        
        if (history.length === 0) {
            this.elements.emptyHistory.style.display = 'block';
            this.elements.historyList.innerHTML = '';
            this.elements.historyList.appendChild(this.elements.emptyHistory);
            return;
        }
        
        this.elements.emptyHistory.style.display = 'none';
        this.elements.historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-city">${this.escapeHtml(item.city_name)}</span>
                    <span class="history-country">${this.escapeHtml(item.country_code)}</span>
                </div>
                <div class="history-temp">${Math.round(item.temperature)}°C</div>
                <div class="history-desc">${this.escapeHtml(item.weather_description)}</div>
                <div class="history-meta">
                    <span>💧 ${this.escapeHtml(item.humidity)}%</span>
                    <span>💨 ${this.escapeHtml(item.wind_speed)} m/s</span>
                    <span>🕐 ${this.formatDate(item.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }
    
    clearHistory() {
        this.elements.historyList.innerHTML = '';
        this.elements.historyCount.textContent = '0';
    }
}