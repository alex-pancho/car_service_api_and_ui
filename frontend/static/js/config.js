// frontend/static/js/config.js

/**
 * Application Configuration
 */

const CONFIG = {
    // API Configuration
    API_URL: 'http://127.0.0.1:8000/api',
    API_TIMEOUT: 30000, // 30 seconds
    
    // Storage Keys
    STORAGE_KEY_TOKEN: 'auth_token',
    STORAGE_KEY_USER: 'auth_user',
    
    // Feature Flags
    FEATURES: {
        ENABLE_SERVICE_COST: true,
        ENABLE_STATISTICS: true,
        ENABLE_INVOICES: false, // Coming soon
    },
    
    // Default Values
    DEFAULTS: {
        PAGE_SIZE: 20,
        MILEAGE_MIN: 0,
        MILEAGE_MAX: 999999,
        HOURS_MIN: 0.5,
        HOURS_STEP: 0.5,
    },
    
    // Service Statuses
    SERVICE_STATUSES: {
        PENDING: 'pending',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
    },
    
    SERVICE_STATUSES_DISPLAY: {
        pending: 'Очікує',
        in_progress: 'В роботі',
        completed: 'Виконано',
    },
    
    // Messages
    MESSAGES: {
        // Success
        SUCCESS_LOGIN: 'Успішний вхід в систему',
        SUCCESS_CAR_ADDED: 'Автомобіль успішно додано',
        SUCCESS_CAR_DELETED: 'Автомобіль видалено',
        SUCCESS_SERVICE_ADDED: 'Робота успішно додана',
        SUCCESS_SERVICE_DELETED: 'Робота видалена',
        SUCCESS_SERVICE_UPDATED: 'Статус оновлено',
        
        // Errors
        ERROR_INVALID_CREDENTIALS: 'Невірні облікові дані',
        ERROR_NETWORK: 'Помилка з\'єднання з сервером',
        ERROR_CAR_REQUIRED: 'Спочатку оберіть автомобіль',
        ERROR_API_FAILED: 'Помилка запиту до API',
        ERROR_VALIDATION: 'Перевірте введені дані',
        
        // Confirmations
        CONFIRM_DELETE_CAR: 'Ви впевнені, що хочете видалити цей автомобіль?',
        CONFIRM_DELETE_SERVICE: 'Ви впевнені, що хочете видалити цю роботу?',
    },
    
    // UI Configuration
    UI: {
        TOAST_DURATION: 3000, // 3 seconds
        ANIMATION_DURATION: 300, // 300ms
        DEBOUNCE_DELAY: 500, // 500ms
    },
};

// Log configuration in development
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.info('✓ Application Configuration Loaded', CONFIG);
}