// =======================
// CARS MODULE
// =======================

import { API } from './config.js';
import { apiGet, apiPost, apiDelete } from './api.js';
import { getUIManager } from './ui.js';

let selectedCarId = null;

export function getSelectedCarId() {
    return selectedCarId;
}

export function setSelectedCarId(carId) {
    selectedCarId = carId;
}

export function clearSelectedCar() {
    selectedCarId = null;
}

/**
 * Load all car brands from API
 */
export async function loadBrands() {
    try {
        const response = await apiGet(API.brands);
        const select = document.getElementById('carBrand');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">Оберіть бренд</option>';
        
        response.results.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.id;
            option.textContent = brand.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading brands:', error);
        const ui = getUIManager();
        ui.showAlert('Помилка при завантаженні брендів');
    }
}

/**
 * Load car models based on selected brand
 */
export async function loadModels() {
    const brandId = document.getElementById('carBrand')?.value;
    const select = document.getElementById('carModel');
    
    if (!select) return;
    
    if (!brandId) {
        select.innerHTML = '<option value="">Оберіть модель</option>';
        return;
    }
    
    try {
        const response = await apiGet(`${API.models}?brand=${brandId}`);
        
        const options = ['<option value="">Оберіть модель</option>'];
        response.results.forEach(model => {
            options.push(`<option value="${model.id}">${model.title}</option>`);
        });
        select.innerHTML = options.join('');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

/**
 * Load all user cars and render them
 */
export async function loadCars() {
    try {
        const response = await apiGet(API.cars);
        const container = document.getElementById('carsList');
        
        if (!container) return;
        
        if (response.results.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Немає автомобілів. Додайте свій перший автомобіль!</p>';
            return;
        }
        
        const carsHTML = response.results.map(car => `
            <div onclick="window.carManager.selectCar(${car.id})" class="border-2 ${selectedCarId === car.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'} rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all">
                <div class="flex items-start gap-4">
                    <div class="text-4xl">${car.logo || '🚗'}</div>
                    <div class="flex-1">
                        <h3 class="font-bold text-xl text-gray-900">${car.brand} ${car.model}</h3>
                        <div class="mt-2 space-y-1 text-sm text-gray-600">
                            <p>📊 Поточний пробіг: <span class="font-semibold">${car.mileage} км</span></p>
                            <p>🏁 Початковий: ${car.initial_mileage} км</p>
                            <p>📅 Оновлено: ${new Date(car.updated_mileage_at).toLocaleDateString('uk-UA')}</p>
                        </div>
                    </div>
                    <button onclick="window.carManager.deleteCar(${car.id}, event)" class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                        🗑️
                    </button>
                </div>
                ${selectedCarId === car.id ? '<div class="mt-3 pt-3 border-t border-indigo-200 text-indigo-600 text-sm font-medium">✓ Обрано</div>' : ''}
            </div>
        `).join('');
        
        container.innerHTML = carsHTML;
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

/**
 * Select a car and load its services
 */
export async function selectCar(carId) {
    selectedCarId = carId;
    loadCars();
    
    const ui = getUIManager();
    ui.showServices();
    ui.scrollToElement('servicesSection', true);
    
    // Load services for this car
    const { loadServices } = await import('./services.js');
    loadServices(carId);
}

/**
 * Add a new car
 */
export async function addCar() {
    const brandId = document.getElementById('carBrand')?.value;
    const modelId = document.getElementById('carModel')?.value;
    const initialMileage = document.getElementById('initialMileage')?.value;
    const currentMileage = document.getElementById('currentMileage')?.value;
    
    if (!brandId || !modelId || !initialMileage || !currentMileage) {
        const ui = getUIManager();
        ui.showAlert('Заповніть всі поля');
        return;
    }
    
    const data = {
        car_brand: parseInt(brandId),
        car_model: parseInt(modelId),
        initial_mileage: parseInt(initialMileage),
        mileage: parseInt(currentMileage)
    };
    
    try {
        await apiPost(API.cars, data);
        const ui = getUIManager();
        ui.closeModal('addCarModal');
        loadCars();
    } catch (error) {
        console.error('Error adding car:', error);
        const ui = getUIManager();
        ui.showAlert('Помилка при додаванні автомобіля');
    }
}

/**
 * Delete a car
 */
export async function deleteCar(carId, event) {
    event.stopPropagation();
    
    const ui = getUIManager();
    if (!ui.showConfirm('Видалити автомобіль?')) return;
    
    try {
        await apiDelete(`${API.cars}${carId}/`);
        if (selectedCarId === carId) {
            selectedCarId = null;
            ui.hideServices();
        }
        loadCars();
    } catch (error) {
        console.error('Error deleting car:', error);
        ui.showAlert('Помилка при видаленні автомобіля');
    }
}

/**
 * Show add car modal and reset form
 */
export function showAddCarModal() {
    const ui = getUIManager();
    ui.openModal('addCarModal');
    
    const brandSelect = document.getElementById('carBrand');
    const modelSelect = document.getElementById('carModel');
    const initialMileageInput = document.getElementById('initialMileage');
    const currentMileageInput = document.getElementById('currentMileage');
    
    if (brandSelect) brandSelect.value = '';
    if (modelSelect) modelSelect.innerHTML = '<option value="">Спочатку оберіть бренд</option>';
    if (initialMileageInput) initialMileageInput.value = '';
    if (currentMileageInput) currentMileageInput.value = '';
}
