/**
 * Тестирование API работы с временными слотами
 */

const axios = require('axios');
const format = require('date-fns/format');

// Базовый URL API
const API_BASE_URL = 'http://127.0.0.1:8000';

// Создаем экземпляр axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Функция для получения текущей даты в формате YYYY-MM-DD
const getTodayDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

// Функция для тестирования всех возможных URL
async function testTimeSlotEndpoints() {
  console.log('Тестирование API временных слотов...\n');
  console.log(`Базовый URL: ${API_BASE_URL}`);
  console.log('-'.repeat(60));
  
  const servicePointId = 1; // ID сервисной точки для тестирования
  const date = getTodayDate();
  
  const endpointsToTest = [
    {
      url: `/api/service-points/${servicePointId}/available-slots/${date}`,
      description: 'Слоты без префикса v2, путь через URL'
    },
    {
      url: `/api/v2/service-points/${servicePointId}/available-slots/${date}`,
      description: 'Слоты с префиксом v2, путь через URL'
    },
    {
      url: `/api/service-points/${servicePointId}/available-time-slots?date=${date}`,
      description: 'Слоты без префикса v2, путь через query параметр'
    },
    {
      url: `/api/v2/service-points/${servicePointId}/available-time-slots?date=${date}`,
      description: 'Слоты с префиксом v2, путь через query параметр'
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpointsToTest) {
    try {
      console.log(`Проверка: ${endpoint.description}`);
      console.log(`URL: ${endpoint.url}`);
      
      const response = await apiClient.get(endpoint.url);
      
      console.log(`✅ Успех! Статус: ${response.status}`);
      console.log(`Данные:`, JSON.stringify(response.data).substring(0, 100) + '...');
      
      results.push({
        endpoint: endpoint.url,
        status: 'success',
        responseStatus: response.status,
        data: response.data
      });
    } catch (error) {
      console.error(`❌ Ошибка! Статус: ${error.response?.status || 'Нет соединения'}`);
      console.error(`Сообщение: ${error.message}`);
      
      results.push({
        endpoint: endpoint.url,
        status: 'error',
        errorStatus: error.response?.status,
        errorMessage: error.message
      });
    }
    
    console.log('-'.repeat(60));
  }
  
  // Вывод общего результата
  console.log('\nИтоговый результат:');
  console.log('='.repeat(60));
  
  const successCount = results.filter(r => r.status === 'success').length;
  
  console.log(`Успешных запросов: ${successCount} из ${results.length}`);
  
  if (successCount === 0) {
    console.log('\n⚠️ Все запросы к API временных слотов завершились с ошибкой!');
    console.log('Рекомендуется проверить работу сервера и правильность маршрутов.');
  } else {
    console.log('\n✅ Найден хотя бы один рабочий API-маршрут для временных слотов.');
    
    // Вывод первого успешного маршрута
    const firstSuccess = results.find(r => r.status === 'success');
    console.log(`Рабочий маршрут: ${firstSuccess.endpoint}`);
    console.log(`Пример данных:`, JSON.stringify(firstSuccess.data).substring(0, 200) + '...');
  }
}

// Запуск тестирования
testTimeSlotEndpoints();
