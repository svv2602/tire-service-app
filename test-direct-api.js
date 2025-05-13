const axios = require('axios');

async function testDirectAPI() {
  console.log('Тестирование прямого доступа к API партнеров:');
  
  // Создаем клиент axios с базовым URL для прямого доступа
  const directClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    timeout: 10000,
    headers: {
      'Accept': 'application/json'
    }
  });
  
  try {
    // Тестируем получение партнеров    console.log('\nТест 1: Получение списка партнеров...');
    const partnersResponse = await directClient.get('/api/partners');
    console.log('✅ Успешно получен список партнеров:');
    console.log(`  Статус: ${partnersResponse.status}`);
    console.log(`  Количество партнеров: ${partnersResponse.data.count || 'не указано'}`);
      // Тестируем получение точек обслуживания
    console.log('\nТест 2: Получение точек обслуживания...');
    const servicePointsResponse = await directClient.get('/api/v2/service-points');
    console.log('✅ Успешно получены точки обслуживания:');
    console.log(`  Статус: ${servicePointsResponse.status}`);
    console.log(`  Количество точек: ${servicePointsResponse.data.data?.length || 'не указано'}`);
    
  } catch (error) {
    console.error('❌ Ошибка при выполнении запросов:');
    console.error(`  Сообщение: ${error.message}`);
    if (error.response) {
      console.error(`  Статус ошибки: ${error.response.status}`);
      console.error(`  Данные ошибки: ${JSON.stringify(error.response.data)}`);
    }
  }
}

testDirectAPI().catch(console.error);
