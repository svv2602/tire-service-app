<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TestSingleUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First log the database connection info
        $connection = DB::connection()->getDatabaseName();
        $this->command->info('Connected to database: ' . $connection);
        
        // Check if the users table exists
        $tableExists = DB::getSchemaBuilder()->hasTable('users');
        $this->command->info('Users table exists: ' . ($tableExists ? 'Yes' : 'No'));
        
        // Count existing users
        $usersCount = User::count();
        $this->command->info('Current user count: ' . $usersCount);
        
        // List existing users
        $existingUsers = User::all(['id', 'email'])->toArray();
        $this->command->info('Existing users: ' . json_encode($existingUsers));
        
        // Create a test user
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
        
        $this->command->info('Test user created with ID: ' . $user->id);
        
        // Verify the user exists
        $testUser = User::where('email', 'test@example.com')->first();
        if ($testUser) {
            $this->command->info('Successfully verified user exists in database');
            $this->command->info('User data: ' . json_encode($testUser->toArray()));
        } else {
            $this->command->error('Failed to find the created user!');
        }
        
        // Test finding a user by specific email
        $specificUser = User::where('email', 'admin@tyreservice.com')->first();
        if ($specificUser) {
            $this->command->info('Found admin@tyreservice.com user with ID: ' . $specificUser->id);
        } else {
            $this->command->error('admin@tyreservice.com user not found');
        }
    }
}
