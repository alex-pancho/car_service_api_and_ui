// =======================
// MAIN MODULE (Entry Point)
// =======================

import { handleLogin, handleLogout, initializeAuth } from './auth-ui.js';
import { loadBrands, loadModels, loadCars, showAddCarModal, addCar, deleteCar, selectCar } from './cars.js';
import { loadServices, addService, updateServiceStatus, deleteService, showAddServiceModal } from './services.js';
import { getUIManager } from './ui.js';

// Modal management
const modalManager = {
    open: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },
    close: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
};

// Expose managers to global scope for HTML onclick handlers
window.authManager = {
    login: handleLogin,
    logout: handleLogout,
};

window.carManager = {
    loadBrands,
    loadModels,
    loadCars,
    showAddCarModal,
    addCar,
    deleteCar,
    selectCar,
    closeModal: modalManager.close,
    openModal: modalManager.open,
};

window.serviceManager = {
    loadServices,
    addService,
    updateServiceStatus,
    deleteService,
    showAddServiceModal,
    closeModal: modalManager.close,
    openModal: modalManager.open,
};

/**
 * Initialize application on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing application...');
    
    // Initialize auth
    initializeAuth();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('Application ready!');
});

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Login form - Enter key support
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    // Brand select change
    const brandSelect = document.getElementById('carBrand');
    if (brandSelect) {
        brandSelect.addEventListener('change', loadModels);
    }
    
    // Close modal on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}