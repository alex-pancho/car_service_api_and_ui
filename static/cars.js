// =======================
// CARS MODULE
// =======================

import { API } from './config.js';
import { apiGet, apiPost, apiDelete } from './api.js';
import { getUIManager } from './ui.js';
import { getToken } from './auth.js';

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
        const token = getToken();
        console.log('[Cars] Loading brands, token present:', !!token);
        
        const response = await apiGet(API.brands);
        const select = document.getElementById('carBrand');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">Оберіть бренд</option>';
        
        if (response.results && response.results.length > 0) {
            response.results.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand.id;
                option.textContent = brand.title;
                select.appendChild(option);
            });
            console.log('[Cars] Loaded brands:', response.results.length);
        }
    } catch (error) {
        console.error('[Cars] Error loading brands:', error);
        const ui = getUIManager();
        ui.showAlert('Помилка при завантаженні брендів: ' + error.message);
    }
}

/**
 * Load car models based on selected brand
 */
export async function loadModels(brandId) {
    const select = document.getElementById('carModel');
    
    if (!select) return;
    
    // Якщо brandId не передана, отримай з select
    if (!brandId) {
        brandId = document.getElementById('carBrand')?.value;
    }
    
    if (!brandId) {
        select.innerHTML = '<option value="">Оберіть модель</option>';
        return;
    }
    
    console.log('[Cars] Loading models for brand:', brandId);
    select.innerHTML = '<option value="">Завантаження...</option>';
    
    try {
        const response = await apiGet(`${API.models}?brand=${brandId}`);
        
        const options = ['<option value="">Оберіть модель</option>'];
        if (response.results && response.results.length > 0) {
            response.results.forEach(model => {
                options.push(`<option value="${model.id}">${model.title}</option>`);
            });
            console.log('[Cars] Loaded models:', response.results.length);
        } else {
            options.push('<option value="">Немає доступних моделей</option>');
        }
        select.innerHTML = options.join('');
    } catch (error) {
        console.error('[Cars] Error loading models:', error);
        const ui = getUIManager();
        ui.showAlert('Помилка при завантаженні моделей: ' + error.message);
        select.innerHTML = '<option value="">Помилка завантаження</option>';
    }
}

/**
 * Load all user cars and render them
 */
export async function loadCars() {
    try {
        const token = getToken();
        console.log('[Cars] Loading cars, token present:', !!token);
        
        const response = await apiGet(API.cars);
        const container = document.getElementById('carsList');
        
        if (!container) return;
        
        if (!response.results || response.results.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Немає автомобілів. Додайте свій перший автомобіль!</p>';
            return;
        }
        
        console.log('[Cars] Loaded cars:', response.results.length);
        
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
        console.error('[Cars] Error loading cars:', error);
        const ui = getUIManager();
        ui.showAlert('Помилка при завантаженні автомобілів: ' + error.message);
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
    try {
        const { loadServices } = await import('./services.js');
        loadServices(carId);
    } catch (error) {
        console.error('[Cars] Error importing services:', error);
    }
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
        alert('Заповніть всі поля');
        return;
    }
    
    const data = {
        car_brand: parseInt(brandId),
        car_model: parseInt(modelId),
        initial_mileage: parseInt(initialMileage),
        mileage: parseInt(currentMileage)
    };
    
    try {
        console.log('[Cars] Adding car...');
        await apiPost(API.cars, data);
        console.log('[Cars] Car added successfully');
        alert('Автомобіль успішно додан!');
        window.carManager.closeModal('addCarModal');
        await loadCars();
    } catch (error) {
        console.error('[Cars] Error adding car:', error);
        alert('Помилка при додаванні автомобіля: ' + error.message);
    }
}

/**
 * Delete a car
 */
export async function deleteCar(carId, event) {
    event.stopPropagation();
    
    if (!confirm('Видалити автомобіль?')) return;
    
    try {
        console.log('[Cars] Deleting car:', carId);
        await apiDelete(`${API.cars}${carId}/`);
        console.log('[Cars] ✅ Car deleted successfully');
        
        // Якщо це був вибраний автомобіль
        if (selectedCarId === carId) {
            console.log('[Cars] Deleted car was selected, clearing selection');
            selectedCarId = null;
            const ui = getUIManager();
            ui.hideServices();
        }
        
        // Рефреш списку після успішного видалення
        console.log('[Cars] Refreshing car list after deletion');
        await loadCars();
        console.log('[Cars] ✅ Car list refreshed after deletion');
        
    } catch (error) {
        console.error('[Cars] ❌ Error during deletion:', error);
        
        // Якщо видалення не вдалось - спробуємо рефреш список все одно
        // Бо можливо видалення було успішне на сервері, 
        // а помилка тільки при отриманні нового списку
        console.log('[Cars] ⚠️ Attempting to refresh list despite error...');
        try {
            await loadCars();
            console.log('[Cars] ✅ List refreshed successfully');
            // Якщо рефреш вдалось - видалення ймовірно було успішне
            alert('Автомобіль видалений');
        } catch (refreshError) {
            console.error('[Cars] ❌ List refresh also failed:', refreshError);
            alert('❌ Помилка при видаленні автомобіля: ' + error.message);
        }
    }
}

/**
 * Show add car modal and reset form
 */
export async function showAddCarModal() {
    console.log('[Cars] Opening add car modal');
    window.carManager.openModal('addCarModal');
    
    // Завантажуємо бренди при відкритті модалі
    await loadBrands();
    
    // Reset form
    const brandSelect = document.getElementById('carBrand');
    const modelSelect = document.getElementById('carModel');
    const initialMileageInput = document.getElementById('initialMileage');
    const currentMileageInput = document.getElementById('currentMileage');
    
    if (brandSelect) brandSelect.value = '';
    if (modelSelect) modelSelect.innerHTML = '<option value="">Спочатку оберіть бренд</option>';
    if (initialMileageInput) initialMileageInput.value = '';
    if (currentMileageInput) currentMileageInput.value = '';
}