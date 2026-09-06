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
}

export async function login(username, password) {
    const response = await fetch(API.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error('Невірний логін або пароль');
    }

    const data = await response.json();
    token = data.access;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);

    return { username, token: data.access };
}

export async function refreshToken() {
    const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refresh) return false;

    try {
        const response = await fetch(API.refresh, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
        });

        if (!response.ok) return false;

        const data = await response.json();
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
        token = data.access;
        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

export function logout() {
    localStorage.clear();
    token = null;
    const ui = getUIManager();
    ui.showLogin();
}

export function isAuthenticated() {
    return !!token;
}
