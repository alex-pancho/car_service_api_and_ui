// frontend/static/js/auth.js

/**
 * Authentication Module
 */

class Auth {
    /**
     * Initialize authentication on page load
     */
    static init() {
        const token = sessionStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
        if (token) {
            this.showAppSection();
            this.loadInitialData();
        } else {
            this.showLoginSection();
        }
    }
    
    /**
     * Handle login form submission
     */
    static async handleLogin(username, password) {
        try {
            const response = await API.post('/auth/signin/', {
                username,
                password,
            });
            
            if (response.access) {
                // Save token to session storage
                sessionStorage.setItem(CONFIG.STORAGE_KEY_TOKEN, response.access);
                sessionStorage.setItem(CONFIG.STORAGE_KEY_USER, username);
                
                // Update UI
                this.showAppSection();
                this.updateUserInfo(username);
                
                // Load data
                this.loadInitialData();
                
                showNotification(CONFIG.MESSAGES.SUCCESS_LOGIN, 'success');
                return true;
            }
        } catch (error) {
            handleAPIError(error, 'login');
            return false;
        }
    }
    
    /**
     * Handle logout
     */
    static logout() {
        // Clear storage
        sessionStorage.removeItem(CONFIG.STORAGE_KEY_TOKEN);
        sessionStorage.removeItem(CONFIG.STORAGE_KEY_USER);
        
        // Reset state
        window.selectedCarId = null;
        
        // Update UI
        this.showLoginSection();
        this.clearForms();
    }
    
    /**
     * Show login section
     */
    static showLoginSection() {
        const loginSection = document.getElementById('login-section');
        const appSection = document.getElementById('app-section');
        
        if (loginSection) loginSection.classList.remove('hidden');
        if (appSection) appSection.classList.add('hidden');
    }
    
    /**
     * Show app section
     */
    static showAppSection() {
        const loginSection = document.getElementById('login-section');
        const appSection = document.getElementById('app-section');
        
        if (loginSection) loginSection.classList.add('hidden');
        if (appSection) appSection.classList.remove('hidden');
    }
    
    /**
     * Update user info display
     */
    static updateUserInfo(username) {
        const userInfoElement = document.getElementById('user-info');
        if (userInfoElement) {
            userInfoElement.textContent = `👤 ${username}`;
        }
    }
    
    /**
     * Load initial data after login
     */
    static async loadInitialData() {
        try {
            await CarsModule.loadBrands();
            await CarsModule.loadCars();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }
    
    /**
     * Clear all form inputs
     */
    static clearForms() {
        // Clear login form
        const usernameInput = document.getElementById('username-input');
        const passwordInput = document.getElementById('password-input');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        // Clear modal forms
        document.querySelectorAll('.modal-form').forEach(form => {
            form.reset();
        });
    }
}

/**
 * Event Handlers
 */
function handleLoginSubmit(event) {
    event.preventDefault();
    
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value;
    
    if (!username || !password) {
        showNotification('Заповніть усі поля', 'error');
        return;
    }
    
    Auth.handleLogin(username, password);
}

function handleLogout() {
    if (confirm('Ви впевнені, що хочете вийти?')) {
        Auth.logout();
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Handle Enter key on password field
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleLoginSubmit(event);
            }
        });
    }
});