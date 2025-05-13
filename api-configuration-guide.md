# Руководство по работе с API

Этот документ содержит рекомендации и правила по работе с API в проекте для обеспечения корректной интеграции с тестером API и бэкендом.

## Основные правила конфигурации API

1. **Базовый URL** должен быть настроен без префикса `/api`:
   ```javascript
   const apiClient = axios.create({
     baseURL: 'http://127.0.0.1:8000', // Правильно - без префикса /api
     // ...
   });
   ```

2. **Пути API** должны включать префикс `/api`:
   ```javascript
   // Правильно:
   const response = await axios.get('/api/v2/service-points');
   
   // Неправильно:
   const response = await axios.get('/v2/service-points');
   ```

## Структура API-запросов

### API v2 (новый API)

Для новых эндпоинтов API используйте следующую структуру:

```javascript
// GET запросы (точки обслуживания)
const response = await apiClient.get('/api/v2/service-points');
const response = await apiClient.get(`/api/v2/service-points/${id}`);

// POST запросы
const response = await apiClient.post('/api/v2/service-points', data);

// PUT запросы
const response = await apiClient.put(`/api/v2/service-points/${id}`, data);

// DELETE запросы
await apiClient.delete(`/api/v2/service-points/${id}`);

// География
const response = await apiClient.get('/api/v2/regions');
const response = await apiClient.get('/api/v2/cities');

// Партнеры
const response = await apiClient.get('/api/v2/partners');
const response = await apiClient.get(`/api/v2/partners/${id}`);
```

### API v1 (устаревший API)

Для поддержки старых эндпоинтов API используйте следующую структуру:

```javascript
// GET запросы (бронирования)
const response = await apiClient.get('/api/bookings');
const response = await apiClient.get(`/api/bookings/${id}`);

// POST запросы
const response = await apiClient.post('/api/bookings', data);

// PUT запросы
const response = await apiClient.put(`/api/bookings/${id}`, data);

// DELETE запросы
await apiClient.delete(`/api/bookings/${id}`);

// Услуги (все еще используют v1 API)
const response = await apiClient.get('/api/services');
const response = await apiClient.get(`/api/services/${id}`);

// Встречи
const response = await apiClient.post('/api/appointments', appointmentData);
```

## Маршруты для конкретных функций

### Рабочее время и доступность

Для работы с доступностью точек обслуживания используйте следующие маршруты:

```javascript
// Получение доступных дней
const response = await axios.get(`/api/v2/service-points/${servicePointId}/available-days`);

// Получение доступных временных слотов на конкретную дату
const response = await axios.get(`/api/v2/service-points/${servicePointId}/available-time-slots`, { params: { date } });

// Обновление статуса точки обслуживания
const response = await axios.patch(`/api/v2/service-points/${id}/status`, { status });
```

### Связанные услуги

Для получения услуг, связанных с определенной точкой обслуживания:

```javascript
// Получение услуг для конкретной точки
const response = await axios.get(`/api/v2/service-points/${servicePointId}/services`);
```

## Рекомендации по тестированию API

### Использование API checker

Для проверки доступности API используйте скрипт `api-paths-checker.js`:

```bash
node api-paths-checker.js
```

Этот скрипт проверяет доступность основных эндпоинтов API и поможет выявить проблемы с конфигурацией.

### Автоматическое исправление путей API

Для автоматического исправления путей в конфигурации API используйте скрипт `fix-api-paths.js`:

```bash
node fix-api-paths.js
```

## Обработка ответов API

При получении ответов от API учитывайте возможные форматы данных:

```javascript
// Пример обработки ответа с учетом разных форматов
let data;
if (response.data.data) {
  data = response.data.data;
} else if (Array.isArray(response.data)) {
  data = response.data;
} else {
  data = response.data;
}
```

## Устранение неполадок

### Ошибка 500 при работе с тестером API

Если вы получаете ошибку 500 при использовании тестера API, проверьте:

1. Базовый URL в конфигурации API-клиентов (не должен содержать префикс `/api`)
2. Пути в запросах API (должны содержать префикс `/api`)
3. Запустите скрипт проверки API: `node api-paths-checker.js`

### Проблемы с аутентификацией

Если возникают проблемы с аутентификацией:

1. Проверьте заголовки авторизации
2. Убедитесь, что токен передается корректно
3. Проверьте формат токена (Bearer, JWT и т.д.)

## Полезные инструменты

- `api-paths-checker.js` - проверка доступности API и правильности путей
- `fix-api-paths.js` - автоматическое исправление путей в конфигурации API
- `test-api-comprehensive.js` - комплексное тестирование API
- `test-partners-api.js` - тестирование API партнеров
- `test-bookings-api.js` - тестирование API бронирований
