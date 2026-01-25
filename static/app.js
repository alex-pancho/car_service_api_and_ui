// =======================
// CONFIG
// =======================
const API = {
    login: '/api/auth/signin/',
    refresh: '/api/auth/token/refresh/',
    cars: '/api/cars/',
    brands: '/api/brands/',
    models: '/api/models/',
    services: '/api/services/',
};

let token = localStorage.getItem('access');
let selectedCarId = null;


// =======================
// AUTH
// =======================
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const response = await fetch(API.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        alert('Невірний логін або пароль');
        return;
    }
    const data = await response.json();
    token = data.access;
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);

    document.getElementById('userInfo').textContent = `👤 ${username}`;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
    loadBrands();
    loadCars();
}

async function refreshToken() {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) return false;

    const response = await fetch(API.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem('access', data.access);
    token = data.access;
    return true;
}

function logout() {
    localStorage.clear();
    token = null;
    selectedCarId = null;
    showLogin();
}


// =======================
// API WRAPPER (AUTO REFRESH)
// =======================
async function apiCall(url, method = 'GET', body = null, retry = true) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        }
    };

    if (body) options.body = JSON.stringify(body);

    let response = await fetch(url, options);

    if (response.status === 401 && retry) {
        const ok = await refreshToken();
        if (ok) return apiCall(url, method, body, false);
        logout();
        throw new Error('Session expired');
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    return response.json();
}

// =======================
// UI STATE
// =======================
function showLogin() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('appSection').classList.add('hidden');
}

function showApp() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
}


// =======================
// BOOTSTRAP
// =======================
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showApp();
        loadCars();
    } else {
        showLogin();
    }
});


// API calls
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(endpoint, options);
    if (!response.ok) throw new Error('API call failed');
    return response.json();
}

// Load data
async function loadBrands() {
    try {
        const response = await apiCall(API.brands);
        const select = document.getElementById('carBrand');
        select.innerHTML = '<option value="">Оберіть бренд</option>';
        
        response.results.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.id;
            option.textContent = brand.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading brands:', error);
    }
}

async function loadModels() {
    const brandId = document.getElementById('carBrand').value;
    const select = document.getElementById('carModel');
    
    if (!brandId) {
        select.innerHTML = '<option value="">Оберіть модель</option>';
        return;
    }
    
    try {
        const response = await apiCall(`${API.models}?brand=${brandId}`);
        
        const options = ['<option value="">Оберіть модель</option>'];
        response.results.forEach(model => {
            options.push(`<option value="${model.id}">${model.title}</option>`);
        });
        select.innerHTML = options.join('');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

async function loadCars() {
    try {
        const response = await apiCall(API.cars);
        const container = document.getElementById('carsList');
        
        if (response.results.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Немає автомобілів. Додайте свій перший автомобіль!</p>';
            return;
        }
        
        const carsHTML = response.results.map(car => `
            <div onclick="selectCar(${car.id})" class="border-2 ${selectedCarId === car.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'} rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all">
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
                    <button onclick="deleteCar(${car.id}, event)" class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
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

async function loadServices(carId) {
    try {
        const response = await apiCall(`${API.services}?car=${carId}`);
        const services = response.results || response;
        const container = document.getElementById('servicesList');
        container.innerHTML = '';
        
        // Знайти інформацію про обране авто
        const carsResponse = await apiCall(API.cars);
        const selectedCar = carsResponse.results.find(car => car.id === carId);
        if (selectedCar) {
            document.getElementById('selectedCarInfo').textContent = `${selectedCar.brand} ${selectedCar.model} (${selectedCar.mileage} км)`;
        }
        
        if (services.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Немає робіт. Додайте нове обслуговування!</p>';
            return;
        }
        
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'in_progress': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800'
        };
        
        services.forEach(service => {
            container.innerHTML += `
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
                            <select onchange="updateServiceStatus(${service.id}, this.value)" class="px-3 py-1 rounded-lg text-sm font-medium ${statusColors[service.status]} border-0">
                                <option value="pending" ${service.status === 'pending' ? 'selected' : ''}>Очікує</option>
                                <option value="in_progress" ${service.status === 'in_progress' ? 'selected' : ''}>В роботі</option>
                                <option value="completed" ${service.status === 'completed' ? 'selected' : ''}>Виконано</option>
                            </select>
                            <button onclick="deleteService(${service.id})" class="text-red-500 hover:text-red-700 p-2">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Actions
function selectCar(carId) {
    selectedCarId = carId;
    loadCars(); // Перезавантажити список авто для оновлення виділення
    loadServices(carId);
    
    // Показати секцію сервісів
    document.getElementById('servicesSection').classList.remove('hidden');
    
    // Прокрутити до секції сервісів
    document.getElementById('servicesSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function addCar() {
    const data = {
        car_brand: parseInt(document.getElementById('carBrand').value),
        car_model: parseInt(document.getElementById('carModel').value),
        initial_mileage: parseInt(document.getElementById('initialMileage').value),
        mileage: parseInt(document.getElementById('currentMileage').value)
    };
    
    try {
        await apiCall(API.cars, 'POST', data);
        closeModal('addCarModal');
        loadCars();
    } catch (error) {
        console.error('Error adding car:', error);
        alert('Помилка при додаванні автомобіля');
    }
}

async function deleteCar(carId, event) {
    event.stopPropagation();
    if (!confirm('Видалити автомобіль?')) return;
    
    try {
        await apiCall(`${API.cars}${carId}/`, 'DELETE');
        if (selectedCarId === carId) {
            selectedCarId = null;
            document.getElementById('servicesSection').classList.add('hidden');
        }
        loadCars();
    } catch (error) {
        console.error('Error deleting car:', error);
    }
}

async function addService() {
    const data = {
        car: selectedCarId,
        work_description: document.getElementById('workDescription').value,
        hours: parseFloat(document.getElementById('workHours').value),
        scheduled_date: document.getElementById('scheduledDate').value
    };
    
    try {
        await apiCall(API.services, 'POST', data);
        closeModal('addServiceModal');
        loadServices(selectedCarId);
    } catch (error) {
        console.error('Error adding service:', error);
        alert('Помилка при додаванні роботи');
    }
}

async function updateServiceStatus(serviceId, newStatus) {
    try {
        await apiCall(`${API.services}${serviceId}/`, 'PATCH', { status: newStatus });
        loadServices(selectedCarId);
    } catch (error) {
        console.error('Error updating service status:', error);
    }
}

async function deleteService(serviceId) {
    if (!confirm('Видалити роботу?')) return;
    
    try {
        await apiCall(`${API.services}${serviceId}/`, 'DELETE');
        loadServices(selectedCarId);
    } catch (error) {
        console.error('Error deleting service:', error);
    }
}

// Modal functions
function showAddCarModal() {
    document.getElementById('addCarModal').classList.add('active');
    document.getElementById('carBrand').value = '';
    document.getElementById('carModel').innerHTML = '<option value="">Спочатку оберіть бренд</option>';
    document.getElementById('initialMileage').value = '';
    document.getElementById('currentMileage').value = '';
}

function showAddServiceModal() {
    if (!selectedCarId) {
        alert('Спочатку оберіть автомобіль');
        return;
    }
    document.getElementById('addServiceModal').classList.add('active');
    document.getElementById('workDescription').value = '';
    document.getElementById('workHours').value = '';
    document.getElementById('scheduledDate').value = new Date().toISOString().split('T')[0];
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Enter key support
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});