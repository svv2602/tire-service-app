export interface ApiParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  example?: any;
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  group: string;
  description: string;
  parameters?: ApiParam[];
  responseExample?: any;
}

// Пример группировки API эндпоинтов
export const apiEndpoints: ApiEndpoint[] = [
  // Точки обслуживания
  {
    path: '/v2/service-points',
    method: 'GET',
    group: 'Точки обслуживания',
    description: 'Получить список точек обслуживания',
    parameters: [
      {
        name: 'city',
        type: 'string',
        description: 'Фильтр по городу',
        required: false,
        example: 'Київ'
      },
      {
        name: 'region',
        type: 'string',
        description: 'Фильтр по области',
        required: false,
        example: 'Київська область'
      },
      {
        name: 'status',
        type: 'string',
        description: 'Фильтр по статусу (working, suspended, closed)',
        required: false,
        example: 'working'
      }
    ]
  },
  {
    path: '/v2/service-points/{id}',
    method: 'GET',
    group: 'Точки обслуживания',
    description: 'Получить детальную информацию о точке обслуживания',
    parameters: [
      {
        name: 'id',
        type: 'number',
        description: 'ID точки обслуживания',
        required: true,
        example: 1
      }
    ]
  },
  {
    path: '/v2/service-points',
    method: 'POST',
    group: 'Точки обслуживания',
    description: 'Создать новую точку обслуживания',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Название точки',
        required: true,
        example: 'ШинСервіс - Центр'
      },
      {
        name: 'address',
        type: 'string',
        description: 'Адрес точки',
        required: true,
        example: 'вул. Хрещатик, 15, Київ'
      },
      {
        name: 'region',
        type: 'string',
        description: 'Область',
        required: true,
        example: 'Київська область'
      },
      {
        name: 'city',
        type: 'string',
        description: 'Город',
        required: true,
        example: 'Київ'
      },
      {
        name: 'partner_id',
        type: 'number',
        description: 'ID партнера',
        required: true,
        example: 1
      },
      {
        name: 'status',
        type: 'string',
        description: 'Статус точки (working, suspended, closed)',
        required: true,
        example: 'working'
      },
      {
        name: 'working_hours',
        type: 'object',
        description: 'Часы работы',
        required: true,
        example: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "10:00", close: "16:00" },
          sunday: "выходной"
        }
      }
    ]
  },
  {
    path: '/api/v2/service-points/{id}',
    method: 'PUT',
    group: 'Точки обслуживания',
    description: 'Обновить информацию о точке обслуживания',
    parameters: [
      {
        name: 'id',
        type: 'number',
        description: 'ID точки обслуживания',
        required: true,
        example: 1
      },
      {
        name: 'name',
        type: 'string',
        description: 'Название точки',
        required: false,
        example: 'ШинСервіс - Центр'
      },
      {
        name: 'status',
        type: 'string',
        description: 'Статус точки (working, suspended, closed)',
        required: false,
        example: 'working'
      }
    ]
  },
  {
    path: '/api/v2/service-points/{id}',
    method: 'DELETE',
    group: 'Точки обслуживания',
    description: 'Удалить точку обслуживания',
    parameters: [
      {
        name: 'id',
        type: 'number',
        description: 'ID точки обслуживания',
        required: true,
        example: 1
      }
    ]
  },
  {
    path: '/api/v2/service-points/{id}/status',
    method: 'PATCH',
    group: 'Точки обслуживания',
    description: 'Обновить статус точки обслуживания',
    parameters: [
      {
        name: 'id',
        type: 'number',
        description: 'ID точки обслуживания',
        required: true,
        example: 1
      },
      {
        name: 'status',
        type: 'string',
        description: 'Новый статус (working, suspended, closed)',
        required: true,
        example: 'suspended'
      }
    ]
  },
  {
    path: '/api/v2/service-points/{id}/files',
    method: 'POST',
    group: 'Точки обслуживания',
    description: 'Загрузить файлы для точки обслуживания',
    parameters: [
      {
        name: 'id',
        type: 'number',
        description: 'ID точки обслуживания',
        required: true,
        example: 1
      },
      {
        name: 'price_lists[]',
        type: 'array',
        description: 'Файлы прайс-листов (форма multipart)',
        required: false,
        example: 'Files'
      },
      {
        name: 'images[]',
        type: 'array',
        description: 'Изображения точки (форма multipart)',
        required: false,
        example: 'Files'
      }
    ]
  },
  
  // Регионы и города
  {
    path: '/api/v2/regions',
    method: 'GET',
    group: 'География',
    description: 'Получить список областей',
    parameters: []
  },
  {
    path: '/api/v2/cities',
    method: 'GET',
    group: 'География',
    description: 'Получить список всех городов',
    parameters: []
  },
  {
    path: '/api/v2/regions/{region}/cities',
    method: 'GET',
    group: 'География',
    description: 'Получить города в указанной области',
    parameters: [
      {
        name: 'region',
        type: 'string',
        description: 'Название области',
        required: true,
        example: 'Київська область'
      }
    ]
  },
  
  // Партнеры
  {
    path: '/api/v2/partners',
    method: 'GET',
    group: 'Партнеры',
    description: 'Получить список партнеров',
    parameters: []
  },
  {
    path: '/api/v2/partners/{id}',
    method: 'GET',
    group: 'Партнеры',
    description: 'Получить информацию о партнере',
    parameters: [
      {
        name: 'id',
        type: 'number',
        description: 'ID партнера',
        required: true,
        example: 1
      }
    ]
  },
  {
    path: '/api/v2/partners',
    method: 'POST',
    group: 'Партнеры',
    description: 'Создать нового партнера',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Имя партнера',
        required: true,
        example: 'ШинСервіс'
      },
      {
        name: 'company_name',
        type: 'string',
        description: 'Название компании',
        required: true,
        example: 'ООО "ШинСервіс"'
      },
      {
        name: 'email',
        type: 'string',
        description: 'Email партнера',
        required: true,
        example: 'contact@shinservice.com'
      },
      {
        name: 'phone',
        type: 'string',
        description: 'Телефон партнера',
        required: true,
        example: '+380441234567'
      }
    ]
  },
  
  // Услуги
  {
    path: '/api/services',
    method: 'GET',
    group: 'Услуги',
    description: 'Получить список услуг',
    parameters: []
  },
  {
    path: '/api/services/{id}',
    method: 'GET',
    group: 'Услуги',
    description: 'Получить информацию об услуге',
    parameters: [
      {
        name: 'id',
        type: 'number',
        description: 'ID услуги',
        required: true,
        example: 1
      }
    ]
  },
  
  // Загрузка и скачивание файлов
  {
    path: '/api/v2/download/price-list/{filename}',
    method: 'GET',
    group: 'Файлы',
    description: 'Скачать прайс-лист по имени файла',
    parameters: [
      {
        name: 'filename',
        type: 'string',
        description: 'Имя файла прайс-листа',
        required: true,
        example: 'price-list.xlsx'
      }
    ]
  },
  {
    path: '/api/direct-download/price-list/{filename}',
    method: 'GET',
    group: 'Файлы',
    description: 'Прямое скачивание прайс-листа (альтернативный метод)',
    parameters: [
      {
        name: 'filename',
        type: 'string',
        description: 'Имя файла прайс-листа',
        required: true,
        example: 'price-list.xlsx'
      }
    ]
  },
  
  // Диагностика API
  {
    path: '/api/test-file-access/{filename}',
    method: 'GET',
    group: 'Диагностика',
    description: 'Проверить доступ к файлу',
    parameters: [
      {
        name: 'filename',
        type: 'string',
        description: 'Имя файла',
        required: true,
        example: 'NQM9jqn0NlrEGEjRABMfUUjaE87xbfQ8dUJXlUZk.xlsx'
      }
    ]
  },
  {
    path: '/api/ping',
    method: 'GET',
    group: 'Диагностика',
    description: 'Проверить работоспособность API',
    parameters: []
  },
  {
    path: '/api/check-db',
    method: 'GET',
    group: 'Диагностика',
    description: 'Проверить подключение к базе данных',
    parameters: []
  }
];

export const getGroupedEndpoints = () => {
  const grouped = new Map<string, ApiEndpoint[]>();
  
  apiEndpoints.forEach(endpoint => {
    const group = endpoint.group;
    if (!grouped.has(group)) {
      grouped.set(group, []);
    }
    grouped.get(group)?.push(endpoint);
  });
  
  return grouped;
};

export default { apiEndpoints, getGroupedEndpoints };