// History Manager - Handles weather history loading and display
export class HistoryManager {
    constructor(ui, auth) {
        this.ui = ui;
        this.auth = auth;
        this.apiBaseUrl = (window.APP_CONFIG?.API_BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '');
        
        // Listen for weather saved events
        window.addEventListener('weatherSaved', () => this.load());
        window.addEventListener('authChange', (e) => {
            if (e.detail.signedIn) {
                this.load();
            } else {
                this.clear();
            }
        });
    }
    
    async load() {
        if (!this.auth.isSignedIn()) {
            this.ui.renderHistory([], true);
            return;
        }
        
        const token = this.auth.getAccessToken();
        if (!token) {
            this.ui.renderHistory([], true);
            return;
        }
        
        try {
            const url = `${this.apiBaseUrl}/history?limit=50`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, auth will handle redirect
                    this.ui.renderHistory([], true);
                    return;
                }
                throw new Error(`Failed to load history: ${response.statusText}`);
            }
            
            const history = await response.json();
            this.ui.renderHistory(history, false);
        } catch (error) {
            console.error('Load history error:', error);
            this.ui.renderHistory([], false);
        }
    }
    
    clear() {
        this.ui.clearHistory();
        this.ui.elements.historyGuestNote.classList.add('visible');
    }
}