const axios = require('axios');

async function testPartnersAPI() {
  console.log('Тестирование API партнеров:');
  
  // Тест 1: Прямой доступ к бэкенду
  try {
    console.log('\nТест 1: Прямой доступ к бэкенду на порту 8000...');
    const response = await axios.get('http://127.0.0.1:8000/api/partners', {
      timeout: 5000
    });
    console.log('✅ Успешный ответ от бэкенда!');
    console.log(`Статус: ${response.status}`);
    console.log(`Количество партнеров: ${response.data?.count || 'нет данных'}`);
  } catch (error) {
    console.error('❌ Ошибка при прямом доступе к бэкенду:');
    console.error(`Статус: ${error.response?.status}`);
    console.error(`Сообщение: ${error.message}`);
  }
  
  // Тест 2: Доступ через прокси
  try {
    console.log('\nТест 2: Доступ через прокси на порту 3008...');
    const response = await axios.get('http://localhost:3008/api/partners', {
      timeout: 5000
    });
    console.log('✅ Успешный ответ через прокси!');
    console.log(`Статус: ${response.status}`);
    console.log(`Количество партнеров: ${response.data?.count || 'нет данных'}`);
  } catch (error) {
    console.error('❌ Ошибка при доступе через прокси:');
    console.error(`Статус: ${error.response?.status}`);
    console.error(`Сообщение: ${error.message}`);
  }
}

testPartnersAPI().catch(console.error);
