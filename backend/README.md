# Документация по бекенду системы управления шиномонтажными услугами

## Содержание
1. [Общее описание](#общее-описание)
2. [Технический стек](#технический-стек)
3. [Установка и настройка](#установка-и-настройка)
4. [Структура API](#структура-api)
5. [Модели данных](#модели-данных)
6. [Сервисы](#сервисы)
7. [Тестирование](#тестирование)
8. [Безопасность](#безопасность)
9. [Производительность](#производительность)

## Общее описание
Бекенд представляет собой RESTful API для системы управления шиномонтажными услугами. Система позволяет управлять сервисными точками, партнерами, расписаниями и бронированиями.

### Основные возможности
- Управление сервисными точками (создание, редактирование, удаление)
- Работа с партнерами и их статусами
- Управление расписанием работы точек
- Система бронирования услуг
- Геолокационные сервисы
- Уведомления о статусах бронирований
- Административный интерфейс с повышенной безопасностью

## Технический стек

### Основные технологии
- PHP 8.x - Современная версия PHP с поддержкой типизации и атрибутов
- Laravel Framework - Полнофункциональный PHP фреймворк
- MySQL/PostgreSQL - Реляционная база данных для хранения данных
- Redis - Для кеширования и очередей

### Безопасность и аутентификация
- JWT (JSON Web Tokens) для безопасной аутентификации API
- 2FA (Two-Factor Authentication) для администраторов
- Rate Limiting для защиты от DDoS атак

### Дополнительные инструменты
- Composer - Менеджер зависимостей PHP
- PHPUnit - Фреймворк для тестирования
- Laravel Sanctum - API аутентификация
- Laravel Queue - Система очередей

## Установка и настройка

### Системные требования
- PHP >= 8.1
- Composer
- MySQL >= 8.0 или PostgreSQL >= 13
- Redis >= 6.0
- Расширения PHP:
  - PDO PHP Extension
  - OpenSSL PHP Extension
  - Mbstring PHP Extension
  - Tokenizer PHP Extension
  - XML PHP Extension
  - Redis PHP Extension

### Пошаговая установка
1. Клонирование репозитория:
```bash
git clone <repository-url>
cd backend
```

2. Установка зависимостей:
```bash
composer install
```

3. Настройка окружения:
```bash
cp .env.example .env
php artisan key:generate
```

4. Настройка .env файла:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAPS_API_KEY=your_google_maps_api_key
```

5. Миграции и сиды:
```bash
php artisan migrate
php artisan db:seed
```

6. Запуск сервера:
```bash
php artisan serve
```

7. Запуск очередей:
```bash
php artisan queue:work
```

## Структура API

### Сервисные точки (Service Points)

#### POST /api/service-points
Создание новой сервисной точки
```json
{
    "partner_id": 1,
    "name": "Шиномонтаж на Ленина",
    "address": "ул. Ленина, 1",
    "working_hours": {
        "monday": "9:00-18:00",
        "tuesday": "9:00-18:00",
        "wednesday": "9:00-18:00",
        "thursday": "9:00-18:00",
        "friday": "9:00-18:00",
        "saturday": "10:00-16:00",
        "sunday": "closed"
    }
}
```

#### PUT /api/service-points/{id}
Обновление существующей точки
```json
{
    "name": "Новое название",
    "working_hours": {
        "monday": "10:00-19:00"
    }
}
```

#### DELETE /api/service-points/{id}
Soft-удаление сервисной точки

#### GET /api/service-points
Получение списка точек с фильтрацией
```
GET /api/service-points?partner_id=1&status=active
```

#### GET /api/service-points/{id}
Получение детальной информации о точке

### Партнеры (Partners)

#### POST /api/partners
Регистрация нового партнера
```json
{
    "name": "ООО Шиномонтаж",
    "contact_info": {
        "phone": "+7999999999",
        "email": "info@shinomont.ru",
        "address": "ул. Главная, 1"
    }
}
```

#### PUT /api/partners/{id}
Обновление данных партнера

#### DELETE /api/partners/{id}
Удаление партнера

#### PUT /api/partners/{id}/deactivate
Деактивация партнера с указанием причины
```json
{
    "reason": "Временная приостановка деятельности",
    "deactivation_date": "2024-03-20"
}
```

### Расписание (Schedules)

#### POST /api/schedules
Создание расписания
```json
{
    "service_point_id": 1,
    "date": "2024-03-20",
    "time_slots": [
        {
            "start_time": "09:00",
            "end_time": "10:00",
            "post_number": 1
        }
    ]
}
```

#### GET /api/schedules/available
Получение доступных слотов с фильтрацией
```
GET /api/schedules/available?date=2024-03-20&service_point_id=1
```

#### PUT /api/schedules/{id}/status
Изменение статуса расписания
```json
{
    "status": "booked",
    "metadata": {
        "client_name": "Иван",
        "service_type": "Замена шин"
    }
}
```

### Бронирования (Bookings)

#### POST /api/bookings
Создание бронирования
```json
{
    "schedule_id": 1,
    "client_info": {
        "name": "Иван Петров",
        "phone": "+7999999999",
        "car_info": {
            "model": "Toyota Camry",
            "year": 2020
        }
    },
    "service_type": "tire_change",
    "additional_services": ["balancing", "tire_storage"]
}
```

#### GET /api/bookings/{id}
Получение информации о бронировании

## Модели данных

### ServicePoint
```php
class ServicePoint extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'partner_id',
        'name',
        'address',
        'lat',
        'lng',
        'working_hours'
    ];
    
    protected $casts = [
        'working_hours' => 'array',
        'lat' => 'float',
        'lng' => 'float'
    ];
}
```

#### Поля
- `id` - ID точки (primary key)
- `partner_id` - ID партнера (foreign key)
- `name` - Название точки
- `address` - Физический адрес
- `lat` - Широта (float)
- `lng` - Долгота (float)
- `working_hours` - Рабочие часы (JSON)
- `created_at` - Дата создания
- `updated_at` - Дата обновления
- `deleted_at` - Дата удаления (soft delete)

#### Связи
- `partner()` - Связь с моделью Partner
- `schedules()` - Связь с расписанием
- `bookings()` - Связь с бронированиями

### Partner
```php
class Partner extends Model
{
    protected $fillable = [
        'name',
        'status',
        'contact_info'
    ];
    
    protected $casts = [
        'contact_info' => 'array',
        'status' => PartnerStatus::class
    ];
}
```

#### Поля
- `id` - ID партнера
- `name` - Название компании
- `status` - Статус (enum: active, inactive, suspended)
- `contact_info` - Контактная информация (JSON)
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### Связи
- `servicePoints()` - Связь с сервисными точками
- `users()` - Связь с пользователями партнера

### Schedule
```php
class Schedule extends Model
{
    protected $fillable = [
        'service_point_id',
        'date',
        'time_slot',
        'status',
        'post_number',
        'metadata'
    ];
    
    protected $casts = [
        'date' => 'date',
        'time_slot' => 'array',
        'status' => ScheduleStatus::class,
        'metadata' => 'array'
    ];
}
```

#### Поля
- `id` - ID расписания
- `service_point_id` - ID сервисной точки
- `date` - Дата
- `time_slot` - Временной слот (JSON)
- `status` - Статус (enum)
- `post_number` - Номер поста
- `metadata` - Дополнительные данные (JSON)
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### Статусы расписания
- `available` - Доступно для бронирования
- `booked` - Забронировано
- `completed` - Завершено
- `cancelled` - Отменено

## Сервисы

### MapService
Сервис для работы с геолокацией и картами.

```php
class MapService
{
    protected Client $client;
    private $apiKey;
    private $baseUrl;

    public function __construct(Client $client = null)
    {
        $this->client = $client ?? new Client();
        $this->apiKey = config('services.maps.api_key');
        $this->baseUrl = config('services.maps.base_url');
    }
}
```

#### Методы

##### validateAddress()
Валидация существования адреса
```php
public function validateAddress(string $address): bool
```

##### getCoordinates()
Получение координат по адресу
```php
public function getCoordinates(string $address): array
```
Возвращает:
```json
{
    "lat": 50.4501,
    "lng": 30.5234
}
```

##### calculateDistance()
Расчет расстояния между двумя точками
```php
public function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
```

### NotificationService
Сервис для отправки уведомлений клиентам и партнерам.

#### Методы
- `sendBookingConfirmation()` - Отправка подтверждения бронирования
- `sendReminder()` - Отправка напоминания о записи
- `sendStatusUpdate()` - Уведомление об изменении статуса

### ScheduleService
Сервис для управления расписанием.

#### Методы
- `generateSchedule()` - Генерация расписания на период
- `findAvailableSlots()` - Поиск доступных слотов
- `validateBookingTime()` - Проверка возможности бронирования

## Тестирование

### Типы тестов
1. Модульные тесты (Unit Tests)
   - Тестирование отдельных компонентов
   - Моки внешних зависимостей
   - Проверка бизнес-логики

2. Интеграционные тесты (Integration Tests)
   - Тестирование взаимодействия компонентов
   - Проверка работы с базой данных
   - Тестирование кеширования

3. Функциональные тесты (Feature Tests)
   - Тестирование полных сценариев использования
   - Проверка API endpoints
   - Тестирование аутентификации

### Запуск тестов
```bash
# Запуск всех тестов
php artisan test

# Запуск конкретного теста
php artisan test --filter=MapServiceTest

# Запуск с покрытием кода
php artisan test --coverage

# Параллельный запуск тестов
php artisan test --parallel
```

### Основные тестовые наборы

#### ServicePointFeatureTest
Тестирование функционала сервисных точек:
- Создание точки
- Обновление информации
- Удаление (soft delete)
- Валидация данных
- Проверка геокодирования

#### MapServiceTest
Тестирование геолокационного сервиса:
- Валидация адресов
- Получение координат
- Расчет расстояний
- Обработка ошибок API

#### PartnerFeatureTest
Тестирование функционала партнеров:
- Регистрация
- Обновление данных
- Деактивация
- Управление точками

#### ScheduleFeatureTest
Тестирование управления расписанием:
- Создание расписания
- Поиск свободных слотов
- Изменение статусов
- Валидация временных слотов

#### BookingFeatureTest
Тестирование системы бронирования:
- Создание брони
- Отмена бронирования
- Подтверждение записи
- Проверка уведомлений

## Безопасность

### Аутентификация
1. JWT (JSON Web Tokens)
   - Stateless аутентификация
   - Настраиваемое время жизни токенов
   - Refresh tokens для продления сессии

2. Two-Factor Authentication (2FA)
   - Обязательно для администраторов
   - TOTP (Time-based One-Time Password)
   - Backup коды для восстановления

### Защита от атак
1. Rate Limiting
   - Ограничение количества запросов
   - Защита от брутфорс атак
   - Гибкая настройка лимитов

2. CORS (Cross-Origin Resource Sharing)
   - Настроенные заголовки безопасности
   - Белый список доменов
   - Защита от несанкционированного доступа

3. Валидация данных
   - Строгая проверка входных данных
   - Санитизация пользовательского ввода
   - Защита от SQL-инъекций

### Резервное копирование
1. Автоматическое резервное копирование
   - Ежедневные бэкапы базы данных
   - Хранение на удаленном сервере
   - Ротация старых копий

2. Мониторинг
   - Логирование важных действий
   - Отслеживание подозрительной активности
   - Уведомления о проблемах безопасности

## Производительность

### Кеширование
1. Redis
   - Кеширование частых запросов
   - Хранение сессий
   - Очереди задач

2. Стратегии кеширования
   - Cache-aside
   - Write-through
   - Cache invalidation

### Оптимизация базы данных
1. Индексы
   - Оптимизированные индексы для частых запросов
   - Составные индексы
   - Мониторинг производительности

2. Запросы
   - Оптимизация сложных запросов
   - Eager loading для связей
   - Query caching

### Очереди задач
1. Асинхронные операции
   - Отправка уведомлений
   - Обработка геокодирования
   - Генерация отчетов

2. Мониторинг очередей
   - Отслеживание failed jobs
   - Автоматические retry
   - Алерты при проблемах
