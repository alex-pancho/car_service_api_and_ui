// =======================
// AUTH UI MODULE
// =======================

import { login as authLogin, logout as authLogout, isAuthenticated } from './auth.js';
import { getUIManager } from './ui.js';
import { loadBrands, loadCars } from './cars.js';

/**
 * Handle login form submission
 */
export async function handleLogin() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!username || !password) {
        const ui = getUIManager();
        ui.showAlert('Введіть логін та пароль');
        return;
    }
    
    try {
        await authLogin(username, password);
        const ui = getUIManager();
        ui.setUserInfo(username);
        ui.showApp();
        
        // Load initial data
        loadBrands();
        loadCars();
    } catch (error) {
        console.error('Login error:', error);
        const ui = getUIManager();
        ui.showAlert(error.message || 'Помилка при вході');
    }
}

/**
 * Handle logout
 */
export function handleLogout() {
    authLogout();
}

/**
 * Initialize authentication on page load
 */
export function initializeAuth() {
    if (isAuthenticated()) {
        const ui = getUIManager();
        ui.showApp();
        loadCars();
    } else {
        const ui = getUIManager();
        ui.showLogin();
    }
}
