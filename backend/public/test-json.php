<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$response = [
    'status' => 'success',
    'message' => 'Test JSON response',
    'data' => [
        'bookings' => [
            [
                'id' => 1,
                'schedule_id' => 19,
                'client_id' => 7,
                'full_name' => 'Client Three',
                'phone' => '+79693456542',
                'car_number' => 'Щ789ЪЫ197',
                'created_at' => '2025-05-07 10:58:57',
                'updated_at' => '2025-05-07 10:58:57'
            ],
            [
                'id' => 2,
                'schedule_id' => 20,
                'client_id' => 9,
                'full_name' => 'Client Five',
                'phone' => '+79888803693',
                'car_number' => 'Р789СТ99',
                'created_at' => '2025-05-07 10:58:57',
                'updated_at' => '2025-05-07 10:58:57'
            ]
        ]
    ]
];

echo json_encode($response); 