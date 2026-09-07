// =======================
// AUTH MODULE
// =======================

import { API, STORAGE_KEYS } from './config.js';
import { getUIManager } from './ui.js';

let token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

export function getToken() {
    return token;
}

export function setToken(newToken) {
    token = newToken;
    if (newToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
    } else {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
}

export function getUserInfo() {
    // Спробуй отримати інформацію про користувача з localStorage
    // або з JWT токену
    try {
        const tokenData = token ? JSON.parse(atob(token.split('.')[1])) : null;
        return tokenData ? { username: tokenData.username || 'User' } : null;
    } catch (error) {
        return null;
    }
}

export async function login(username, password) {
    try {
        const response = await fetch(API.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Невірний логін або пароль');
        }

        const data = await response.json();
        token = data.access;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
        
        console.log('Login successful');
        return { username, token: data.access };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export async function refreshToken() {
    const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refresh) {
        console.log('No refresh token available');
        return false;
    }

    try {
        console.log('Attempting to refresh token...');
        const response = await fetch(API.refresh, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
        });

        if (!response.ok) {
            console.error('Refresh failed with status:', response.status);
            const error = await response.json();
            console.error('Refresh error:', error);
            return false;
        }

        const data = await response.json();
        token = data.access;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
        
        // Оновлюємо refresh token, якщо він також повернувся
        if (data.refresh) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
        }
        
        console.log('Token refreshed successfully');
        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

export function logout() {
    console.log('Logging out...');
    localStorage.clear();
    token = null;
    const ui = getUIManager();
    ui.showLogin();
    window.location.reload();
}

export function checkAuth() {
    return !!token;
}

export function isAuthenticated() {
    return !!token;
}