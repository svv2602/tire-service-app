/**
 * Комплексный тест для проверки прямого доступа к API
 */

const axios = require('axios');

// Настройка прямого доступа к API
const API_URL = 'http://127.0.0.1:8000/api';

// Настройка axios-экземпляра
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Тестируем все основные эндпоинты API
async function testAllEndpoints() {
  console.log('Проверка всех основных API эндпоинтов...\n');
  
  // Массив тестов для выполнения
  const tests = [
    { name: 'Получение списка точек обслуживания', url: '/v2/service-points' },
    { name: 'Получение списка регионов', url: '/v2/regions' },
    { name: 'Получение списка городов', url: '/v2/cities' },
    { name: 'Получение списка партнеров', url: '/v2/partners' },
    { name: 'Получение списка бронирований', url: '/bookings' },
  ];
  
  // Выполняем тесты последовательно
  for (const test of tests) {
    try {
      console.log(`Тестируем: ${test.name}...`);
      const response = await api.get(test.url);
      
      if (response.status === 200) {
        let dataCount = 0;
        if (Array.isArray(response.data)) {
          dataCount = response.data.length;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          dataCount = response.data.data.length;
        }
        
        console.log(`✅ Успешно: статус ${response.status}, получено ${dataCount} записей`);
      } else {
        console.log(`❌ Ошибка: неожиданный статус ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ОШИБКА: ${error.message || 'Неизвестная ошибка'}`);
      if (error.response) {
        console.log(`  Статус: ${error.response.status}`);
        console.log(`  Ошибка: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    console.log(''); // Пустая строка между тестами
  }
}

// Запуск тестов
console.log(`Запускаем тесты для API: ${API_URL}`);
testAllEndpoints()
  .then(() => console.log('Тестирование завершено!'))
  .catch(err => console.error('Произошла ошибка при тестировании:', err));
