/**
 * Extremely minimal API client with bare minimum headers to avoid 431 errors
 */

// Используем прямой URL для доступа к API
// В случае ошибок с прокси используем прямой доступ к бэкенду
const USE_DIRECT_API = true; // Установите в true для прямого доступа
const API_BASE_URL = USE_DIRECT_API 
  ? 'http://127.0.0.1:8000' // Прямой доступ без префикса /api
  : ''; // Через прокси (стандартный вариант)

export type ApiResponse<T> = {
  data?: T;
  status: 'success' | 'error';
  message?: string;
};

/**
 * Make a GET request with minimal headers
 */
export async function get<T>(endpoint: string): Promise<T> {
  // Добавляем префикс /api к эндпоинту, если его нет
  // Но проверяем, чтобы не использовать устаревший путь /api/v2/services
  let apiEndpoint = endpoint.startsWith('/api/') 
    ? endpoint 
    : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
  // Коррекция для особых случаев API
  if (apiEndpoint === '/api/v2/services') {
    apiEndpoint = '/api/services'; // Исправляем неверный путь
    console.log('Correcting path from /api/v2/services to /api/services');
  }
    
  const url = apiEndpoint.startsWith('/') 
    ? `${API_BASE_URL}${apiEndpoint}` 
    : `${API_BASE_URL}/${apiEndpoint}`;
  
  // Use truly minimal headers - only authorization if available
  // Remove any other headers that might contribute to the 431 error
  const headers: HeadersInit = {};
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    console.log(`Making minimal GET request to ${url} ${USE_DIRECT_API ? '(direct mode)' : '(proxy mode)'}`);
    
    // Устанавливаем таймаут для fetch с помощью AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд таймаут
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: USE_DIRECT_API ? 'same-origin' : 'omit', // Для прямого доступа разрешаем same-origin
      signal: controller.signal,
      // Для прямого доступа явно разрешаем CORS
      mode: USE_DIRECT_API ? 'cors' : 'same-origin'
    });
    
    // Очищаем таймаут после получения ответа
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 431) {
        console.error(`431 Error: Header fields too large for ${url}`);
        console.debug('Headers used:', headers);
      }
      if (response.status === 504) {
        console.error(`504 Gateway Timeout for ${url} - backend server is not responding`);
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different API response formats
    if (data && data.data) {
      return data.data as T;
    } else if (data && Array.isArray(data)) {
      return data as unknown as T;
    }
    
    return data as T;  } catch (error: any) {
    // Проверяем, была ли ошибка вызвана таймаутом
    if (error.name === 'AbortError') {
      console.error(`Request timeout for ${url} after 60s`);
      throw new Error(`API timeout: Request to ${url} took too long to respond`);
    }
    
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

/**
 * Make a POST request with minimal headers
 */
export async function post<T>(endpoint: string, body: any): Promise<T> {
  // Добавляем префикс /api к эндпоинту, если его нет
  const apiEndpoint = endpoint.startsWith('/api/') 
    ? endpoint 
    : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
  const url = apiEndpoint.startsWith('/') 
    ? `${API_BASE_URL}${apiEndpoint}` 
    : `${API_BASE_URL}/${apiEndpoint}`;
  
  // Use minimal headers - only content type and token if available
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'omit' // Don't send cookies to further reduce header size
    });
    
    if (!response.ok) {
      if (response.status === 431) {
        console.error(`431 Error: Header fields too large for ${url}`);
        console.debug('Headers used:', headers);
        console.debug('Body size:', JSON.stringify(body).length);
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different API response formats
    if (data && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error(`Error posting to ${url}:`, error);
    throw error;
  }
}

/**
 * Make a PUT request with minimal headers
 */
export async function put<T>(endpoint: string, body: any): Promise<T> {
  // Добавляем префикс /api к эндпоинту, если его нет
  const apiEndpoint = endpoint.startsWith('/api/') 
    ? endpoint 
    : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
  const url = apiEndpoint.startsWith('/') 
    ? `${API_BASE_URL}${apiEndpoint}` 
    : `${API_BASE_URL}/${apiEndpoint}`;
  
  // Use minimal headers - only content type and token if available
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different API response formats
    if (data && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error(`Error putting to ${url}:`, error);
    throw error;
  }
}

/**
 * Make a DELETE request with minimal headers
 */
export async function del<T>(endpoint: string): Promise<T> {
  const url = endpoint.startsWith('/') 
    ? `${API_BASE_URL}${endpoint}` 
    : `${API_BASE_URL}/${endpoint}`;
  
  // Use minimal headers - only a token if available
  const headers: HeadersInit = {};
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different API response formats
    if (data && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error(`Error deleting ${url}:`, error);
    throw error;
  }
}

// Export as a complete API client object
const minimalApiClient = {
  get,
  post,
  put,
  delete: del
};

export default minimalApiClient; 