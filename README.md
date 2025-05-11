# Tire Service Management Application

This application provides a comprehensive platform for tire service centers to manage their posts, appointments, and customer bookings.

## Features

- **Custom Service Posts**: Each service point can have multiple service posts with custom time durations
- **Flexible Scheduling**: Appointments can be scheduled based on the specific duration of each service post
- **Multi-Region Support**: Manage service points across different cities and regions
- **Partner Management**: Partners can manage their own service points
- **Admin Dashboard**: Comprehensive admin interface for managing the entire system

## Project Structure

- **Backend**: Laravel PHP application (in the `/backend` directory)
- **Web Frontend**: React application for admin and partner interface (in the `/web-frontend` directory)
- **App Frontend**: React Native mobile application for clients (in the `/app-frontend` directory)

## Quick Setup

### Automated Setup (Recommended)

#### Windows:
```powershell
# Run from the project root
.\setup.ps1
```

#### Linux/Mac:
```bash
# Run from the project root
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### Backend Setup:
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

#### Web Frontend Setup:
```bash
cd web-frontend
npm install
npm start
```

#### Mobile App Setup:
```bash
cd app-frontend
npm install
npx expo start
```

## Test Accounts

After setting up the application, you can use the following accounts to log in:

### Admin:
- Email: admin@tyreservice.com
- Password: password

### Partners:
- Email: partner1@tyreservice.com
- Email: partner2@tyreservice.com
- Email: partner3@tyreservice.com

### Clients:
- Email: client1@example.com
- Email: client2@example.com
- and others...

Password for all accounts: `password`

## Development

For development purposes, the backend and frontend can be run separately. The web frontend will automatically connect to the backend if it's running on the default port 8000.

## License

This project is proprietary and confidential.

## у приложения есть два режима работы:

Через прокси - стандартный режим, когда фронтенд обращается к API через прокси-сервер
Прямой доступ - режим обхода прокси, когда фронтенд обращается напрямую к бэкенду по URL http://127.0.0.1:8000/api
Для запуска приложения с прямым доступом к API можно использовать скрипт run-with-direct-api-improved.bat.

Для тестирования API можно использовать скрипт test-api.bat или напрямую запустить test-api-comprehensive.js.

## Комментарии к услугам точек обслуживания

В приложении реализована возможность добавления комментариев к услугам точек обслуживания. 
Это позволяет указать дополнительную информацию по каждой услуге, такую как:

- Особенности предоставления услуги в конкретной точке обслуживания
- Специальные условия
- Дополнительные требования
- Время выполнения и т.д.

### Использование в мобильном приложении

1. Откройте экран редактирования точки обслуживания, нажав кнопку "Редактировать" на карточке точки.
2. В разделе "Услуги" вы увидите список выбранных услуг.
3. Нажмите на иконку комментария рядом с нужной услугой, чтобы добавить/отредактировать комментарий.
4. Введите комментарий и нажмите "Сохранить".
5. После сохранения точки обслуживания, комментарии к услугам будут сохранены в базе данных.

### Использование в панели управления

1. Перейдите в раздел "Точки обслуживания".
2. Выберите точку обслуживания или создайте новую.
3. В разделе "Услуги" выберите нужные услуги.
4. Для каждой услуги можно добавить комментарий, нажав на соответствующую кнопку.
5. Нажмите "Сохранить" для сохранения точки обслуживания с комментариями к услугам.

### Техническая информация

Комментарии к услугам хранятся в таблице `service_point_services` в поле `comment`. Это таблица связи между таблицами `service_points` и `services`.

При работе с API используются следующие форматы данных:

1. При получении данных точки обслуживания, комментарии к услугам включаются в ответ в поле `service_comments`:

```json
{
  "service_point": {
    "id": 1,
    "name": "Шиномонтаж на Ленина",
    "services": [1, 2, 3],
    "service_comments": [
      { "service_id": 1, "comment": "Только для легковых автомобилей" },
      { "service_id": 2, "comment": "Включает балансировку" },
      { "service_id": 3 }
    ]
  }
}
```

2. При обновлении точки обслуживания, можно передать комментарии к услугам в поле `service_comments`:

```json
{
  "name": "Шиномонтаж на Ленина",
  "address": "ул. Ленина, 123",
  "service_comments": [
    { "service_id": 1, "comment": "Только для легковых автомобилей" },
    { "service_id": 2, "comment": "Включает балансировку" },
    { "service_id": 3 }
  ]
}
```

Для совместимости можно также использовать поле `services`, которое содержит только идентификаторы услуг без комментариев. 

## Исправление проблемы обновления торговых точек

Если вы столкнулись с ошибкой при редактировании торговых точек, выполните следующие шаги:

1. Убедитесь, что в файле `web-frontend/src/services/api.js` экспортируется функция `updateServicePoint`:
   ```javascript
   export const updateServicePoint = apiExports.updateServicePoint;
   ```

2. Убедитесь, что в файле `web-frontend/src/services/api.ts` определена функция `updateServicePoint`, которая корректно обрабатывает service_comments и working_hours:
   ```typescript
   const updateServicePoint = async (id: number, data: Partial<ServicePoint>): Promise<ServicePoint> => {
     try {
       // Обрабатываем service_comments и working_hours как особые поля
       const payload: Record<string, any> = { ...data };
       
       // Преобразуем service_comments в JSON если это массив
       if (payload.service_comments && Array.isArray(payload.service_comments)) {
         payload.service_comments = JSON.stringify(payload.service_comments);
       }
       
       // Преобразуем working_hours в JSON если это объект
       if (payload.working_hours && typeof payload.working_hours === 'object') {
         payload.working_hours = JSON.stringify(payload.working_hours);
       }
       
       // Преобразуем service_posts в JSON если это массив
       if (payload.service_posts && Array.isArray(payload.service_posts)) {
         payload.service_posts = JSON.stringify(payload.service_posts);
       }
       
       // API запрос
       const response = await axios.put(`/api/v2/service-points/${id}`, payload);
       return response.data.data || response.data;
     } catch (error) {
       console.error('Ошибка обновления торговой точки:', error);
       throw error;
     }
   };
   ```

3. Затем в файле `web-frontend/src/store/slices/servicePointsSlice.ts` используйте импортированную функцию API:
   ```typescript
   import { updateServicePoint as apiUpdateServicePoint } from '../../services/api';
   
   export const updateServicePoint = createAsyncThunk(
     'servicePoints/update',
     async ({ id, data }: { id: number; data: Partial<ServicePoint> }, { rejectWithValue }) => {
       try {
         // Подготовка данных
         const updateData = JSON.parse(JSON.stringify(data));
         
         // Вызов функции API напрямую
         const responseData = await apiUpdateServicePoint(id, updateData);
         
         // Обработка ответа и возврат результата
         return responseData;
       } catch (error: any) {
         return rejectWithValue(error.message || 'Failed to update service point');
       }
     }
   );
   ```

Проблема возникала из-за неправильной сериализации данных при отправке на сервер. Теперь с выделенной функцией API, которая корректно преобразует форматы данных, обновление торговых точек должно работать правильно. 