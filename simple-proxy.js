const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3334;

// Простой прокси без сторонних библиотек
app.use('/api/*', async (req, res) => {
  console.log(`Получен запрос: ${req.method} ${req.url}`);
  
  const targetUrl = `http://127.0.0.1:8000${req.url}`;
  console.log(`Проксируем на: ${targetUrl}`);
  
  try {
    // Простой запрос через axios на бэкенд
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        'Accept': 'application/json',
        ...req.headers.authorization && { 'Authorization': req.headers.authorization }
      },
      data: req.body,
      timeout: 30000
    });
    
    // Пересылаем ответ обратно клиенту
    console.log(`Успешный ответ: ${response.status}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error.message);
    
    if (error.response) {
      // Если есть ответ от сервера, возвращаем его статус и данные
      console.error(`Ошибка API: ${error.response.status}`);
      res.status(error.response.status).json(error.response.data);
    } else {
      // Если нет ответа, возвращаем 502 Bad Gateway
      console.error('Нет ответа от сервера');
      res.status(502).json({ 
        error: 'Bad Gateway',
        message: error.message
      });
    }
  }
});

// Запускаем простой прокси
app.listen(PORT, () => {
  console.log(`Простой прокси запущен на порту ${PORT}`);
  console.log(`Попробуйте: http://localhost:${PORT}/api/partners`);
});
