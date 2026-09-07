// =======================
// API MODULE
// =======================

import { getToken, setToken, refreshToken, logout } from './auth.js';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    isRefreshing = false;
    failedQueue = [];
};

/**
 * Universal API call wrapper with automatic token refresh on 401
 * @param {string} url - API endpoint
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {object} body - Request body
 * @param {boolean} retry - Whether to retry on 401
 * @returns {Promise<object>} Parsed JSON response
 */
export async function apiCall(url, method = 'GET', body = null, retry = true) {
    const token = getToken();
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        let response = await fetch(url, options);

        // Auto-refresh on 401
        if (response.status === 401 && retry) {
            console.log('Token expired (401), attempting refresh...');
            
            if (isRefreshing) {
                // Якщо рефреш вже в процесі, чекаємо результату
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        options.headers.Authorization = `Bearer ${token}`;
                        return fetch(url, options).then(res => res.json());
                    });
            }

            isRefreshing = true;

            try {
                const refreshed = await refreshToken();
                console.log('Token refresh result:', refreshed);
                
                if (refreshed) {
                    const newToken = getToken();
                    console.log('Token refreshed successfully, retrying request...');
                    processQueue(null, newToken);
                    
                    // Повтори запит з новим токеном
                    return apiCall(url, method, body, false);
                } else {
                    console.log('Token refresh failed, logging out');
                    processQueue(new Error('Token refresh failed'), null);
                    logout();
                    throw new Error('Session expired - please login again');
                }
            } catch (error) {
                console.error('Token refresh error:', error);
                processQueue(error, null);
                logout();
                throw new Error('Authentication failed');
            }
        }

        if (!response.ok) {
            const text = await response.text();
            console.error(`API Error: ${response.status} - ${text}`);
            throw new Error(`API Error: ${response.status} - ${text}`);
        }

        return response.json();
    } catch (error) {
        console.error(`API call failed: ${url}`, error);
        throw error;
    }
}

/**
 * GET request shorthand
 */
export function apiGet(url) {
    return apiCall(url, 'GET');
}

/**
 * POST request shorthand
 */
export function apiPost(url, body) {
    return apiCall(url, 'POST', body);
}

/**
 * PATCH request shorthand
 */
export function apiPatch(url, body) {
    return apiCall(url, 'PATCH', body);
}

/**
 * DELETE request shorthand
 */
export function apiDelete(url) {
    return apiCall(url, 'DELETE');
}