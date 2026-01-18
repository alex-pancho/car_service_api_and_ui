// frontend/static/js/cars.js

/**
 * Cars Module
 */

let window_selectedCarId = null;

const CarsModule = {
    /**
     * Load car brands from API
     */
    async loadBrands() {
        try {
            const response = await API.get('/cars/brands/');
            const brandSelect = document.getElementById('car-brand-select');
            
            if (!brandSelect) return;
            
            // Clear previous options
            brandSelect.innerHTML = '<option value="">Оберіть бренд</option>';
            
            // Add brands
            if (response.results) {
                response.results.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand.id;
                    option.textContent = brand.name;
                    brandSelect.appendChild(option);
                });
            }
        } catch (error) {
            handleAPIError(error, 'loadBrands');
        }
    },
    
    /**
     * Load car models for selected brand
     */
    async loadCarModels() {
        try {
            const brandSelect = document.getElementById('car-brand-select');
            const modelSelect = document.getElementById('car-model-select');
            
            if (!brandSelect || !modelSelect) return;
            
            const brandId = brandSelect.value;
            
            // Reset if no brand selected
            if (!brandId) {
                modelSelect.innerHTML = '<option value="">Оберіть бренд спочатку</option>';
                return;
            }
            
            // Fetch models
            const response = await API.get(`/cars/models/?brand=${brandId}`);
            
            // Clear previous options
            modelSelect.innerHTML = '<option value="">Оберіть модель</option>';
            
            // Add models
            if (response.results) {
                response.results.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.name;
                    modelSelect.appendChild(option);
                });
            }
        } catch (error) {
            handleAPIError(error, 'loadCarModels');
        }
    },
    
    /**
     * Load cars list
     */
    async loadCars() {
        try {
            const response = await API.get('/cars/');
            const carsList = document.getElementById('cars-list');
            const carsCount = document.getElementById('cars-count');
            
            if (!carsList) return;
            
            // Update count
            const count = response.results ? response.results.length : 0;
            if (carsCount) {
                carsCount.textContent = `${count} машин${count !== 1 ? '' : 'а'}`;
            }
            
            // Show empty state if no cars
            if (!response.results || response.results.length === 0) {
                carsList.innerHTML = `
                    <div class="cars-empty-state">
                        <p class="empty-state-icon">🚗</p>
                        <p class="empty-state-text">Немає автомобілів</p>
                        <p class="empty-state-hint">Додайте свій перший автомобіль для початку</p>
                    </div>
                `;
                return;
            }
            
            // Render cars
            carsList.innerHTML = '';
            response.results.forEach(car => {
                const carCard = this.createCarCard(car);
                carsList.appendChild(carCard);
            });
        } catch (error) {
            handleAPIError(error, 'loadCars');
        }
    },
    
    /**
     * Create car card element
     */
    createCarCard(car) {
        const isSelected = window_selectedCarId === car.id;
        
        const card = document.createElement('div');
        card.className = `car-card ${isSelected ? 'selected' : ''}`;
        card.dataset.carId = car.id;
        card.onclick = () => this.selectCar(car.id);
        
        const updatedDate = new Date(car.updated_at).toLocaleDateString('uk-UA');
        
        card.innerHTML = `
            <div class="car-card-icon">🚗</div>
            
            <div class="car-card-info">
                <h3 class="car-card-title">${car.brand.name} ${car.model.name}</h3>
                
                <div class="car-card-details">
                    <div class="car-detail-row">
                        <span class="detail-icon">📊</span>
                        <span class="detail-label">Поточний пробіг:</span>
                        <span class="detail-value">${car.year} км</span>
                    </div>
                    
                    <div class="car-detail-row">
                        <span class="detail-icon">🏁</span>
                        <span class="detail-label">Рік випуску:</span>
                        <span class="detail-value">${car.year}</span>
                    </div>
                    
                    <div class="car-detail-row">
                        <span class="detail-icon">📅</span>
                        <span class="detail-label">Оновлено:</span>
                        <span class="detail-value">${updatedDate}</span>
                    </div>
                </div>
                
                ${isSelected ? '<div class="car-card-status">✓ Обрано</div>' : ''}
            </div>
            
            <div class="car-card-actions">
                <button 
                    class="btn-icon btn-delete"
                    onclick="CarsModule.deleteCar(${car.id}, event)"
                    title="Видалити автомобіль">
                    🗑️
                </button>
            </div>
        `;
        
        return card;
    },
    
    /**
     * Select car and show its services
     */
    async selectCar(carId) {
        window_selectedCarId = carId;
        
        // Update UI
        this.loadCars();
        
        // Load services for this car
        await ServicesModule.loadServices(carId);
        
        // Show services section
        const servicesSection = document.getElementById('services-section');
        if (servicesSection) {
            servicesSection.classList.remove('hidden');
        }
        
        // Update selected car info
        const selectedCarInfo = document.getElementById('selected-car-info');
        if (selectedCarInfo) {
            selectedCarInfo.textContent = `Управління обслуговуванням...`;
        }
    },
    
    /**
     * Add new car
     */
    async handleAddCar(event) {
        event.preventDefault();
        
        const brandId = document.getElementById('car-brand-select').value;
        const modelId = document.getElementById('car-model-select').value;
        const initialMileage = document.getElementById('initial-mileage-input').value;
        const currentMileage = document.getElementById('current-mileage-input').value;
        
        // Validate
        if (!brandId || !modelId) {
            showNotification('Оберіть бренд та модель', 'error');
            return;
        }
        
        try {
            const body = {
                carBrandId: parseInt(brandId),
                carModelId: parseInt(modelId),
                initial_mileage: parseInt(initialMileage),
                mileage: parseInt(currentMileage)
            };
            
            await API.post('/cars/', body);
            
            // Success
            showNotification(CONFIG.MESSAGES.SUCCESS_CAR_ADDED, 'success');
            closeModal('add-car-modal');
            
            // Reload cars
            await this.loadCars();
        } catch (error) {
            handleAPIError(error, 'addCar');
        }
    },
    
    /**
     * Delete car
     */
    async deleteCar(carId, event) {
        if (event) {
            event.stopPropagation();
        }
        
        if (!confirm(CONFIG.MESSAGES.CONFIRM_DELETE_CAR)) {
            return;
        }
        
        try {
            await API.delete(`/cars/${carId}/`);
            
            // Success
            showNotification(CONFIG.MESSAGES.SUCCESS_CAR_DELETED, 'success');
            
            // Reset if this car was selected
            if (window_selectedCarId === carId) {
                window_selectedCarId = null;
                const servicesSection = document.getElementById('services-section');
                if (servicesSection) {
                    servicesSection.classList.add('hidden');
                }
            }
            
            // Reload cars
            await this.loadCars();
        } catch (error) {
            handleAPIError(error, 'deleteCar');
        }
    },
};

/**
 * Event Handlers
 */
async function handleAddCar(event) {
    await CarsModule.handleAddCar(event);
}

async function selectCar(carId) {
    await CarsModule.selectCar(carId);
}

async function deleteCar(carId, event) {
    await CarsModule.deleteCar(carId, event);
}

function loadCarModels() {
    CarsModule.loadCarModels();
}