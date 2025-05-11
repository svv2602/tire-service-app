<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Important: Order matters because of foreign key constraints
        $this->call([
            UserSeeder::class,        // First create users
            CreateTestUserSeeder::class, // Test users with known credentials
            PartnerSeeder::class,     // Then partners linked to users
            ServiceSeeder::class,      // Add test tire services
            ServicePointSeeder::class, // Then service points linked to partners
            PostSeeder::class,        // Then posts linked to service points
            ScheduleSeeder::class,    // Then schedules linked to service points and posts
            BookingSeeder::class,     // Finally bookings linked to schedules and users
            
            // Custom service posts seeder
            // This creates a special service point with custom post durations for testing
            CustomServicePostsSeeder::class,
        ]);
    }
}
