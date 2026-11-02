// Auth Manager - Handles Supabase authentication
import { createClient } from '@supabase/supabase-js';

export class AuthManager {
    constructor(ui) {
        this.ui = ui;
        this.supabase = null;
        this.session = null;
        
        // Initialize Supabase client
        const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG || {};
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
            this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            this.setupAuthListener();
        }
    }
    
    setupAuthListener() {
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.session = session;
            this.ui.updateAuthUI(session);
            
            // Dispatch custom event for other managers
            window.dispatchEvent(new CustomEvent('authChange', { 
                detail: { signedIn: !!session, session } 
            }));
        });
    }
    
    async initialize() {
        if (!this.supabase) return;
        
        const { data: { session } } = await this.supabase.auth.getSession();
        this.session = session;
        this.ui.updateAuthUI(session);
    }
    
    isSignedIn() {
        return Boolean(this.session && this.session.user);
    }
    
    getSession() {
        return this.session;
    }
    
    getAccessToken() {
        return this.session?.access_token || null;
    }
    
    async signIn(event) {
        event.preventDefault();
        const email = this.ui.elements.signInEmail.value.trim();
        const password = this.ui.elements.signInPassword.value;
        
        if (!email || !password) {
            this.ui.setAuthMessage('Please enter your email and password.', 'error');
            return;
        }
        
        this.ui.elements.signInBtn.disabled = true;
        this.ui.clearAuthMessage();
        
        const { error } = await this.supabase.auth.signInWithPassword({ email, password });
        this.ui.elements.signInBtn.disabled = false;
        
        if (error) {
            this.ui.setAuthMessage(error.message, 'error');
            return;
        }
        
        this.ui.elements.signInForm.reset();
        // Rest handled by onAuthStateChange
    }
    
    async signUp(event) {
        event.preventDefault();
        const email = this.ui.elements.signUpEmail.value.trim();
        const password = this.ui.elements.signUpPassword.value;
        const fullName = this.ui.elements.signUpName.value.trim();
        
        if (!email || !password) {
            this.ui.setAuthMessage('Please enter an email and a password (at least 8 characters).', 'error');
            return;
        }
        
        this.ui.elements.signUpBtn.disabled = true;
        this.ui.clearAuthMessage();
        
        const { data, error } = await this.supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    display_name: fullName
                }
            }
        });
        
        this.ui.elements.signUpBtn.disabled = false;
        
        if (error) {
            this.ui.setAuthMessage(error.message, 'error');
            return;
        }
        
        if (data.session) {
            // Signed in immediately (email confirmation disabled)
            this.ui.elements.signUpForm.reset();
        } else {
            this.ui.setAuthMessage('Account created! Check your email to confirm your account, then sign in.', 'success');
            this.ui.showSignIn();
        }
    }
    
    async signOut() {
        if (!this.supabase) return;
        
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            console.error('Sign out error:', error);
        }
    }
    
    showSignIn() {
        this.ui.showSignIn();
    }
    
    showSignUp() {
        this.ui.showSignUp();
    }
}