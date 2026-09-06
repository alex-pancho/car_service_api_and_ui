// =======================
// UI MODULE
// =======================

let uiManager = null;

class UIManager {
    constructor() {
        this.loginSection = document.getElementById('loginSection');
        this.appSection = document.getElementById('appSection');
        this.servicesSection = document.getElementById('servicesSection');
        this.userInfo = document.getElementById('userInfo');
    }

    showLogin() {
        this.loginSection?.classList.remove('hidden');
        this.appSection?.classList.add('hidden');
    }

    showApp() {
        this.loginSection?.classList.add('hidden');
        this.appSection?.classList.remove('hidden');
    }

    showServices() {
        this.servicesSection?.classList.remove('hidden');
    }

    hideServices() {
        this.servicesSection?.classList.add('hidden');
    }

    setUserInfo(username) {
        if (this.userInfo) {
            this.userInfo.textContent = `👤 ${username}`;
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    scrollToElement(elementId, smooth = true) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ 
                behavior: smooth ? 'smooth' : 'auto',
                block: 'nearest'
            });
        }
    }

    showAlert(message) {
        alert(message);
    }

    showConfirm(message) {
        return confirm(message);
    }
}

export function getUIManager() {
    if (!uiManager) {
        uiManager = new UIManager();
    }
    return uiManager;
}
