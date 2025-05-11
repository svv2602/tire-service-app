# Руководство по исправлению проблемы с отображением неактивных сервисных точек

## 1. Описание проблемы

При изменении статуса сервисной точки на "неактивная", она пропадает из интерфейса клиента и становится невидимой на карте. Проблема заключается в фильтрации данных на уровне бэкенда и отсутствии явного управления фильтрацией на фронтенде.

## 2. Причины проблемы

1. **Модель `ServicePoint` в бэкенде** имеет глобальный скоуп `active`, который автоматически фильтрует неактивные сервисные точки:

```php
protected static function booted()
{
    // Global scope to filter out inactive service points by default
    static::addGlobalScope('active', function (Builder $builder) {
        $builder->where('is_active', 1);
    });
}
```

2. **API-запросы** от клиентского интерфейса не включают параметр `include_inactive=true`, который бы отключил этот глобальный скоуп.

3. **Фронтенд компоненты** не выполняют явную фильтрацию по статусу `is_active`, полагаясь на то, что данные уже отфильтрованы на сервере.

## 3. Внесенные исправления

### В компоненте `NewBookingPage.tsx`

1. Добавлена явная фильтрация по статусу `is_active`:

```typescript
const mapServicePoints = useMemo((): ServicePoint[] => {
  // ...
  return servicePoints
    .filter(point => 
      point && 
      // ...
      // Explicitly filter for active service points only
      point.is_active === true
    )
    // ...
}, [servicePoints]);
```

2. Добавлено логирование для отладки количества активных и неактивных точек:

```typescript
useEffect(() => {
  if (Array.isArray(servicePoints)) {
    const totalPoints = servicePoints.length;
    const activePoints = servicePoints.filter(p => p.is_active).length;
    const inactivePoints = totalPoints - activePoints;
    console.log(`Service points: ${totalPoints} total, ${activePoints} active, ${inactivePoints} inactive`);
    console.log(`Filtered for map: ${mapServicePoints.length} points`);
  }
}, [servicePoints, mapServicePoints]);
```

### В компоненте `ServicePointsMap.tsx`

1. Добавлено улучшенное логирование для отладки статусов точек:

```typescript
useEffect(() => {
  // Count active vs inactive points
  if (Array.isArray(servicePoints)) {
    const activePoints = servicePoints.filter(p => p.is_active === true);
    const inactivePoints = servicePoints.filter(p => p.is_active === false);
    
    console.log('Map component received points:', {
      total: servicePoints.length,
      active: activePoints.length,
      inactive: inactivePoints.length
    });
    
    // Log the first few points for detailed inspection
    if (servicePoints.length > 0) {
      console.log('Sample service points:');
      servicePoints.slice(0, 3).forEach((point, index) => {
        console.log(`Point ${index + 1}: id=${point.id}, name=${point.name}, is_active=${point.is_active}`);
      });
    }
  }
}, [servicePoints]);
```

2. Добавлено отображение статуса точки в всплывающем окне (popup):

```jsx
<Popup>
  <div>
    <h3>{point.name}</h3>
    <p>{point.address}</p>
    <p>Телефон: {point.phone || 'Не указан'}</p>
    {point.description && <p>{point.description}</p>}
    <p><strong>Статус: {point.is_active ? 'Активная' : 'Неактивная'}</strong></p>
  </div>
</Popup>
```

### В Redux слайсе `servicePointsSlice.ts`

1. Улучшено логирование при запросе сервисных точек:

```typescript
console.log('Using all service points endpoint with include_inactive=true, this should include BOTH active AND inactive points');
```

2. Добавлен комментарий, объясняющий необходимость включения неактивных точек:

```typescript
// CRITICAL: Always include inactive service points for both admin and client interfaces
// This allows client-side filtering instead of relying on backend filtering
include_inactive: true
```

## 4. Как проверить, что исправление работает

1. Перейдите в панель администратора по адресу `/admin/service-points`
2. Измените статус некоторых точек на "неактивный"
3. Перейдите на страницу бронирования
4. Откройте консоль разработчика (F12) и проверьте логи:
   - Вы должны увидеть сообщения о количестве общих, активных и неактивных точек
   - В приложении на карте должны отображаться только активные точки

## 5. Рекомендации для предотвращения подобных проблем в будущем

1. **Используйте явную фильтрацию** на фронтенде для критических условий отображения, не полагаясь только на фильтрацию бэкенда
2. **Добавьте логирование** для отслеживания количества и статусов получаемых объектов
3. **Создайте тесты** для проверки корректного отображения объектов с разными статусами
4. **Рассмотрите возможность переноса фильтрации** на фронтенд для большей гибкости отображения
5. **Документируйте поведение глобальных скоупов** в моделях бэкенда для разработчиков фронтенда

## 6. Техническая информация о фильтрации в Laravel

Laravel использует глобальные скоупы для автоматической фильтрации данных на уровне запросов. Чтобы отключить такую фильтрацию, необходимо:

1. Добавить метод `scopeWithInactive` в модель:

```php
public function scopeWithInactive($query)
{
    return $query->withoutGlobalScope('active');
}
```

2. Использовать его в контроллере при запросах:

```php
ServicePoint::withInactive()->get();
```

3. Или передавать параметр в API и использовать его в контроллере:

```php
if ($request->has('include_inactive') && $request->boolean('include_inactive')) {
    $query->withInactive();
}
``` 