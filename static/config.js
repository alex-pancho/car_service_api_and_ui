// =======================
// CONFIG
// =======================

export const API = {
    login: '/api/auth/signin/',
    refresh: '/api/auth/token/refresh/',
    cars: '/api/cars/',
    brands: '/api/brands/',
    models: '/api/models/',
    services: '/api/services/',
};

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access',
    REFRESH_TOKEN: 'refresh',
};

export const STATUS_COLORS = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800'
};
