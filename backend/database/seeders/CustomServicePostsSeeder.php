<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServicePoint;
use App\Models\Post;

class CustomServicePostsSeeder extends Seeder
{
    /**
     * Run the database seeds to create service points with custom post durations.
     */
    public function run(): void
    {
        echo "Creating service points with custom post durations...\n";
        
        // Sample working hours
        $workingHours = [
            'monday' => '09:00-18:00',
            'tuesday' => '09:00-18:00',
            'wednesday' => '09:00-18:00',
            'thursday' => '09:00-18:00',
            'friday' => '09:00-18:00',
            'saturday' => '10:00-16:00',
            'sunday' => 'closed',
        ];
        
        // Create a special service point with custom post durations
        $testServicePoint = ServicePoint::create([
            'partner_id' => 1, // Assuming partner 1 exists
            'name' => 'Test Custom Posts',
            'address' => 'Test Address, Moscow',
            'region' => 'Moscow',
            'city' => 'Moscow',
            'lat' => 55.7558,
            'lng' => 37.6173,
            'working_hours' => json_encode($workingHours),
            'description' => 'Testing service point with custom post durations',
            'contact_info' => '+7 (495) 123-45-67',
            'is_active' => true,
            'num_posts' => 5,
            'service_posts' => json_encode([
                [
                    'name' => 'Express Post - 15 min',
                    'service_time_minutes' => 15
                ],
                [
                    'name' => 'Standard Post - 30 min',
                    'service_time_minutes' => 30
                ],
                [
                    'name' => 'Extended Post - 45 min',
                    'service_time_minutes' => 45
                ],
                [
                    'name' => 'Custom Post - 37 min',
                    'service_time_minutes' => 37
                ],
                [
                    'name' => 'Heavy Duty Post - 120 min',
                    'service_time_minutes' => 120
                ]
            ])
        ]);
        
        echo "Created service point with ID: {$testServicePoint->id}\n";
        
        // Create posts based on the service_posts data
        $servicePosts = json_decode($testServicePoint->service_posts, true);
        foreach ($servicePosts as $index => $postData) {
            Post::create([
                'service_point_id' => $testServicePoint->id,
                'name' => $postData['name'],
                'description' => "Custom service post with {$postData['service_time_minutes']} minute duration",
                'post_number' => $index + 1,
                'slot_duration' => $postData['service_time_minutes'],
            ]);
            
            echo "Created post: {$postData['name']} with {$postData['service_time_minutes']} minute duration\n";
        }
        
        echo "Custom service posts seeding completed!\n";
    }
} 