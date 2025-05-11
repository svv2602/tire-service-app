<?php

// Initialize Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ServicePoint;
use App\Models\Partner;

// Get partners
$partners = Partner::all();

if ($partners->isEmpty()) {
    echo "No partners found. Please run PartnerSeeder first.\n";
    exit(1);
}

// Sample working hours formats
$standardHours = [
    'monday' => '09:00-18:00',
    'tuesday' => '09:00-18:00',
    'wednesday' => '09:00-18:00',
    'thursday' => '09:00-18:00',
    'friday' => '09:00-18:00',
    'saturday' => '10:00-16:00',
    'sunday' => 'closed'
];

$extendedHours = [
    'monday' => '08:30-19:00',
    'tuesday' => '08:30-19:00',
    'wednesday' => '08:30-19:00',
    'thursday' => '08:30-19:00',
    'friday' => '08:30-19:00',
    'saturday' => '09:00-17:00',
    'sunday' => '10:00-15:00'
];

$businessHours = [
    'monday' => '08:00-17:00',
    'tuesday' => '08:00-17:00',
    'wednesday' => '08:00-17:00',
    'thursday' => '08:00-17:00',
    'friday' => '08:00-17:00',
    'saturday' => 'closed',
    'sunday' => 'closed'
];

$weekendHours = [
    'monday' => 'closed',
    'tuesday' => 'closed',
    'wednesday' => 'closed',
    'thursday' => 'closed',
    'friday' => '14:00-20:00',
    'saturday' => '10:00-20:00',
    'sunday' => '10:00-18:00'
];

$splitHours = [
    'monday' => '09:00-13:00, 14:00-19:00',
    'tuesday' => '09:00-13:00, 14:00-19:00',
    'wednesday' => '09:00-13:00, 14:00-19:00',
    'thursday' => '09:00-13:00, 14:00-19:00',
    'friday' => '09:00-13:00, 14:00-19:00',
    'saturday' => '10:00-15:00',
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

// Create sample service points
$testServicePoints = [
    [
        'partner_id' => $partners[0]->id,
        'name' => 'Стандартні години - Київ',
        'address' => 'вул. Хрещатик, 10, Київ',
        'region' => 'Київська область',
        'city' => 'Київ',
        'lat' => 50.4501,
        'lng' => 30.5234,
        'working_hours' => $standardHours,
        'description' => 'Сервісний центр зі стандартними годинами роботи',
        'contact_info' => '+380 44 123-45-67',
        'is_active' => true,
        'num_posts' => 3,
        'service_posts' => $standardPosts
    ],
    [
        'partner_id' => $partners[0]->id,
        'name' => 'Розширені години - Київ',
        'address' => 'вул. Пирогова, 2, Київ',
        'region' => 'Київська область',
        'city' => 'Київ',
        'lat' => 50.4400,
        'lng' => 30.5100,
        'working_hours' => $extendedHours,
        'description' => 'Сервісний центр з розширеними годинами роботи, включно з неділею',
        'contact_info' => '+380 44 987-65-43',
        'is_active' => true,
        'num_posts' => 2,
        'service_posts' => $standardPosts
    ],
    [
        'partner_id' => $partners[1 % count($partners)]->id,
        'name' => 'Офісний час - Львів',
        'address' => 'вул. Франка, 15, Львів',
        'region' => 'Львівська область',
        'city' => 'Львів',
        'lat' => 49.8397,
        'lng' => 24.0297,
        'working_hours' => $businessHours,
        'description' => 'Сервісний центр з графіком роботи тільки по будням',
        'contact_info' => '+380 32 123-45-67',
        'is_active' => true,
        'num_posts' => 3,
        'service_posts' => $standardPosts
    ],
    [
        'partner_id' => $partners[1 % count($partners)]->id,
        'name' => 'Тільки вихідні - Львів',
        'address' => 'просп. Свободи, 20, Львів',
        'region' => 'Львівська область',
        'city' => 'Львів',
        'lat' => 49.8400,
        'lng' => 24.0300,
        'working_hours' => $weekendHours,
        'description' => 'Сервісний центр для тих, хто працює по буднях - працюємо тільки на вихідних',
        'contact_info' => '+380 32 987-65-43',
        'is_active' => true,
        'num_posts' => 2,
        'service_posts' => $standardPosts
    ],
    [
        'partner_id' => $partners[2 % count($partners)]->id,
        'name' => 'Розділений графік - Одеса',
        'address' => 'Дерибасівська, 12, Одеса',
        'region' => 'Одеська область',
        'city' => 'Одеса',
        'lat' => 46.4825,
        'lng' => 30.7233,
        'working_hours' => $splitHours,
        'description' => 'Сервісний центр з обідньою перервою',
        'contact_info' => '+380 48 123-45-67',
        'is_active' => true,
        'num_posts' => 3,
        'service_posts' => $standardPosts
    ]
];

$created = 0;

foreach ($testServicePoints as $servicePointData) {
    // Convert service_posts to JSON string
    if (isset($servicePointData['service_posts'])) {
        $servicePointData['service_posts'] = json_encode($servicePointData['service_posts']);
    }
    
    // Check if similar service point already exists
    $exists = ServicePoint::where('name', $servicePointData['name'])
        ->where('city', $servicePointData['city'])
        ->exists();
    
    if ($exists) {
        echo "Skipping: {$servicePointData['name']} already exists\n";
        continue;
    }
    
    // Create the service point
    $servicePoint = ServicePoint::create($servicePointData);
    echo "Created: {$servicePoint->name}\n";
    $created++;
}

echo "\nCreated $created new test service points with various working hours.\n"; 