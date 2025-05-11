<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Получаем метод запроса
$method = $_SERVER['REQUEST_METHOD'];

// Эмуляция данных бронирований
$bookings = [
    [
        'id' => 1,
        'schedule_id' => 19,
        'client_id' => 7,
        'full_name' => 'Client Three',
        'phone' => '+79693456542',
        'car_number' => 'Щ789ЪЫ197',
        'created_at' => '2025-05-07 10:58:57',
        'updated_at' => '2025-05-07 10:58:57',
        'status' => 'confirmed',
        'date' => '2025-06-01',
        'timeSlot' => '10:00 - 11:00',
        'services' => ['Замена шин', 'Балансировка']
    ],
    [
        'id' => 2,
        'schedule_id' => 20,
        'client_id' => 9,
        'full_name' => 'Client Five',
        'phone' => '+79888803693',
        'car_number' => 'Р789СТ99',
        'created_at' => '2025-05-07 10:58:57',
        'updated_at' => '2025-05-07 10:58:57',
        'status' => 'pending',
        'date' => '2025-06-02',
        'timeSlot' => '14:00 - 15:00',
        'services' => ['Диагностика', 'Подкачка шин']
    ],
    [
        'id' => 3,
        'schedule_id' => 21,
        'client_id' => 7,
        'full_name' => 'Client Three',
        'phone' => '+79653575904',
        'car_number' => 'Н456ОП177',
        'created_at' => '2025-05-07 10:58:57',
        'updated_at' => '2025-05-07 10:58:57',
        'status' => 'completed',
        'date' => '2025-05-25',
        'timeSlot' => '12:00 - 13:00',
        'services' => ['Установка дисков', 'Подкачка шин']
    ]
];

// Обработка OPTIONS-запросов (CORS preflight)
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Обработка GET-запросов
if ($method === 'GET') {
    // Проверяем, есть ли ID в URL
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $segments = explode('/', $path);
    $lastSegment = end($segments);
    
    // Если есть ID, возвращаем конкретное бронирование
    if (is_numeric($lastSegment)) {
        $id = (int)$lastSegment;
        $booking = null;
        
        foreach ($bookings as $b) {
            if ($b['id'] === $id) {
                $booking = $b;
                break;
            }
        }
        
        if ($booking) {
            echo json_encode([
                'status' => 'success',
                'booking' => $booking
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Бронирование не найдено'
            ]);
        }
    } 
    // Иначе возвращаем все бронирования
    else {
        echo json_encode([
            'status' => 'success',
            'count' => count($bookings),
            'bookings' => $bookings
        ]);
    }
} 
// Обработка POST-запросов
else if ($method === 'POST') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Бронирование создано успешно',
        'booking_id' => rand(100, 999)
    ]);
}
// Обработка PUT-запросов
else if ($method === 'PUT') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Бронирование обновлено успешно'
    ]);
}
// Обработка DELETE-запросов
else if ($method === 'DELETE') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Бронирование удалено успешно'
    ]);
}
// Неподдерживаемый метод
else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Метод не поддерживается'
    ]);
} 