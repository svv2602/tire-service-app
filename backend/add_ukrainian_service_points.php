<?php

// This script adds Ukrainian service points with proper working hours

require __DIR__ . '/vendor/autoload.php';

// Initialize the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ServicePoint;
use App\Models\Partner;

// Get all partners
$partners = Partner::all();

if ($partners->isEmpty()) {
    echo "No partners found. Please run PartnerSeeder first.\n";
    exit(1);
}

// Define Ukrainian working hours formats
$standardHours = [
    'monday' => ['open' => '09:00', 'close' => '18:00'],
    'tuesday' => ['open' => '09:00', 'close' => '18:00'],
    'wednesday' => ['open' => '09:00', 'close' => '18:00'],
    'thursday' => ['open' => '09:00', 'close' => '18:00'],
    'friday' => ['open' => '09:00', 'close' => '18:00'],
    'saturday' => ['open' => '10:00', 'close' => '16:00'],
    'sunday' => 'closed'
];

$extendedHours = [
    'monday' => ['open' => '08:30', 'close' => '19:00'],
    'tuesday' => ['open' => '08:30', 'close' => '19:00'],
    'wednesday' => ['open' => '08:30', 'close' => '19:00'],
    'thursday' => ['open' => '08:30', 'close' => '19:00'],
    'friday' => ['open' => '08:30', 'close' => '19:00'],
    'saturday' => ['open' => '09:00', 'close' => '17:00'],
    'sunday' => ['open' => '10:00', 'close' => '15:00']
];

$weekdayOnlyHours = [
    'monday' => ['open' => '08:00', 'close' => '18:00'],
    'tuesday' => ['open' => '08:00', 'close' => '18:00'],
    'wednesday' => ['open' => '08:00', 'close' => '18:00'],
    'thursday' => ['open' => '08:00', 'close' => '18:00'],
    'friday' => ['open' => '08:00', 'close' => '18:00'],
    'saturday' => 'closed',
    'sunday' => 'closed'
];

// Define service posts
$standardPosts = [
    [
        'name' => 'Пост 1',
        'service_time_minutes' => 30
    ],
    [
        'name' => 'Пост 2',
        'service_time_minutes' => 45
    ],
    [
        'name' => 'Пост 3',
        'service_time_minutes' => 60
    ]
];

$expressServicePosts = [
    [
        'name' => 'Експрес-шиномонтаж',
        'service_time_minutes' => 25
    ],
    [
        'name' => 'Стандартний пост',
        'service_time_minutes' => 40
    ]
];

$mixedServicePosts = [
    [
        'name' => 'Пост вантажний',
        'service_time_minutes' => 90
    ],
    [
        'name' => 'Пост легковий 1',
        'service_time_minutes' => 35
    ],
    [
        'name' => 'Пост легковий 2',
        'service_time_minutes' => 35
    ],
    [
        'name' => 'Експрес-пост',
        'service_time_minutes' => 20
    ]
];

// Create Ukrainian service points
$newServicePoints = [
    [
        'partner_id' => $partners[0]->id,
        'name' => 'ШинСервіс Київ - Центр',
        'address' => 'вул. Хрещатик, 15, Київ',
        'region' => 'Київська область',
        'city' => 'Київ',
        'lat' => 50.4501,
        'lng' => 30.5234,
        'working_hours' => $standardHours,
        'description' => 'Центральний шиномонтаж з повним спектром послуг',
        'contact_info' => '+380 44 123-45-67',
        'is_active' => true,
        'num_posts' => 3,
        'service_posts' => $standardPosts
    ],
    [
        'partner_id' => $partners[0]->id,
        'name' => 'ШинСервіс Київ - Південь',
        'address' => 'вул. Велика Васильківська, 72, Київ',
        'region' => 'Київська область',
        'city' => 'Київ',
        'lat' => 50.4367,
        'lng' => 30.5185,
        'working_hours' => $extendedHours,
        'description' => 'Південний філіал з розширеними годинами роботи',
        'contact_info' => '+380 44 765-43-21',
        'is_active' => true,
        'num_posts' => 2,
        'service_posts' => $expressServicePosts
    ],
    [
        'partner_id' => $partners[1 % count($partners)]->id,
        'name' => 'АвтоШина Львів - Центр',
        'address' => 'вул. Степана Бандери, 11, Львів',
        'region' => 'Львівська область',
        'city' => 'Львів',
        'lat' => 49.8397,
        'lng' => 24.0297,
        'working_hours' => $weekdayOnlyHours,
        'description' => 'Філіал у Львові з повним спектром послуг',
        'contact_info' => '+380 32 345-67-89',
        'is_active' => true,
        'num_posts' => 3,
        'service_posts' => $mixedServicePosts
    ],
    [
        'partner_id' => $partners[2 % count($partners)]->id,
        'name' => 'ШинСервіс Одеса - Приморський',
        'address' => 'вул. Дерибасівська, 21, Одеса',
        'region' => 'Одеська область',
        'city' => 'Одеса',
        'lat' => 46.4825,
        'lng' => 30.7233,
        'working_hours' => $standardHours,
        'description' => 'Філіал в Одесі з повним спектром послуг',
        'contact_info' => '+380 48 765-43-21',
        'is_active' => true,
        'num_posts' => 3,
        'service_posts' => $standardPosts
    ]
];

$created = 0;

foreach ($newServicePoints as $servicePointData) {
    // Convert service_posts to JSON string
    if (isset($servicePointData['service_posts'])) {
        $servicePointData['service_posts'] = json_encode($servicePointData['service_posts']);
    }
    
    // Create the service point
    $servicePoint = ServicePoint::create($servicePointData);
    echo "Created service point: {$servicePoint->name}\n";
    $created++;
}

echo "\nCreated {$created} new Ukrainian service points.\n"; 