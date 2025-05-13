/**
 * Ultra-minimal fetch utility with absolutely minimal headers as a fallback
 * when even minimalApiClient fails due to header size issues
 */

// Используем прямой URL для доступа к API
const USE_DIRECT_API = true; // Установите в true для прямого доступа к API
const DIRECT_API_URL = 'http://127.0.0.1:8000/api'; // URL бэкенда для прямого доступа

/**
 * Performs a GET request with ultra-minimal headers
 */
export const simpleFetch = async <T>(url: string): Promise<T> => {
  // В зависимости от режима используем разные варианты URL
  let apiUrl;
  if (USE_DIRECT_API) {
    // Прямой доступ: формируем полный URL к бэкенду
    apiUrl = url.startsWith('/api') 
      ? DIRECT_API_URL + url.substring(4) // Убираем начальный /api
      : DIRECT_API_URL + (url.startsWith('/') ? url : '/' + url);
  } else {
    // Через прокси: нормализуем URL, добавляя '/api' если путь не начинается с него
    apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
  }
  
  const token = localStorage.getItem('token');
  
  // Only include authorization to minimize header size
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
    
  console.log(`Making ultra-minimal GET request to ${apiUrl} ${USE_DIRECT_API ? '(direct mode)' : '(proxy mode)'}`);
  
  // Устанавливаем таймаут для fetch с помощью AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд таймаут
  
  try {    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      credentials: USE_DIRECT_API ? 'same-origin' : 'omit', // Адаптируем в зависимости от режима
      cache: 'no-store', // Don't use cache headers
      mode: USE_DIRECT_API ? 'cors' : 'same-origin', // Для прямого доступа разрешаем CORS
      signal: controller.signal
    });
    
    // Очищаем таймаут после получения ответа
    clearTimeout(timeoutId);
      if (!response.ok) {
      if (response.status === 431) {
        console.error(`431 Error: Headers still too large for ${url} using simpleFetch`);
        console.debug('Headers used:', headers);
      }
      if (response.status === 504) {
        console.error(`504 Gateway Timeout for ${url} - backend server is not responding in time`);
      }
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return response.json();
  } catch (error: any) {
    // Проверяем, была ли ошибка вызвана таймаутом
    if (error.name === 'AbortError') {
      console.error(`Request timeout for ${url} after 60s`);
      throw new Error(`API timeout: Request took too long to respond`);
    }
    
    throw error;
  }
};

/**
 * Performs a POST request with ultra-minimal headers
 */
export const simplePost = async <T>(url: string, data: any): Promise<T> => {
  // В зависимости от режима используем разные варианты URL
  let apiUrl;
  if (USE_DIRECT_API) {
    // Прямой доступ: формируем полный URL к бэкенду
    apiUrl = url.startsWith('/api') 
      ? DIRECT_API_URL + url.substring(4) // Убираем начальный /api
      : DIRECT_API_URL + (url.startsWith('/') ? url : '/' + url);
  } else {
    // Через прокси: нормализуем URL, добавляя '/api' если путь не начинается с него
    apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
  }
  
  const token = localStorage.getItem('token');
  
  // Only include necessary headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`Making ultra-minimal POST request to ${apiUrl} ${USE_DIRECT_API ? '(direct mode)' : '(proxy mode)'}`);
  
  // Устанавливаем таймаут для fetch с помощью AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд таймаут
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      credentials: USE_DIRECT_API ? 'same-origin' : 'omit',
      cache: 'no-store', // Don't use cache headers
      mode: USE_DIRECT_API ? 'cors' : 'same-origin',
      signal: controller.signal
    });
    if (!response.ok) {
    if (response.status === 431) {
      console.error(`431 Error: Headers still too large for ${apiUrl} using simplePost`);
      console.debug('Headers used:', headers);
      console.debug('Body size:', JSON.stringify(data).length);
    }
    if (response.status === 504) {
      console.error(`504 Gateway Timeout for ${apiUrl} - backend server is not responding in time`);
    }
    throw new Error(`Request failed with status ${response.status}`);
  }
  
  // Очищаем таймаут после получения ответа
  clearTimeout(timeoutId);
  return response.json();
  } catch (error: any) {
    // Проверяем, была ли ошибка вызвана таймаутом
    if (error.name === 'AbortError') {
      console.error(`Request timeout for ${apiUrl} after 60s`);
      throw new Error(`API timeout: Request took too long to respond`);
    }
    
    throw error;
  }
};

/**
 * Performs a PUT request with ultra-minimal headers
 */
export const simplePut = async <T>(url: string, data: any): Promise<T> => {
  // В зависимости от режима используем разные варианты URL
  let apiUrl;
  if (USE_DIRECT_API) {
    // Прямой доступ: формируем полный URL к бэкенду
    apiUrl = url.startsWith('/api') 
      ? DIRECT_API_URL + url.substring(4) // Убираем начальный /api
      : DIRECT_API_URL + (url.startsWith('/') ? url : '/' + url);
  } else {
    // Через прокси: нормализуем URL, добавляя '/api' если путь не начинается с него
    apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
  }

  const token = localStorage.getItem('token');
  
  // Only include necessary headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`Making ultra-minimal PUT request to ${apiUrl} ${USE_DIRECT_API ? '(direct mode)' : '(proxy mode)'}`);
  
  // Устанавливаем таймаут для fetch с помощью AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд таймаут
  
  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      credentials: USE_DIRECT_API ? 'same-origin' : 'omit',
      cache: 'no-store', // Don't use cache headers
      mode: USE_DIRECT_API ? 'cors' : 'same-origin',
      signal: controller.signal
    });
    
    if (!response.ok) {
      if (response.status === 431) {
        console.error(`431 Error: Headers still too large for ${apiUrl} using simplePut`);
        console.debug('Headers used:', headers);
        console.debug('Body size:', JSON.stringify(data).length);
      }
      if (response.status === 504) {
        console.error(`504 Gateway Timeout for ${apiUrl} - backend server is not responding in time`);
      }
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    // Очищаем таймаут после получения ответа
    clearTimeout(timeoutId);
    return response.json();
  } catch (error: any) {
    // Проверяем, была ли ошибка вызвана таймаутом
    if (error.name === 'AbortError') {
      console.error(`Request timeout for ${apiUrl} after 60s`);
      throw new Error(`API timeout: Request took too long to respond`);
    }
    
    throw error;
  }
};

/**
 * Performs a DELETE request with ultra-minimal headers
 */
export const simpleDelete = async <T>(url: string): Promise<T> => {
  // В зависимости от режима используем разные варианты URL
  let apiUrl;
  if (USE_DIRECT_API) {
    // Прямой доступ: формируем полный URL к бэкенду
    apiUrl = url.startsWith('/api') 
      ? DIRECT_API_URL + url.substring(4) // Убираем начальный /api
      : DIRECT_API_URL + (url.startsWith('/') ? url : '/' + url);
  } else {
    // Через прокси: нормализуем URL, добавляя '/api' если путь не начинается с него
    apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
  }

  const token = localStorage.getItem('token');
  
  // Only include necessary headers
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`Making ultra-minimal DELETE request to ${apiUrl} ${USE_DIRECT_API ? '(direct mode)' : '(proxy mode)'}`);
  
  // Устанавливаем таймаут для fetch с помощью AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд таймаут
  
  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers,
      credentials: USE_DIRECT_API ? 'same-origin' : 'omit',
      cache: 'no-store', // Don't use cache headers
      mode: USE_DIRECT_API ? 'cors' : 'same-origin',
      signal: controller.signal
    });
    
    if (!response.ok) {
      if (response.status === 431) {
        console.error(`431 Error: Headers still too large for ${apiUrl} using simpleDelete`);
        console.debug('Headers used:', headers);
      }
      if (response.status === 504) {
        console.error(`504 Gateway Timeout for ${apiUrl} - backend server is not responding in time`);
      }
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    // Очищаем таймаут после получения ответа
    clearTimeout(timeoutId);
    return response.json();
  } catch (error: any) {
    // Проверяем, была ли ошибка вызвана таймаутом
    if (error.name === 'AbortError') {
      console.error(`Request timeout for ${apiUrl} after 60s`);
      throw new Error(`API timeout: Request took too long to respond`);
    }
    
    throw error;
  }
};

const simpleFetchUtils = { simpleFetch, simplePost, simplePut, simpleDelete };
export default simpleFetchUtils;