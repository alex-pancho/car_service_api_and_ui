// =======================
// API MODULE
// =======================

import { getToken, refreshToken, logout } from './auth.js';

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
            console.log('Token expired, attempting refresh...');
            const ok = await refreshToken();
            if (ok) {
                console.log('Token refreshed, retrying request...');
                return apiCall(url, method, body, false);
            }
            logout();
            throw new Error('Session expired');
        }

        if (!response.ok) {
            const text = await response.text();
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
