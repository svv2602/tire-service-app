# Исправление ошибки редактирования торговой точки

## Описание проблемы

При попытке отредактировать торговую точку (service point) в административном интерфейсе появляется сообщение об ошибке: "Не удалось обновить торговую точку. Проверьте введенные данные и попробуйте еще раз".

## Причина проблемы

Проблема возникает из-за:

1. Отсутствия специализированной функции API для работы с торговыми точками в файле `api.js`
2. Неправильной сериализации данных (особенно полей `working_hours` и `service_comments`) при отправке на сервер
3. Несогласованности форматов данных между frontend и backend
4. Ошибок типизации в TypeScript - в интерфейсе `ServicePoint` отсутствуют необходимые поля

## Исправление проблемы

Следующие изменения необходимо внести в код:

### 1. Обновить файл `web-frontend/src/services/api.ts`

```typescript
// НОВЫЙ МЕТОД: Обновление торговой точки
const updateServicePoint = async (id: number, data: Partial<ServicePoint>): Promise<ServicePoint> => {
  try {
    console.log('API service: Обновление торговой точки', id);
    console.log('API service: Данные для обновления:', JSON.stringify(data, null, 2));
    
    // Обрабатываем service_comments и working_hours как особые поля
    const payload: Record<string, any> = { ...data };
    
    // Преобразуем service_comments в JSON если это массив
    if (payload.service_comments && Array.isArray(payload.service_comments)) {
      payload.service_comments = JSON.stringify(payload.service_comments);
      console.log('API service: service_comments преобразованы в JSON');
    }
    
    // Преобразуем working_hours в JSON если это объект
    if (payload.working_hours && typeof payload.working_hours === 'object') {
      payload.working_hours = JSON.stringify(payload.working_hours);
      console.log('API service: working_hours преобразованы в JSON');
    }
    
    // Преобразуем service_posts в JSON если это массив
    if (payload.service_posts && Array.isArray(payload.service_posts)) {
      payload.service_posts = JSON.stringify(payload.service_posts);
      console.log('API service: service_posts преобразованы в JSON');
    }
    
    // Если есть service_comments, но нет services, создаем services из service_comments
    if (payload.service_comments && !payload.services) {
      try {
        const serviceComments = JSON.parse(payload.service_comments);
        payload.services = serviceComments.map((sc: any) => sc.service_id);
        console.log('API service: services созданы из service_comments:', payload.services);
      } catch (e) {
        console.error('API service: Ошибка при парсинге service_comments', e);
      }
    }
    
    // Попытка 1: Стандартный PUT запрос
    try {
      console.log('API service: PUT запрос на /api/v2/service-points/' + id);
      const response = await axios.put(`/api/v2/service-points/${id}`, payload);
      console.log('API service: Успешный PUT запрос, ответ:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('API service: Ошибка PUT запроса:', error);
      console.error('API service: Детали ошибки:', error.response?.data);
      
      // Попытка 2: POST с _method=PUT (Laravel)
      try {
        console.log('API service: POST запрос с _method=PUT');
        const postResponse = await axios.post(`/api/v2/service-points/${id}`, {
          ...payload,
          _method: 'PUT'
        });
        console.log('API service: Успешный POST запрос, ответ:', postResponse.data);
        return postResponse.data.data || postResponse.data;
      } catch (postError: any) {
        console.error('API service: Ошибка POST запроса:', postError);
        throw postError;
      }
    }
  } catch (error: any) {
    console.error('API service: Критическая ошибка при обновлении торговой точки:', error);
    throw new Error(`Не удалось обновить торговую точку: ${error.message}`);
  }
};

// Добавьте функцию в список экспорта
export {
  // ...другие экспорты
  updateServicePoint,
  // ...другие экспорты
};
```

### 2. Обновить файл `web-frontend/src/services/api.js`

```javascript
// Добавьте экспорт новой функции
export const updateServicePoint = apiExports.updateServicePoint;
```

### 3. Обновить файл `web-frontend/src/types/index.ts`

```typescript
export interface ServicePoint {
  id: number;
  name: string;
  address: string;
  region?: string;
  city?: string;
  working_hours: WorkingHours;
  lat: number;
  lng: number;
  partner_id: number;
  total_posts?: number;
  status: string;
  num_posts: number;
  description?: string;
  contact_info?: string;
  notes?: string;
  service_time_grid?: string;
  price_list_path?: string;
  services?: Array<number | { id: number; name: string }>;
  service_comments?: ServiceWithComment[];
  service_posts?: ServicePost[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ServiceWithComment {
  service_id: number;
  comment?: string;
}

export interface ServicePost {
  id?: number;
  name: string;
  service_time_minutes: number;
}
```

### 4. Обновить файл `web-frontend/src/store/slices/servicePointsSlice.ts`

```typescript
// В начале файла добавьте импорт
import { updateServicePoint as apiUpdateServicePoint } from '../../services/api';

// Обновите функцию updateServicePoint
export const updateServicePoint = createAsyncThunk(
  'servicePoints/update',
  async ({ id, data }: { id: number; data: Partial<ServicePoint> }, { rejectWithValue }) => {
    try {
      console.log('Original update data:', data);
      console.log('Original update service_comments:', data.service_comments);
      console.log('Original update services:', data.services);
      
      // Create a deep copy of data to avoid mutating the original object
      const updateData = JSON.parse(JSON.stringify(data));
      
      // Special handling for working_hours - не конвертируем в JSON строку здесь
      if (updateData.working_hours !== undefined) {
        // Make sure all required days are present
        const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const workingHours = typeof updateData.working_hours === 'string' 
          ? JSON.parse(updateData.working_hours)
          : updateData.working_hours;
          
        // Make sure we have all days of the week represented and normalize values
        requiredDays.forEach(day => {
          // If the day is missing or null, set it to 'closed'
          if (!workingHours[day]) {
            workingHours[day] = 'closed';
          }
          
          // Ensure 'выходной' is converted to 'closed' for the backend
          if (workingHours[day] === 'выходной') {
            workingHours[day] = 'closed';
          }
          
          // If the value isn't a string or valid object, convert to string
          const value = workingHours[day];
          if (typeof value !== 'string' && (!value || typeof value !== 'object')) {
            workingHours[day] = 'closed';
          }
        });
        
        // Not converting to JSON string here, our new API function will handle that
        updateData.working_hours = workingHours;
      }
      
      // Основная часть функции...
      console.log('Using our new API function for updating service point');
      console.log('Final request payload:', updateData);
      
      // Используем нашу новую API функцию напрямую, вместо axios.put
      const responseData = await apiUpdateServicePoint(id, updateData);
      
      // Process the response...
      
      return responseData;
    } catch (error: any) {
      console.error('Error updating service point:', error);
      return rejectWithValue(error.message || 'Failed to update service point');
    }
  }
);
```

## Исправление ошибок компиляции TypeScript

Если вы сталкиваетесь с ошибками типизации при компиляции проекта, необходимо также использовать приведение типов в местах, где TypeScript не распознает поля `service_comments` и `service_posts`:

```typescript
// Пример использования приведения типов в slices/servicePointsSlice.ts
if ((responseData as any).service_comments && typeof (responseData as any).service_comments === 'string') {
  try {
    (responseData as any).service_comments = JSON.parse((responseData as any).service_comments);
  } catch (e) {
    console.error('Failed to parse service_comments JSON in response', e);
    (responseData as any).service_comments = [];
  }
}
```

```typescript
// Пример использования приведения типов в Pages/ServicePointsPage.tsx
console.log('Result service_comments:', (result as any).service_comments);
```

## Тестирование исправления

После внесения изменений необходимо проверить:

1. Создание новой торговой точки с услугами
2. Редактирование существующей торговой точки:
   - Изменение статуса (активна/неактивна)
   - Изменение рабочих часов
   - Изменение списка услуг
   - Изменение основной информации (название, адрес и т.д.)

## Дополнительная отладка

Если проблема сохраняется, проверьте консоль браузера на наличие ошибок при отправке запроса. Если видите ошибку 400, проверьте, что все обязательные поля корректно заполнены. Если видите ошибку 500, проверьте серверные логи на предмет деталей ошибки. 

# Service Points Status Fix

## Overview

This update addresses issues with service point status management in the application. The core problem was that there were two competing fields controlling service point status:
1. `is_active` - a boolean field (true/false)
2. `status` - a string field with values like 'active', 'suspended', 'closed' 

This inconsistency caused problems with service point display, filtering, and status updates.

## Solution

We've implemented a comprehensive solution that:

1. **Standardizes on `status` as the primary field** with three possible values:
   - `active`: Point is operational and serving customers
   - `suspended`: Point is temporarily not accepting bookings
   - `closed`: Point is permanently closed/inactive

2. **Always sets `is_active = true`** for all service points, regardless of status
   - This field is now deprecated but kept for backward compatibility
   - All code has been updated to ensure this field is always set to true
   - The actual operating state is determined solely by the `status` field

3. **Normalizes status values** to ensure consistency:
   - Added support for multiple formats (English, Russian, numeric)
   - All values are normalized to 'active', 'suspended', or 'closed'

## Specific Changes

1. **In Redux Store (servicePointsSlice.ts)**:
   - Updated status mapping to support English, Russian, and numeric values
   - Modified all API calls to always set `is_active = true`
   - Added extensive logging and error handling for status updates
   - Removed parameters that filtered based on `is_active`

2. **In UI Components (ServicePointsPage.tsx)**:
   - Updated status handling in forms and tables
   - Modified file upload process to ensure `is_active = true` is preserved
   - Enhanced direct API updates for better status reliability
   - Added verification steps after status changes
   - Updated debug panel to focus on status field

3. **In Type Definitions (types/index.ts)**:
   - Updated `ServicePoint` interface with clear documentation
   - Added comments marking `is_active` as deprecated
   - Enhanced `ServicePointStatus` type with detailed comments

4. **New Diagnostic Tools**:
   - Updated `status-checker.js` to test and verify status changes
   - Created `fix-service-points.js` to scan and fix problematic database entries
   - Added batch files for easy execution of fixes

## How to Fix Existing Data

1. Run the data checker to identify issues:
   ```
   ./fix-service-points.sh check
   ```
   or on Windows:
   ```
   fix-service-points.bat check
   ```

2. Apply fixes to the database:
   ```
   ./fix-service-points.sh fix
   ```
   or on Windows:
   ```
   fix-service-points.bat fix
   ```

This will:
- Scan all service points
- Normalize status values
- Set `is_active = true` for all points
- Report on changes made

## Future Development

Moving forward, please follow these guidelines:

1. **Always use the `status` field** to determine service point state
2. **Always set `is_active = true`** for all service points
3. **Never filter based on `is_active`** - use `status` field instead
4. If creating new service points in code, set both `status` and `is_active = true`

## Testing

The fix has been tested with multiple scenarios:
- Creating new service points
- Updating existing service points
- Changing status via Redux actions
- Changing status via direct API calls
- Uploading files to service points
- Verifying database consistency

All operations now maintain consistent status values and always preserve `is_active = true`. 