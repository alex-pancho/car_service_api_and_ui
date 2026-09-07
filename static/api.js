// =======================
// API MODULE with Token Refresh
// =======================

import { getToken, setToken, refreshToken, forceLogout } from './auth.js';

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
 */
export async function apiCall(url, method = 'GET', body = null, retry = true) {
    const token = getToken();
    
    console.log(`[API] ${method} ${url}`);
    console.log(`[API] Token present: ${!!token}`);
    
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
        
        console.log(`[API] Response status: ${response.status}`);

        // Check for 401 Unauthorized
        if (response.status === 401 && retry) {
            console.warn('[API] ⚠️ Received 401 Unauthorized - attempting token refresh');
            
            if (isRefreshing) {
                console.log('[API] Token refresh already in progress, queuing request...');
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        console.log('[API] Retrying queued request with new token');
                        const newOptions = { ...options };
                        newOptions.headers.Authorization = `Bearer ${token}`;
                        return fetch(url, newOptions).then(res => {
                            if (!res.ok) throw new Error(`API Error: ${res.status}`);
                            return res.json();
                        });
                    })
                    .catch(error => {
                        console.error('[API] Queued request failed:', error);
                        throw error;
                    });
            }

            isRefreshing = true;

            try {
                console.log('[API] Starting token refresh...');
                const refreshed = await refreshToken();
                console.log(`[API] Token refresh result: ${refreshed}`);
                
                if (refreshed) {
                    const newToken = getToken();
                    console.log('[API] ✅ Token refreshed successfully');
                    processQueue(null, newToken);
                    
                    // Retry the original request with new token
                    console.log('[API] Retrying original request with new token');
                    return apiCall(url, method, body, false);
                } else {
                    console.error('[API] ❌ Token refresh failed');
                    processQueue(new Error('Token refresh failed'), null);
                    
                    // Refresh token невалідний - потрібен перелогін
                    console.log('[API] Refresh token invalid, forcing logout');
                    forceLogout();
                    throw new Error('Session expired - please login again');
                }
            } catch (error) {
                console.error('[API] ❌ Token refresh error:', error);
                processQueue(error, null);
                forceLogout();
                throw error;
            }
        }

        // Check for other errors
        if (!response.ok) {
            const text = await response.text();
            console.error(`[API] ❌ API Error: ${response.status}`);
            console.error(`[API] Response body:`, text);
            throw new Error(`API Error: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log('[API] ✅ Success');
        return data;
        
    } catch (error) {
        console.error(`[API] ❌ Request failed: ${url}`, error);
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