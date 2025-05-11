<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\ServicePoint;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $servicePoints = ServicePoint::all();

        foreach ($servicePoints as $servicePoint) {
            // Check if service_posts data exists
            $servicePosts = null;
            if ($servicePoint->service_posts) {
                if (is_string($servicePoint->service_posts)) {
                    $servicePosts = json_decode($servicePoint->service_posts, true);
                } else {
                    $servicePosts = $servicePoint->service_posts;
                }
            }
            
            // If we have service_posts data, use it to create the posts
            if ($servicePosts && is_array($servicePosts)) {
                foreach ($servicePosts as $index => $postData) {
                    Post::create([
                        'service_point_id' => $servicePoint->id,
                        'name' => $postData['name'] ?? "Пост " . ($index + 1),
                        'description' => "Шиномонтажный пост в " . $servicePoint->name,
                        'post_number' => $index + 1,
                        'slot_duration' => $postData['service_time_minutes'] ?? 30,
                    ]);
                }
            } else {
                // Fallback to the old way if no service_posts data
                $numPosts = $servicePoint->num_posts ?? rand(2, 4);
                
                for ($i = 1; $i <= $numPosts; $i++) {
                    Post::create([
                        'service_point_id' => $servicePoint->id,
                        'name' => "Пост $i",
                        'description' => "Шиномонтажный пост $i в " . $servicePoint->name,
                        'post_number' => $i,
                        'slot_duration' => 30, // 30 minutes per slot
                    ]);
                }
            }
        }
    }
} 