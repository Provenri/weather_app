// Weather Manager - Handles weather search and display
export class WeatherManager {
    constructor(ui, auth) {
        this.ui = ui;
        this.auth = auth;
        this.apiBaseUrl = (window.APP_CONFIG?.API_BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '');
    }
    
    async search() {
        const city = this.ui.elements.cityInput.value.trim();
        if (!city) {
            this.ui.showError('Please enter a city name');
            return;
        }
        
        this.ui.setLoading(true);
        this.ui.hideError();
        
        try {
            // Fetch weather from backend
            const weatherData = await this.fetchWeather(city);
            
            // Display weather
            this.ui.displayWeather(weatherData);
            
            // Save to history if signed in
            if (this.auth.isSignedIn()) {
                await this.saveToHistory(weatherData);
                
                // Reload history
                const { history } = await import('./history.js');
                // We'll trigger a reload via the history manager
                window.dispatchEvent(new CustomEvent('weatherSaved'));
            }
            
            this.ui.elements.cityInput.value = '';
        } catch (error) {
            this.ui.showError(error.message);
            this.ui.elements.weatherDisplay.classList.remove('visible');
        } finally {
            this.ui.setLoading(false);
        }
    }
    
    async fetchWeather(city) {
        const url = `${this.apiBaseUrl}/weather?city=${encodeURIComponent(city)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `Failed to fetch weather: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    async saveToHistory(weatherData) {
        const token = this.auth.getAccessToken();
        if (!token) return;
        
        const url = `${this.apiBaseUrl}/history`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ weatherData })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to save' }));
            console.error('Save history error:', error);
            // Don't throw - history save failure shouldn't break the weather display
        }
    }
}