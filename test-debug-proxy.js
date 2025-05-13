const axios = require('axios');

async function testDebugProxy() {
  console.log('Тестирование отладочного прокси на порту 3333...');
  
  try {
    console.log('\nЗапрос к API партнеров через отладочный прокси...');
    const response = await axios.get('http://localhost:3333/api/partners', {
      timeout: 10000
    });
    console.log('✅ Успешный ответ от отладочного прокси!');
    console.log(`Статус: ${response.status}`);
    console.log(`Данные: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.error('❌ Ошибка при доступе через отладочный прокси:');
    console.error(`Статус: ${error.response?.status}`);
    console.error(`Сообщение: ${error.message}`);
    if (error.response?.data) {
      console.error('Ответ:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testDebugProxy().catch(console.error);
