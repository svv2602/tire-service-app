/**
 * Расширенный тест API для проверки всех методов работы с партнерами
 */
const axios = require('axios');

// Настройки API
const API_BASE_URL = 'http://127.0.0.1:8000/api';
const PROXY_BASE_URL = 'http://localhost:3008/api';

// Флаг для выбора между прямым доступом и прокси
const USE_DIRECT_API = true;
const BASE_URL = USE_DIRECT_API ? API_BASE_URL : PROXY_BASE_URL;

// Вспомогательная функция для форматирования времени
function formatTime() {
  return new Date().toLocaleTimeString();
}

// Создаем клиент axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Добавляем логирование запросов
apiClient.interceptors.request.use(
  config => {
    console.log(`[${formatTime()}] 🔄 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error(`[${formatTime()}] ❌ Request Error:`, error.message);
    return Promise.reject(error);
  }
);

// Добавляем логирование ответов
apiClient.interceptors.response.use(
  response => {
    console.log(`[${formatTime()}] ✅ ${response.status} ${response.statusText}`);
    if (response.data && typeof response.data === 'object') {
      console.log(`Response data sample:`, JSON.stringify(response.data).substring(0, 100) + '...');
    }
    return response;
  },
  error => {
    console.error(`[${formatTime()}] ❌ Response Error:`, 
      error.response 
        ? `${error.response.status} ${error.response.statusText}`
        : error.message
    );
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
    }
    return Promise.reject(error);
  }
);

async function runAPITests() {
  console.log(`
╔══════════════════════════════════════════════╗
║ КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ API ПАРТНЕРОВ       ║
║ Режим: ${USE_DIRECT_API ? 'ПРЯМОЙ ДОСТУП' : 'ЧЕРЕЗ ПРОКСИ'}                    ║
║ URL: ${BASE_URL}       ║
╚══════════════════════════════════════════════╝
`);

  try {
    // Тест 1: Получение списка партнеров    console.log('\n📋 ТЕСТ 1: Получение списка партнеров');
    const partnersResponse = await apiClient.get('/api/partners');
    const partners = partnersResponse.data.partners || partnersResponse.data;
    console.log(`✅ Получено ${partners.length} партнеров`);

    // Проверяем наличие партнеров для дальнейших тестов
    if (partners.length === 0) {
      console.log('⚠️ Нет партнеров для тестирования. Создаем тестового партнера...');
      
      // Тест 2: Создание тестового партнера
      console.log('\n📋 ТЕСТ 2: Создание тестового партнера');
      const newPartner = {
        name: 'API Test Partner',
        email: `test-partner-${Date.now()}@test.com`,
        phone: '+7999' + Math.floor(1000000 + Math.random() * 9000000),
        companyName: 'API Test Company',
        address: 'Test Address',
        status: 'active'
      };      
      const createResponse = await apiClient.post('/api/partners', newPartner);
      const createdPartner = createResponse.data.partner || createResponse.data;
      console.log(`✅ Создан тестовый партнер с ID: ${createdPartner.id}`);
      
      // Используем созданного партнера для следующих тестов
      const testPartnerId = createdPartner.id;
      
      // Тест 3: Обновление партнера
      console.log('\n📋 ТЕСТ 3: Обновление партнера');
      const updateData = {
        companyName: 'Updated Company Name',
        status: 'inactive'
      };      
      const updateResponse = await apiClient.put(`/api/partners/${testPartnerId}`, updateData);
      const updatedPartner = updateResponse.data.partner || updateResponse.data;
      console.log(`✅ Партнер обновлен: ${updatedPartner.companyName}, статус: ${updatedPartner.status}`);
      
      // Тест 4: Удаление партнера
      console.log('\n📋 ТЕСТ 4: Удаление тестового партнера');
      await apiClient.delete(`/api/partners/${testPartnerId}`);
      console.log(`✅ Партнер с ID ${testPartnerId} успешно удален`);
    }
    else {
      // Если есть партнеры, используем первого для тестов
      const testPartnerId = partners[0].id;
        // Тест 2: Получение конкретного партнера
      console.log(`\n📋 ТЕСТ 2: Получение партнера с ID ${testPartnerId}`);
      const partnerResponse = await apiClient.get(`/api/partners/${testPartnerId}`);
      const partner = partnerResponse.data.partner || partnerResponse.data;
      console.log(`✅ Получен партнер: ${partner.name}, компания: ${partner.companyName || partner.company_name || 'Не указана'}`);
      
      // Тест 3: Обновление статуса партнера
      console.log('\n📋 ТЕСТ 3: Обновление статуса партнера');
      const newStatus = partner.status === 'active' ? 'inactive' : 'active';
      const updateResponse = await apiClient.patch(`/api/partners/${testPartnerId}`, { status: newStatus });
      const updatedPartner = updateResponse.data.partner || updateResponse.data;
      console.log(`✅ Статус обновлен на: ${updatedPartner.status}`);
      
      // Возвращаем исходный статус
      await apiClient.patch(`/api/partners/${testPartnerId}`, { status: partner.status });
      console.log(`✅ Статус возвращен на исходный: ${partner.status}`);
    }
    
    // Тест 5: Проверка других связанных API
    console.log('\n📋 ТЕСТ 5: Проверка других API');
    
    console.log('  - Проверка API точек обслуживания');
    const servicePointsResponse = await apiClient.get('/v2/service-points');
    console.log(`✅ Точки обслуживания получены: ${servicePointsResponse.data.data?.length || 0} шт.`);
    
    console.log('\nℹ️ ВСЕ ТЕСТЫ УСПЕШНО ВЫПОЛНЕНЫ');
  } catch (error) {
    console.error('\n❌ ОШИБКА ПРИ ВЫПОЛНЕНИИ ТЕСТОВ:');
    console.error(error);
  }
}

// Запускаем тесты
runAPITests().catch(console.error);
