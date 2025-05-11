<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateTestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@tyreservice.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'role' => 'admin'
            ]
        );

        // Create partner user
        User::updateOrCreate(
            ['email' => 'partner@tyreservice.com'],
            [
                'name' => 'Partner User',
                'password' => Hash::make('password123'),
                'role' => 'partner'
            ]
        );

        // Create client user
        User::updateOrCreate(
            ['email' => 'client@tyreservice.com'],
            [
                'name' => 'Client User',
                'password' => Hash::make('password123'),
                'role' => 'client'
            ]
        );
        
        // Add simple test users with easy password for testing
        $simpleUsers = [
            [
                'email' => 'admin@example.com',
                'name' => 'Test Admin',
                'role' => 'admin'
            ],
            [
                'email' => 'partner@example.com',
                'name' => 'Test Partner',
                'role' => 'partner'
            ],
            [
                'email' => 'user@example.com',
                'name' => 'Test User',
                'role' => 'client'
            ],
            [
                'email' => 'demo@example.com',
                'name' => 'Demo User',
                'role' => 'client'
            ]
        ];
        
        foreach ($simpleUsers as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('password'),
                    'role' => $user['role'],
                    'email_verified_at' => now()
                ]
            );
        }

        $this->command->info('Test users created successfully.');
    }
} 