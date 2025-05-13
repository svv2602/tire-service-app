/**
 * Прямой клиент API без использования прокси
 */
import axios from 'axios';

// Настраиваем базовый URL для прямого доступа к API
const API_BASE_URL = 'http://127.0.0.1:8000';

const directApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000,
});

// Добавляем токен к запросам
directApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Обработчик ошибок
directApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('DirectAPI Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default directApiClient;
