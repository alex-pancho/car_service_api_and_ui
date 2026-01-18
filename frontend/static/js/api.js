// frontend/static/js/api.js

/**
 * API Utilities
 */

class API {
    /**
     * Fetch wrapper with error handling
     */
    static async call(endpoint, method = 'GET', body = null) {
        const url = `${CONFIG.API_URL}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: CONFIG.API_TIMEOUT,
        };
        
        // Add authorization token if available
        const token = sessionStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Add request body if provided
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new APIError(
                    `API Error: ${response.status}`,
                    response.status,
                    await response.text()
                );
            }
            
            // Handle empty responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return null;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    /**
     * GET request
     */
    static async get(endpoint) {
        return this.call(endpoint, 'GET');
    }
    
    /**
     * POST request
     */
    static async post(endpoint, body) {
        return this.call(endpoint, 'POST', body);
    }
    
    /**
     * PATCH request (partial update)
     */
    static async patch(endpoint, body) {
        return this.call(endpoint, 'PATCH', body);
    }
    
    /**
     * PUT request (full update)
     */
    static async put(endpoint, body) {
        return this.call(endpoint, 'PUT', body);
    }
    
    /**
     * DELETE request
     */
    static async delete(endpoint) {
        return this.call(endpoint, 'DELETE');
    }
}

/**
 * Custom API Error Class
 */
class APIError extends Error {
    constructor(message, status, response) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.response = response;
    }
}

/**
 * Error Handler
 */
function handleAPIError(error, context = '') {
    console.error(`API Error in ${context}:`, error);
    
    let userMessage = CONFIG.MESSAGES.ERROR_API_FAILED;
    
    if (error instanceof APIError) {
        if (error.status === 401) {
            userMessage = CONFIG.MESSAGES.ERROR_INVALID_CREDENTIALS;
            handleLogout();
        } else if (error.status === 400) {
            userMessage = CONFIG.MESSAGES.ERROR_VALIDATION;
        } else if (error.status === 404) {
            userMessage = 'Ресурс не знайдено';
        } else if (error.status === 500) {
            userMessage = 'Помилка сервера';
        }
    } else if (error instanceof TypeError) {
        userMessage = CONFIG.MESSAGES.ERROR_NETWORK;
    }
    
    showNotification(userMessage, 'error');
    return userMessage;
}

/**
 * Notification System
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        notification.remove();
    }, CONFIG.UI.TOAST_DURATION);
    
    // Log notification
    console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * URL Query Parameters Helper
 */
const URLParams = {
    get(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    },
    
    set(param, value) {
        const params = new URLSearchParams(window.location.search);
        params.set(param, value);
        window.history.replaceState({}, '', `?${params.toString()}`);
    },
    
    remove(param) {
        const params = new URLSearchParams(window.location.search);
        params.delete(param);
        window.history.replaceState({}, '', `?${params.toString()}`);
    },
};