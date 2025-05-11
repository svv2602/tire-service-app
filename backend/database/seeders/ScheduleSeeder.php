<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Schedule;
use App\Models\ServicePoint;
use App\Models\Post;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if Post model is available in the system
        $postModelExists = Schema::hasTable('posts');
        
        // Get all service points
        $servicePoints = ServicePoint::all();
        
        // Generate schedules for the next 14 days
        $startDate = Carbon::today();
        $endDate = Carbon::today()->addDays(14);

        if ($postModelExists && Post::count() > 0) {
            // If we have posts, use them for scheduling
            $this->createSchedulesFromPosts($startDate, $endDate);
        } else {
            // Otherwise create schedules directly from service points
            $this->createSchedulesFromServicePoints($servicePoints, $startDate, $endDate);
        }
    }
    
    /**
     * Create schedules using Posts model
     */
    private function createSchedulesFromPosts($startDate, $endDate)
    {
        $posts = Post::all();
        
        $this->command->info('Creating schedules from posts for the next 14 days...');
        
        // Check schedule table structure to determine which columns to use
        $hasTimeColumn = Schema::hasColumn('schedules', 'time');
        $hasStartEndTime = Schema::hasColumn('schedules', 'start_time') && Schema::hasColumn('schedules', 'end_time');
        
        foreach ($posts as $post) {
            $servicePoint = ServicePoint::find($post->service_point_id);
            if (!$servicePoint) {
                continue; // Skip if service point doesn't exist
            }

            // Decode working hours if stored as JSON string
            $workingHoursData = $servicePoint->working_hours;
            if (is_string($workingHoursData)) {
                $workingHoursData = json_decode($workingHoursData, true);
            }
            
            // If decoding failed, skip this service point
            if (!$workingHoursData || !is_array($workingHoursData)) {
                continue;
            }

            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                $dayOfWeek = strtolower($date->format('l'));
                $workingHours = $workingHoursData[$dayOfWeek] ?? null;

                // Skip if service point is closed on this day
                if ($workingHours === 'closed' || $workingHours === null) {
                    continue;
                }

                // Convert working hours to Carbon instances based on format
                if (is_array($workingHours) && isset($workingHours['open']) && isset($workingHours['close'])) {
                    // New format with open/close keys
                    $openTime = Carbon::parse($date->format('Y-m-d') . ' ' . $workingHours['open']);
                    $closeTime = Carbon::parse($date->format('Y-m-d') . ' ' . $workingHours['close']);
                } else if (is_string($workingHours) && strpos($workingHours, '-') !== false) {
                    // Old format with "XX:XX-YY:YY" string
                    list($openTimeStr, $closeTimeStr) = explode('-', $workingHours);
                    $openTime = Carbon::parse($date->format('Y-m-d') . ' ' . trim($openTimeStr));
                    $closeTime = Carbon::parse($date->format('Y-m-d') . ' ' . trim($closeTimeStr));
                } else {
                    // Unknown format, skip this day
                    continue;
                }

                // Get slot duration from the post (from service_time_minutes or default 30)
                $slotDuration = $post->slot_duration ?? 30;
                
                // Generate time slots based on post's slot_duration
                for ($time = $openTime->copy(); $time->lt($closeTime); $time->addMinutes($slotDuration)) {
                    $endTime = $time->copy()->addMinutes($slotDuration);
                    
                    // Skip if end time exceeds closing time
                    if ($endTime->gt($closeTime)) {
                        break;
                    }

                    // Create schedule data based on table structure
                    $scheduleData = [
                        'service_point_id' => $servicePoint->id,
                        'post_number' => $post->post_number,
                        'date' => $date->format('Y-m-d'),
                        'status' => 'available',
                    ];
                    
                    // Add appropriate time columns based on table structure
                    if ($hasTimeColumn) {
                        $scheduleData['time'] = $time->format('H:i');
                    }
                    
                    if ($hasStartEndTime) {
                        $scheduleData['start_time'] = $time->format('H:i');
                        $scheduleData['end_time'] = $endTime->format('H:i');
                    }
                    
                    try {
                        Schedule::create($scheduleData);
                    } catch (\Exception $e) {
                        // Log error but continue with other schedules
                        $this->command->error("Error creating schedule for {$servicePoint->name}, post {$post->post_number}: " . $e->getMessage());
                    }
                }
            }
        }
    }
    
    /**
     * Create schedules directly from service points (if Posts don't exist)
     */
    private function createSchedulesFromServicePoints($servicePoints, $startDate, $endDate)
    {
        $this->command->info('Creating schedules directly from service points for the next 14 days...');
        
        // Check schedule table structure to determine which columns to use
        $hasTimeColumn = Schema::hasColumn('schedules', 'time');
        $hasStartEndTime = Schema::hasColumn('schedules', 'start_time') && Schema::hasColumn('schedules', 'end_time');
        
        foreach ($servicePoints as $servicePoint) {
            // Decode working hours if stored as JSON string
            $workingHoursData = $servicePoint->working_hours;
            if (is_string($workingHoursData)) {
                $workingHoursData = json_decode($workingHoursData, true);
            }
            
            // If decoding failed, skip this service point
            if (!$workingHoursData || !is_array($workingHoursData)) {
                continue;
            }
            
            // Default number of posts
            $numPosts = $servicePoint->num_posts ?? 3;
            
            // Get service posts info if available
            $servicePosts = [];
            if ($servicePoint->service_posts) {
                $postsData = is_string($servicePoint->service_posts) 
                    ? json_decode($servicePoint->service_posts, true) 
                    : $servicePoint->service_posts;
                    
                if (is_array($postsData)) {
                    $servicePosts = $postsData;
                }
            }
            
            // If no service posts data, create default data
            if (empty($servicePosts)) {
                for ($i = 1; $i <= $numPosts; $i++) {
                    $servicePosts[] = [
                        'name' => "Пост {$i}",
                        'service_time_minutes' => 30
                    ];
                }
            }
            
            // For each post, create schedules
            foreach ($servicePosts as $postIndex => $postData) {
                $postNumber = $postIndex + 1;
                $slotDuration = $postData['service_time_minutes'] ?? 30;
                
                for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                    $dayOfWeek = strtolower($date->format('l'));
                    $workingHours = $workingHoursData[$dayOfWeek] ?? null;
    
                    // Skip if service point is closed on this day
                    if ($workingHours === 'closed' || $workingHours === null) {
                        continue;
                    }
    
                    // Get opening and closing times
                    if (is_array($workingHours) && isset($workingHours['open']) && isset($workingHours['close'])) {
                        $openTime = Carbon::parse($date->format('Y-m-d') . ' ' . $workingHours['open']);
                        $closeTime = Carbon::parse($date->format('Y-m-d') . ' ' . $workingHours['close']);
                    } else {
                        // Skip unknown format
                        continue;
                    }
    
                    // Generate time slots based on post's service_time_minutes
                    for ($time = $openTime->copy(); $time->lt($closeTime); $time->addMinutes($slotDuration)) {
                        $timeString = $time->format('H:i');
                        $endTimeString = $time->copy()->addMinutes($slotDuration)->format('H:i');
                        
                        // Create schedule data based on table structure
                        $scheduleData = [
                            'service_point_id' => $servicePoint->id,
                            'post_number' => $postNumber,
                            'date' => $date->format('Y-m-d'),
                            'status' => 'available',
                        ];
                        
                        // Add appropriate time columns based on table structure
                        if ($hasTimeColumn) {
                            $scheduleData['time'] = $timeString;
                        }
                        
                        if ($hasStartEndTime) {
                            $scheduleData['start_time'] = $timeString;
                            $scheduleData['end_time'] = $endTimeString;
                        }
                        
                        try {
                            Schedule::create($scheduleData);
                        } catch (\Exception $e) {
                            // Log error but continue with other schedules
                            $this->command->error("Error creating schedule for {$servicePoint->name}, post {$postNumber}: " . $e->getMessage());
                        }
                    }
                }
            }
        }
    }
} 