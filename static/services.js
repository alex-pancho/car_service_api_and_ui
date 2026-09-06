// =======================
// SERVICES MODULE
// =======================

import { API, STATUS_COLORS } from './config.js';
import { apiGet, apiPost, apiPatch, apiDelete } from './api.js';
import { getUIManager } from './ui.js';
import { getSelectedCarId } from './cars.js';

/**
 * Load services for a specific car
 */
export async function loadServices(carId) {
    try {
        const response = await apiGet(`${API.services}?car=${carId}`);
        const services = response.results || response;
        const container = document.getElementById('servicesList');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        // Load and display car info
        try {
            const carsResponse = await apiGet(API.cars);
            const selectedCar = carsResponse.results.find(car => car.id === carId);
            if (selectedCar) {
                const carInfoElement = document.getElementById('selectedCarInfo');
                if (carInfoElement) {
                    carInfoElement.textContent = `${selectedCar.brand} ${selectedCar.model} (${selectedCar.mileage} км)`;
                }
            }
        } catch (error) {
            console.error('Error loading car info:', error);
        }
        
        if (services.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Немає робіт. Додайте нове обслуговування!</p>';
            return;
        }
        
        const servicesHTML = services.map(service => `
            <div class="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-bold text-lg text-gray-900">${service.work_description}</h4>
                        <div class="flex gap-4 mt-2 text-sm text-gray-600">
                            <span>⏱️ ${service.hours} год</span>
                            <span>📅 ${service.scheduled_date}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <select onchange="window.serviceManager.updateServiceStatus(${service.id}, this.value)" class="px-3 py-1 rounded-lg text-sm font-medium ${STATUS_COLORS[service.status]} border-0">
                            <option value="pending" ${service.status === 'pending' ? 'selected' : ''}>Очікує</option>
                            <option value="in_progress" ${service.status === 'in_progress' ? 'selected' : ''}>В роботі</option>
                            <option value="completed" ${service.status === 'completed' ? 'selected' : ''}>Виконано</option>
                        </select>
                        <button onclick="window.serviceManager.deleteService(${service.id})" class="text-red-500 hover:text-red-700 p-2">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = servicesHTML;
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

/**
 * Add a new service
 */
export async function addService() {
    const selectedCarId = getSelectedCarId();
    
    if (!selectedCarId) {
        const ui = getUIManager();
        ui.showAlert('Спочатку оберіть автомобіль');
        return;
    }
    
    const workDescription = document.getElementById('workDescription')?.value;
    const workHours = document.getElementById('workHours')?.value;
    const scheduledDate = document.getElementById('scheduledDate')?.value;
    
    if (!workDescription || !workHours || !scheduledDate) {
        const ui = getUIManager();
        ui.showAlert('Заповніть всі поля');
        return;
    }
    
    const data = {
        car: selectedCarId,
        work_description: workDescription,
        hours: parseFloat(workHours),
        scheduled_date: scheduledDate
    };
    
    try {
        await apiPost(API.services, data);
        const ui = getUIManager();
        ui.closeModal('addServiceModal');
        loadServices(selectedCarId);
    } catch (error) {
        console.error('Error adding service:', error);
        const ui = getUIManager();
        ui.showAlert('Помилка при додаванні роботи');
    }
}

/**
 * Update service status
 */
export async function updateServiceStatus(serviceId, newStatus) {
    const selectedCarId = getSelectedCarId();
    
    try {
        await apiPatch(`${API.services}${serviceId}/`, { status: newStatus });
        loadServices(selectedCarId);
    } catch (error) {
        console.error('Error updating service status:', error);
        const ui = getUIManager();
        ui.showAlert('Помилка при оновленні статусу');
    }
}

/**
 * Delete a service
 */
export async function deleteService(serviceId) {
    const selectedCarId = getSelectedCarId();
    const ui = getUIManager();
    
    if (!ui.showConfirm('Видалити роботу?')) return;
    
    try {
        await apiDelete(`${API.services}${serviceId}/`);
        loadServices(selectedCarId);
    } catch (error) {
        console.error('Error deleting service:', error);
        ui.showAlert('Помилка при видаленні роботи');
    }
}

/**
 * Show add service modal and reset form
 */
export function showAddServiceModal() {
    const selectedCarId = getSelectedCarId();
    const ui = getUIManager();
    
    if (!selectedCarId) {
        ui.showAlert('Спочатку оберіть автомобіль');
        return;
    }
    
    ui.openModal('addServiceModal');
    
    const workDescriptionInput = document.getElementById('workDescription');
    const workHoursInput = document.getElementById('workHours');
    const scheduledDateInput = document.getElementById('scheduledDate');
    
    if (workDescriptionInput) workDescriptionInput.value = '';
    if (workHoursInput) workHoursInput.value = '';
    if (scheduledDateInput) scheduledDateInput.value = new Date().toISOString().split('T')[0];
}
