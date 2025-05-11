<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServicePoint;
use App\Models\Partner;

class ServicePointSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $partners = Partner::all();

        // Sample working hours format
        $workingHours = [
            'monday' => ['open' => '09:00', 'close' => '18:00'],
            'tuesday' => ['open' => '09:00', 'close' => '18:00'],
            'wednesday' => ['open' => '09:00', 'close' => '18:00'],
            'thursday' => ['open' => '09:00', 'close' => '18:00'],
            'friday' => ['open' => '09:00', 'close' => '18:00'],
            'saturday' => ['open' => '10:00', 'close' => '16:00'],
            'sunday' => 'closed',
        ];

        $workingHours2 = [
            'monday' => ['open' => '08:30', 'close' => '19:00'],
            'tuesday' => ['open' => '08:30', 'close' => '19:00'],
            'wednesday' => ['open' => '08:30', 'close' => '19:00'],
            'thursday' => ['open' => '08:30', 'close' => '19:00'],
            'friday' => ['open' => '08:30', 'close' => '19:00'],
            'saturday' => ['open' => '09:00', 'close' => '17:00'],
            'sunday' => ['open' => '10:00', 'close' => '15:00'],
        ];

        // Sample service posts with custom time durations
        $servicePosts1 = [
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

        $servicePosts2 = [
            [
                'name' => 'Експрес-шиномонтаж',
                'service_time_minutes' => 25
            ],
            [
                'name' => 'Стандартний пост',
                'service_time_minutes' => 40
            ]
        ];

        $servicePosts3 = [
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

        $servicePoints = [
            // Partner 1's service points
            [
                'partner_id' => 1,
                'name' => 'ШинСервіс - Центр',
                'address' => 'вул. Хрещатик, 15, Київ',
                'region' => 'Київська область',
                'city' => 'Київ',
                'lat' => 50.4501,
                'lng' => 30.5234,
                'working_hours' => $workingHours,
                'description' => 'Центральний шиномонтаж з повним спектром послуг',
                'contact_info' => '+380 44 123-45-67',
                'is_active' => true,
                'num_posts' => 3,
                'service_posts' => $servicePosts1
            ],
            [
                'partner_id' => 1,
                'name' => 'ШинСервіс - Південь',
                'address' => 'вул. Велика Васильківська, 72, Київ',
                'region' => 'Київська область',
                'city' => 'Київ',
                'lat' => 50.4367,
                'lng' => 30.5185,
                'working_hours' => $workingHours2,
                'description' => 'Південний філіал з розширеними годинами роботи',
                'contact_info' => '+380 44 765-43-21',
                'is_active' => true,
                'num_posts' => 2,
                'service_posts' => $servicePosts2
            ],
            
            // Partner 2's service points
            [
                'partner_id' => 2,
                'name' => 'АвтоШина Плюс - Північ',
                'address' => 'просп. Перемоги, 75, Київ',
                'region' => 'Київська область',
                'city' => 'Київ',
                'lat' => 50.4612,
                'lng' => 30.4123,
                'working_hours' => $workingHours,
                'description' => 'Сучасний шинний центр на півночі міста',
                'contact_info' => '+380 44 222-33-44',
                'is_active' => true,
                'num_posts' => 4,
                'service_posts' => $servicePosts3
            ],
            
            // Partner 3's service points
            [
                'partner_id' => 3,
                'name' => 'МастерКолес - Захід',
                'address' => 'вул. Володимирська, 32, Київ',
                'region' => 'Київська область',
                'city' => 'Київ',
                'lat' => 50.4412,
                'lng' => 30.5117,
                'working_hours' => $workingHours,
                'description' => 'Преміальний центр обслуговування в центрі міста',
                'contact_info' => '+380 44 987-65-43',
                'is_active' => true,
                'num_posts' => 3,
                'service_posts' => $servicePosts1
            ],
            [
                'partner_id' => 3,
                'name' => 'МастерКолес - Схід',
                'address' => 'вул. Раїси Окіпної, 10, Київ',
                'region' => 'Київська область',
                'city' => 'Київ',
                'lat' => 50.4518,
                'lng' => 30.5961,
                'working_hours' => $workingHours2,
                'description' => 'Східний філіал з повним комплексом послуг',
                'contact_info' => '+380 44 567-89-01',
                'is_active' => true,
                'num_posts' => 2,
                'service_posts' => $servicePosts2
            ],
            
            // Additional service point in Lviv
            [
                'partner_id' => 2,
                'name' => 'АвтоШина Плюс - Львів',
                'address' => 'вул. Степана Бандери, 11, Львів',
                'region' => 'Львівська область',
                'city' => 'Львів',
                'lat' => 49.8397,
                'lng' => 24.0297,
                'working_hours' => $workingHours,
                'description' => 'Філіал у Львові з повним спектром послуг',
                'contact_info' => '+380 32 345-67-89',
                'is_active' => true,
                'num_posts' => 3,
                'service_posts' => [
                    [
                        'name' => 'Пост 1 Львів',
                        'service_time_minutes' => 35
                    ],
                    [
                        'name' => 'Пост 2 Львів',
                        'service_time_minutes' => 50
                    ],
                    [
                        'name' => 'Пост 3 Львів',
                        'service_time_minutes' => 70
                    ]
                ]
            ],
            // Additional service point in Odesa
            [
                'partner_id' => 1,
                'name' => 'ШинСервіс - Одеса',
                'address' => 'вул. Дерибасівська, 21, Одеса',
                'region' => 'Одеська область',
                'city' => 'Одеса',
                'lat' => 46.4825,
                'lng' => 30.7233,
                'working_hours' => $workingHours,
                'description' => 'Філіал в Одесі з повним спектром послуг',
                'contact_info' => '+380 48 765-43-21',
                'is_active' => true,
                'num_posts' => 3,
                'service_posts' => [
                    [
                        'name' => 'Пост 1 Одеса',
                        'service_time_minutes' => 30
                    ],
                    [
                        'name' => 'Пост 2 Одеса',
                        'service_time_minutes' => 45
                    ],
                    [
                        'name' => 'Пост 3 Одеса',
                        'service_time_minutes' => 60
                    ]
                ]
            ],
        ];

        foreach ($servicePoints as $servicePoint) {
            // Convert service_posts to JSON string
            if (isset($servicePoint['service_posts'])) {
                $servicePoint['service_posts'] = json_encode($servicePoint['service_posts']);
            }
            
            ServicePoint::create($servicePoint);
        }
    }
} 