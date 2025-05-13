/**
 * Простой тест для проверки доступности API
 */
 
const axios = require('axios');

// Базовый URL для API
const API_URL = 'http://127.0.0.1:8000/api';

async function checkApiAvailability() {
  try {
    console.log(`Проверка доступности API по адресу: ${API_URL}`);
    const response = await axios.get(`${API_URL}/v2/service-points`);
    
    if (response.status === 200) {
      const data = response.data?.data || response.data;
      const count = Array.isArray(data) ? data.length : 'нет данных';
      
      console.log('✅ API доступен!');
      console.log(`Получено точек обслуживания: ${count}`);
      return true;
    } else {
      console.log(`❌ API вернул неожиданный статус: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке API:', error.message);
    if (error.response) {
      console.error(`Статус: ${error.response.status}`);
      console.error('Детали ошибки:', error.response.data);
    }
    return false;
  }
}

// Запуск проверки
checkApiAvailability()
  .then(isAvailable => {
    console.log(`\nРезультат проверки API: ${isAvailable ? 'УСПЕХ' : 'ОШИБКА'}`);
  })
  .catch(err => {
    console.error('Произошла непредвиденная ошибка:', err);
  });
