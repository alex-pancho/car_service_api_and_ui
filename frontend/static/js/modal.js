// frontend/static/js/modal.js

/**
 * Modal Management
 */

const ModalManager = {
    /**
     * Open modal
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            this.blockPageScroll();
            console.log(`✓ Modal opened: ${modalId}`);
        }
    },
    
    /**
     * Close modal
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            this.allowPageScroll();
            console.log(`✓ Modal closed: ${modalId}`);
        }
    },
    
    /**
     * Close all modals
     */
    closeAll() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        this.allowPageScroll();
    },
    
    /**
     * Block page scroll when modal is open
     */
    blockPageScroll() {
        document.body.style.overflow = 'hidden';
    },
    
    /**
     * Allow page scroll
     */
    allowPageScroll() {
        document.body.style.overflow = '';
    },
    
    /**
     * Setup modal event listeners
     */
    init() {
        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    this.close(modal.id);
                }
            });
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAll();
            }
        });
        
        // Close buttons
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    this.close(modal.id);
                }
            });
        });
        
        console.log('✓ Modal Manager initialized');
    },
};

/**
 * Convenience Functions
 */
function openModal(modalId) {
    ModalManager.open(modalId);
}

function closeModal(modalId) {
    ModalManager.close(modalId);
}

function closeAllModals() {
    ModalManager.closeAll();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    ModalManager.init();
});