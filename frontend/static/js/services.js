// frontend/static/js/services.js

/**
 * Services Module
 */

const ServicesModule = {
    /**
     * Load services for a car
     */
    async loadServices(carId) {
        try {
            if (!carId) {
                showNotification(CONFIG.MESSAGES.ERROR_CAR_REQUIRED, 'error');
                return;
            }
            
            const response = await API.get(`/cars/services/?car=${carId}`);
            const servicesList = document.getElementById('services-list');
            
            if (!servicesList) return;
            
            // Handle empty services
            if (!response.results || response.results.length === 0) {
                servicesList.innerHTML = `
                    <div class="services-empty-state">
                        <p class="empty-state-icon">🔧</p>
                        <p class="empty-state-text">Немає робіт</p>
                        <p class="empty-state-hint">Додайте нове обслуговування для цього автомобіля</p>
                    </div>
                `;
                return;
            }
            
            // Render services
            servicesList.innerHTML = '';
            response.results.forEach(service => {
                const serviceCard = this.createServiceCard(service);
                servicesList.appendChild(serviceCard);
            });
        } catch (error) {
            handleAPIError(error, 'loadServices');
        }
    },
    
    /**
     * Create service card element
     */
    createServiceCard(service) {
        const statusDisplay = CONFIG.SERVICE_STATUSES_DISPLAY[service.status] || service.status;
        const statusClass = `status-${service.status}`;
        
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.serviceId = service.id;
        
        card.innerHTML = `
            <div class="service-card-content">
                <h4 class="service-card-title">${service.work_description}</h4>
                
                <div class="service-card-meta">
                    <span class="meta-item">
                        <span class="meta-icon">⏱️</span>
                        <span class="meta-value">${service.hours} год</span>
                    </span>
                    
                    <span class="meta-item">
                        <span class="meta-icon">📅</span>
                        <span class="meta-value">${new Date(service.scheduled_date).toLocaleDateString('uk-UA')}</span>
                    </span>
                    
                    ${service.cost ? `
                    <span class="meta-item">
                        <span class="meta-icon">💰</span>
                        <span class="meta-value">${service.cost} грн</span>
                    </span>
                    ` : ''}
                </div>
            </div>
            
            <div class="service-card-actions">
                <select 
                    class="status-select ${statusClass}"
                    onchange="ServicesModule.updateServiceStatus(${service.id}, this.value)"
                    title="Змінити статус">
                    ${Object.entries(CONFIG.SERVICE_STATUSES_DISPLAY).map(([key, value]) => 
                        `<option value="${key}" ${service.status === key ? 'selected' : ''}>${value}</option>`
                    ).join('')}
                </select>
                
                <button 
                    class="btn-icon btn-delete"
                    onclick="ServicesModule.deleteService(${service.id}, event)"
                    title="Видалити роботу">
                    🗑️
                </button>
            </div>
        `;
        
        return card;
    },
    
    /**
     * Add new service
     */
    async handleAddService(event) {
        event.preventDefault();
        
        if (!window_selectedCarId) {
            showNotification(CONFIG.MESSAGES.ERROR_CAR_REQUIRED, 'error');
            return;
        }
        
        const description = document.getElementById('work-description-input').value.trim();
        const hours = parseFloat(document.getElementById('work-hours-input').value);
        const scheduledDate = document.getElementById('scheduled-date-input').value;
        const cost = document.getElementById('work-cost-input').value;
        
        // Validate
        if (!description || !hours || !scheduledDate) {
            showNotification(CONFIG.MESSAGES.ERROR_VALIDATION, 'error');
            return;
        }
        
        try {
            const body = {
                car: window_selectedCarId,
                work_description: description,
                hours,
                scheduled_date: scheduledDate,
            };
            
            if (cost) {
                body.cost = parseFloat(cost);
            }
            
            await API.post('/cars/services/', body);
            
            // Success
            showNotification(CONFIG.MESSAGES.SUCCESS_SERVICE_ADDED, 'success');
            closeModal('add-service-modal');
            
            // Reload services
            await this.loadServices(window_selectedCarId);
        } catch (error) {
            handleAPIError(error, 'addService');
        }
    },
    
    /**
     * Update service status
     */
    async updateServiceStatus(serviceId, newStatus) {
        try {
            await API.patch(`/cars/services/${serviceId}/`, {
                status: newStatus,
            });
            
            // Success
            showNotification(CONFIG.MESSAGES.SUCCESS_SERVICE_UPDATED, 'success');
            
            // Reload services
            await this.loadServices(window_selectedCarId);
        } catch (error) {
            handleAPIError(error, 'updateServiceStatus');
        }
    },
    
    /**
     * Delete service
     */
    async deleteService(serviceId, event) {
        if (event) {
            event.stopPropagation();
        }
        
        if (!confirm(CONFIG.MESSAGES.CONFIRM_DELETE_SERVICE)) {
            return;
        }
        
        try {
            await API.delete(`/cars/services/${serviceId}/`);
            
            // Success
            showNotification(CONFIG.MESSAGES.SUCCESS_SERVICE_DELETED, 'success');
            
            // Reload services
            await this.loadServices(window_selectedCarId);
        } catch (error) {
            handleAPIError(error, 'deleteService');
        }
    },
};

/**
 * Event Handlers
 */
async function handleAddService(event) {
    await ServicesModule.handleAddService(event);
}

async function updateServiceStatus(serviceId, newStatus) {
    await ServicesModule.updateServiceStatus(serviceId, newStatus);
}

async function deleteService(serviceId, event) {
    await ServicesModule.deleteService(serviceId, event);
}