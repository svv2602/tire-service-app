import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  timeout: 15000,
});

// Добавляем токен к каждому запросу если он есть
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Функция для проверки доступности сервера
export const pingServer = async (): Promise<boolean> => {
  try {
    const response = await instance.get('/api/ping');
    return response.status === 200;
  } catch (error) {
    console.error('Server ping failed:', error);
    return false;
  }
};

// Функция для прямого входа без CSRF-токена
export const loginWithoutCsrf = async (credentials: { email: string, password: string }) => {
  const response = await instance.post('/api/direct-login', credentials);
  const { token, user } = response.data;
  
  if (token) {
    localStorage.setItem('token', token);
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return { token, user };
};

// Функция для тестового логина в экстренных случаях
export const testLogin = async (credentials: { email: string, password: string }) => {
  const response = await instance.post('/api/test-login', credentials);
  const { token, user } = response.data;
  
  if (token) {
    localStorage.setItem('token', token);
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return { token, user };
};

// Функция для "супер-прямого" входа
export const superDirectLogin = async (credentials: { email: string, password: string }) => {
  const response = await instance.post('/api/super-direct-login', credentials);
  const { token, user } = response.data;
  
  if (token) {
    localStorage.setItem('token', token);
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return { token, user };
};

// Получение CSRF-токена для стандартной аутентификации
export const getCsrfToken = async (): Promise<string> => {
  const response = await instance.get('/sanctum/csrf-cookie');
  return response.data.csrfToken || '';
};

export default instance;