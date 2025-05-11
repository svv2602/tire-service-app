<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Получаем метод запроса
$method = $_SERVER['REQUEST_METHOD'];

// Эмуляция данных партнеров
$partners = [
    [
        'id' => 1,
        'user_id' => 2,
        'company_name' => 'ШинСервис',
        'contact_person' => 'Александр Иванов',
        'phone' => '+79001112233',
        'status' => 'active',
        'created_at' => '2025-05-07 10:58:48',
        'updated_at' => '2025-05-07 10:58:48',
        'name' => 'Partner One',
        'email' => 'partner1@tyreservice.com'
    ],
    [
        'id' => 2,
        'user_id' => 3,
        'company_name' => 'АвтоШина Плюс',
        'contact_person' => 'Екатерина Смирнова',
        'phone' => '+79002223344',
        'status' => 'active',
        'created_at' => '2025-05-07 10:58:48',
        'updated_at' => '2025-05-07 10:58:48',
        'name' => 'Partner Two',
        'email' => 'partner2@tyreservice.com'
    ],
    [
        'id' => 3,
        'user_id' => 4,
        'company_name' => 'МастерКолёс',
        'contact_person' => 'Сергей Петров',
        'phone' => '+79003334455',
        'status' => 'active',
        'created_at' => '2025-05-07 10:58:48',
        'updated_at' => '2025-05-07 10:58:48',
        'name' => 'Partner Three',
        'email' => 'partner3@tyreservice.com'
    ]
];

// Service points data
$servicePoints = [
    1 => [
        [
            'id' => 1,
            'partner_id' => 1,
            'name' => 'ШинСервис - Центр',
            'address' => 'ул. Ленина, 15, Москва',
            'lat' => 55.7558,
            'lng' => 37.6173,
            'working_hours' => '{"monday":{"open":"09:00","close":"18:00"},"tuesday":{"open":"09:00","close":"18:00"},"wednesday":{"open":"09:00","close":"18:00"},"thursday":{"open":"09:00","close":"18:00"},"friday":{"open":"09:00","close":"18:00"},"saturday":{"open":"10:00","close":"16:00"},"sunday":"closed"}'
        ],
        [
            'id' => 2,
            'partner_id' => 1,
            'name' => 'ШинСервис - Юг',
            'address' => 'ул. Южная, 22, Москва',
            'lat' => 55.7127,
            'lng' => 37.6030,
            'working_hours' => '{"monday":{"open":"08:30","close":"19:00"},"tuesday":{"open":"08:30","close":"19:00"},"wednesday":{"open":"08:30","close":"19:00"},"thursday":{"open":"08:30","close":"19:00"},"friday":{"open":"08:30","close":"19:00"},"saturday":{"open":"09:00","close":"17:00"},"sunday":{"open":"10:00","close":"15:00"}}'
        ]
    ],
    2 => [
        [
            'id' => 3,
            'partner_id' => 2,
            'name' => 'АвтоШина Плюс - Север',
            'address' => 'ул. Северная, 10, Москва',
            'lat' => 55.7818,
            'lng' => 37.6090,
            'working_hours' => '{"monday":{"open":"09:00","close":"19:00"},"tuesday":{"open":"09:00","close":"19:00"},"wednesday":{"open":"09:00","close":"19:00"},"thursday":{"open":"09:00","close":"19:00"},"friday":{"open":"09:00","close":"19:00"},"saturday":{"open":"10:00","close":"17:00"},"sunday":"closed"}'
        ]
    ],
    3 => [
        [
            'id' => 4,
            'partner_id' => 3,
            'name' => 'МастерКолёс - Восток',
            'address' => 'ул. Восточная, 5, Москва',
            'lat' => 55.7512,
            'lng' => 37.6802,
            'working_hours' => '{"monday":{"open":"08:00","close":"20:00"},"tuesday":{"open":"08:00","close":"20:00"},"wednesday":{"open":"08:00","close":"20:00"},"thursday":{"open":"08:00","close":"20:00"},"friday":{"open":"08:00","close":"20:00"},"saturday":{"open":"09:00","close":"18:00"},"sunday":{"open":"09:00","close":"17:00"}}'
        ],
        [
            'id' => 5,
            'partner_id' => 3,
            'name' => 'МастерКолёс - Запад',
            'address' => 'ул. Западная, 8, Москва',
            'lat' => 55.7539,
            'lng' => 37.5319,
            'working_hours' => '{"monday":{"open":"08:00","close":"21:00"},"tuesday":{"open":"08:00","close":"21:00"},"wednesday":{"open":"08:00","close":"21:00"},"thursday":{"open":"08:00","close":"21:00"},"friday":{"open":"08:00","close":"21:00"},"saturday":{"open":"09:00","close":"19:00"},"sunday":{"open":"09:00","close":"18:00"}}'
        ]
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
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    // Если есть ID, возвращаем конкретного партнера
    if ($id) {
        $partner = null;
        
        foreach ($partners as $p) {
            if ($p['id'] === $id) {
                $partner = $p;
                break;
            }
        }
        
        if ($partner) {
            $partnerServicePoints = isset($servicePoints[$id]) ? $servicePoints[$id] : [];
            
            echo json_encode([
                'status' => 'success',
                'partner' => $partner,
                'service_points' => $partnerServicePoints
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Партнер не найден'
            ]);
        }
    } 
    // Иначе возвращаем всех партнеров
    else {
        echo json_encode([
            'status' => 'success',
            'count' => count($partners),
            'partners' => $partners
        ]);
    }
} 
// Обработка POST-запросов
else if ($method === 'POST') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Партнер создан успешно',
        'data' => [
            'id' => rand(10, 99),
            'user_id' => rand(10, 99),
            'temporary_password' => 'temp' . rand(1000, 9999)
        ]
    ]);
}
// Обработка PUT-запросов (update partner)
else if ($method === 'PUT' || $method === 'PATCH') {
    // Get the input data from request
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Get the ID from the URL
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $segments = explode('/', $path);
    $lastSegment = end($segments);
    
    if (is_numeric($lastSegment)) {
        $id = (int)$lastSegment;
        $partnerFound = false;
        
        // Find and update the partner
        foreach ($partners as &$partner) {
            if ($partner['id'] === $id) {
                // Update the partner data
                if (isset($input['name'])) $partner['name'] = $input['name'];
                if (isset($input['email'])) $partner['email'] = $input['email'];
                if (isset($input['phone'])) $partner['phone'] = $input['phone'];
                if (isset($input['address'])) $partner['address'] = $input['address'];
                if (isset($input['status'])) $partner['status'] = $input['status'];
                if (isset($input['company_name'])) $partner['company_name'] = $input['company_name'];
                if (isset($input['contact_person'])) $partner['contact_person'] = $input['contact_person'];
                
                $partner['updated_at'] = date('Y-m-d H:i:s');
                $partnerFound = true;
                break;
            }
        }
        
        if ($partnerFound) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Партнер успешно обновлен',
                'partner' => $partner
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Партнер не найден'
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Неверный ID партнера'
        ]);
    }
}
// Обработка DELETE-запросов
else if ($method === 'DELETE') {
    // Get the ID from the URL
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $segments = explode('/', $path);
    $lastSegment = end($segments);
    
    if (is_numeric($lastSegment)) {
        $id = (int)$lastSegment;
        $partnerIndex = null;
        
        // Find the partner index
        foreach ($partners as $index => $partner) {
            if ($partner['id'] === $id) {
                $partnerIndex = $index;
                break;
            }
        }
        
        if ($partnerIndex !== null) {
            // Remove the partner from the array
            // In a real application, you would delete from the database
            array_splice($partners, $partnerIndex, 1);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Партнер успешно удален'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Партнер не найден'
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Неверный ID партнера'
        ]);
    }
}
// Неподдерживаемый метод
else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Метод не поддерживается'
    ]);
} 