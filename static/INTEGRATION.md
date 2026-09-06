# 🏗️ Інтеграція Модульної Архітектури

## 📋 Структура файлів

```
project/
├── config.js           # Конфігурація (API endpoints, константи)
├── auth.js             # Управління токенами і авторизацією
├── api.js              # API wrapper з auto-refresh
├── ui.js               # UI Manager (показ/скриття елементів)
├── cars.js             # Логіка для автомобілів
├── services.js         # Логіка для сервісів
├── auth-ui.js          # Обробка login/logout
├── main.js             # Entry point - ініціалізація
└── index.html          # HTML файл
```

## 📝 Оновлення HTML файлу

Замість одного великого `<script>`, додай в `<head>` або перед `</body>`:

```html
<script type="module" src="main.js"></script>
```

**Важливо:** Використовуй `type="module"` щоб браузер розумів ES6 imports!

## 🎯 Змінити onclick handlers у HTML

### Login форма
```html
<button onclick="window.authManager.login()">Вхід</button>
```

### Авто розділ
```html
<button onclick="window.carManager.showAddCarModal()">Додати авто</button>
<button onclick="window.carManager.addCar()">Зберегти</button>
<button onclick="window.carManager.loadBrands()">Завантажити бренди</button>
```

### Сервіси розділ
```html
<button onclick="window.serviceManager.showAddServiceModal()">Додати роботу</button>
<button onclick="window.serviceManager.addService()">Зберегти роботу</button>
```

### Logout
```html
<button onclick="window.authManager.logout()">Вихід</button>
```

## 🔄 Потік даних

```
main.js (entry point)
    ├── auth-ui.js (handleLogin, handleLogout)
    │   └── auth.js (управління токенами)
    │       └── api.js (API calls + auto-refresh)
    │
    ├── cars.js (loadCars, addCar, deleteCar, selectCar)
    │   └── api.js (API calls)
    │
    ├── services.js (loadServices, addService, deleteService)
    │   └── api.js (API calls)
    │
    └── ui.js (управління UI состоянием)
```

## ✅ Переваги цієї архітектури

✨ **Модульність** - кожен файл несе одну відповідальність  
🔄 **Переиспользуемость** - легко підключити нові модулі  
🐛 **Легче дебагити** - помилки мають чіткий контекст  
📦 **Масштабуемість** - просто додавай нові модулі  
🔐 **Безпека** - token management централізований  

## 🧪 Тестування

Перевір в DevTools console:
```javascript
// Всі функції доступні через window
window.authManager
window.carManager
window.serviceManager
```

Дивись в Network tab на API запити - повинні бути з `Authorization: Bearer ...`

## 🚀 Розширення

Щоб додати новий функціонал:

1. Створи новий `feature.js` модуль
2. Імпортуй необхідні залежності
3. Експортуй функції
4. Додай в `main.js` в `window.featureManager`
5. Використовуй в HTML як `onclick="window.featureManager.function()"`

Приклад:

```javascript
// stats.js
import { apiGet } from './api.js';
import { API } from './config.js';

export async function getCarStats(carId) {
    return apiGet(`${API.stats}?car=${carId}`);
}

// main.js
import * as stats from './stats.js';
window.statsManager = stats;

// HTML
<button onclick="window.statsManager.getCarStats(123)">Статистика</button>
```
