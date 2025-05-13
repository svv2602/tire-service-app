// Скрипт для тестирования API бронирований
const axios = require('axios');

// Настройки API
const API_BASE_URL = 'http://127.0.0.1:8000/api';
const PROXY_BASE_URL = 'http://localhost:3008/api';

// Функция для форматирования времени в логах
function formatTime() {
  return new Date().toLocaleTimeString();
}

// Тестирование различных способов доступа к API бронирований
async function testBookingsAPI() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║ ТЕСТИРОВАНИЕ API БРОНИРОВАНИЙ                        ║
║ ${new Date().toLocaleString()}                       
╚══════════════════════════════════════════════════════╝
`);

  // Массив для хранения результатов тестов
  const testResults = [];

  // Тест 1: Прямой доступ к API через axios
  try {
    console.log(`[${formatTime()}] Тест 1: Прямой доступ через axios к ${API_BASE_URL}/bookings`);
    const directResponse = await axios.get(`${API_BASE_URL}/bookings`);
    const bookingsData = directResponse.data?.bookings || directResponse.data?.data || directResponse.data || [];
    
    console.log(`✅ Успешно: статус ${directResponse.status}, получено ${bookingsData.length} записей`);
    testResults.push({
      test: 'Прямой доступ через axios',
      success: true,
      count: bookingsData.length,
      status: directResponse.status,
      data: bookingsData
    });
  } catch (error) {
    console.error(`❌ Ошибка при прямом доступе через axios: ${error.message}`);
    if (error.response) {
      console.error(`  Статус: ${error.response.status}`);
      console.error(`  Данные ошибки: ${JSON.stringify(error.response.data)}`);
    }
    testResults.push({
      test: 'Прямой доступ через axios',
      success: false,
      error: error.message
    });
  }

  // Тест 2: Доступ через прокси-сервер
  try {
    console.log(`[${formatTime()}] Тест 2: Доступ через прокси к ${PROXY_BASE_URL}/bookings`);
    const proxyResponse = await axios.get(`${PROXY_BASE_URL}/bookings`);
    const bookingsData = proxyResponse.data?.bookings || proxyResponse.data?.data || proxyResponse.data || [];
    
    console.log(`✅ Успешно: статус ${proxyResponse.status}, получено ${bookingsData.length} записей`);
    testResults.push({
      test: 'Доступ через прокси',
      success: true,
      count: bookingsData.length,
      status: proxyResponse.status,
      data: bookingsData
    });
  } catch (error) {
    console.error(`❌ Ошибка при доступе через прокси: ${error.message}`);
    if (error.response) {
      console.error(`  Статус: ${error.response.status}`);
      console.error(`  Данные ошибки: ${JSON.stringify(error.response.data)}`);
    }
    testResults.push({
      test: 'Доступ через прокси',
      success: false,
      error: error.message
    });
  }

  // Тест 3: Доступ с минимальными заголовками
  try {
    console.log(`[${formatTime()}] Тест 3: Доступ с минимальными заголовками к ${API_BASE_URL}/bookings`);
    
    const minimalResponse = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!minimalResponse.ok) {
      throw new Error(`HTTP error! status: ${minimalResponse.status}`);
    }
    
    const bookingsData = await minimalResponse.json();
    const bookings = bookingsData?.bookings || bookingsData?.data || bookingsData || [];
    
    console.log(`✅ Успешно: статус ${minimalResponse.status}, получено ${Array.isArray(bookings) ? bookings.length : 'не массив'} записей`);
    testResults.push({
      test: 'Доступ с минимальными заголовками',
      success: true,
      count: Array.isArray(bookings) ? bookings.length : 'не массив',
      status: minimalResponse.status,
      data: bookings
    });
  } catch (error) {
    console.error(`❌ Ошибка при доступе с минимальными заголовками: ${error.message}`);
    testResults.push({
      test: 'Доступ с минимальными заголовками',
      success: false,
      error: error.message
    });
  }

  // Тест 4: Доступ к одной конкретной записи (если в предыдущих тестах были получены записи)
  const successfulTests = testResults.filter(test => test.success && test.data && Array.isArray(test.data) && test.data.length > 0);
  
  if (successfulTests.length > 0) {
    const sampleBookingId = successfulTests[0].data[0].id;
    
    try {
      console.log(`[${formatTime()}] Тест 4: Доступ к конкретной записи ID=${sampleBookingId}`);
      const detailResponse = await axios.get(`${API_BASE_URL}/bookings/${sampleBookingId}`);
      const bookingDetail = detailResponse.data?.booking || detailResponse.data?.data || detailResponse.data || {};
      
      console.log(`✅ Успешно: статус ${detailResponse.status}, получены данные записи`);
      console.log(`  ID: ${bookingDetail.id}`);
      console.log(`  Клиент: ${bookingDetail.clientName || bookingDetail.full_name || 'Не указан'}`);
      console.log(`  Дата: ${bookingDetail.date || 'Не указана'}`);
      
      testResults.push({
        test: `Доступ к записи ID=${sampleBookingId}`,
        success: true,
        status: detailResponse.status,
        data: bookingDetail
      });
    } catch (error) {
      console.error(`❌ Ошибка при доступе к конкретной записи: ${error.message}`);
      if (error.response) {
        console.error(`  Статус: ${error.response.status}`);
        console.error(`  Данные ошибки: ${JSON.stringify(error.response.data)}`);
      }
      testResults.push({
        test: `Доступ к записи ID=${sampleBookingId}`,
        success: false,
        error: error.message
      });
    }
  }

  // Вывод общего результата тестов
  console.log('\n📋 ИТОГИ ТЕСТИРОВАНИЯ API БРОНИРОВАНИЙ:');
  testResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.test}: ${result.success ? '✅ Успешно' : '❌ Ошибка'}`);
    if (result.success) {
      console.log(`   Статус: ${result.status}, получено записей: ${result.count || 'N/A'}`);
    } else {
      console.log(`   Ошибка: ${result.error}`);
    }
  });

  // Общий итог
  const successCount = testResults.filter(r => r.success).length;
  console.log(`\n✅ Успешно: ${successCount} из ${testResults.length} тестов`);
  console.log(`${successCount === testResults.length ? '🎉 Все тесты прошли успешно!' : '⚠️ Некоторые тесты не прошли!'}`);
}

// Запускаем тестирование
testBookingsAPI().catch(error => {
  console.error('Произошла непредвиденная ошибка при тестировании:', error);
});
