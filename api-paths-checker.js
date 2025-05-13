/**
 * API Paths Checker - проверяет правильность настройки API путей
 * в приложении и обеспечивает правильную работу тестера API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Базовый URL API для проверки
const API_BASE_URL = 'http://127.0.0.1:8000';

// Эндпоинты для тестирования
const testEndpoints = [
  { path: '/api/v2/service-points', method: 'GET', name: 'Получение списка точек обслуживания' },
  { path: '/api/v2/regions', method: 'GET', name: 'Получение списка регионов' },
  { path: '/api/v2/cities', method: 'GET', name: 'Получение списка городов' },
  { path: '/api/bookings', method: 'GET', name: 'Получение списка бронирований' },
  { path: '/api/v2/partners', method: 'GET', name: 'Получение списка партнеров' },
  { path: '/api/services', method: 'GET', name: 'Получение списка услуг' }
];

// Создаем экземпляр axios для тестирования
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Функция проверки доступности API
async function checkApiEndpoints() {
  console.log('Проверка настроек и доступности API...\n');
  console.log(`Базовый URL: ${API_BASE_URL}`);
  console.log('-'.repeat(60));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`Проверка: ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
      const response = await apiClient.request({
        method: endpoint.method,
        url: endpoint.path
      });
      
      // Проверяем успешный ответ
      if (response.status === 200) {
        let dataCount = 'N/A';
        if (Array.isArray(response.data)) {
          dataCount = response.data.length;
        } else if (response.data && Array.isArray(response.data.data)) {
          dataCount = response.data.data.length;
        }
        
        console.log(`✅ УСПЕШНО: статус ${response.status}, получено записей: ${dataCount}`);
        successCount++;
      } else {
        console.log(`⚠️ ВНИМАНИЕ: Неожиданный статус ${response.status}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ ОШИБКА: ${error.message}`);
      if (error.response) {
        console.log(`  Статус: ${error.response.status}`);
        
        // Проверка на ошибку 500 с деталями
        if (error.response.status === 500) {
          console.log('  Причина может быть в двойных префиксах /api в URL');
          console.log('  Проверьте настройку базовых URL в:');
          console.log('   - src/utils/axios.ts');
          console.log('   - src/utils/directApi.js');
          console.log('   - src/utils/minimalApiClient.ts');
        }
      }
      errorCount++;
    }
    
    console.log('-'.repeat(60));
  }
  
  // Итоговая статистика
  console.log(`\nРезультаты проверки:`);
  console.log(`✅ Успешно: ${successCount} из ${testEndpoints.length}`);
  console.log(`❌ Ошибок: ${errorCount} из ${testEndpoints.length}`);
  
  // Рекомендации при наличии ошибок
  if (errorCount > 0) {
    console.log('\nРекомендации для исправления ошибок:');
    console.log('1. Проверьте настройку baseURL в файлах конфигурации API:');
    console.log('   - src/utils/axios.ts');
    console.log('   - src/utils/directApi.js');
    console.log('   - src/utils/minimalApiClient.ts');
    console.log('\n2. Если baseURL уже содержит префикс /api, убедитесь что пути в запросах не дублируют его.');
    console.log('   Например, если baseURL="http://127.0.0.1:8000/api", запросы должны быть к "/v2/service-points", а не к "/api/v2/service-points".');
    console.log('\n3. Если baseURL не содержит префикс /api, добавьте его к путям в запросах.');
    console.log('   Например, если baseURL="http://127.0.0.1:8000", запросы должны быть к "/api/v2/service-points".');
  }
  
  return { success: successCount, errors: errorCount };
}

// Запуск проверок
checkApiEndpoints()
  .then(result => {
    if (result.errors === 0) {
      console.log('\n✅ Все тесты API прошли успешно!');
    } else {
      console.log(`\n⚠️ Обнаружены проблемы: ${result.errors} ошибок из ${result.errors + result.success} тестов.`);
    }
  })
  .catch(err => {
    console.error('Ошибка при выполнении проверок API:', err);
  });
