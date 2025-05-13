// Проверка работоспособности API сервера
const axios = require('axios');

async function checkBackendServer() {
  console.log('Проверка доступности API сервера...');
  
  // Проверяем API на порту 8000 различными методами
  try {
    console.log('Метод 1: Проверка прямого доступа к API на порту 8000...');
    const response = await axios.get('http://localhost:8000/api/v2/service-points', {
      timeout: 5000
    });
    
    console.log('✅ API сервер доступен напрямую!');
    console.log('Статус:', response.status);
    console.log('Ответ:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Ошибка при прямом подключении к API серверу:');
    console.error('Код ошибки:', error.code);
    console.error('Сообщение:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 API сервер не запущен или недоступен на порту 8000!');
      console.error('Запустите сервер Laravel командой: php artisan serve --port=8000');
    }
    
    return false;
  }
}

// Запускаем проверку
checkBackendServer();
