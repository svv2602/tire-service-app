<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Адміністратор',
            'email' => 'admin@tyreservice.ua',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Partner users
        $partners = [
            [
                'name' => 'Олександр Іваненко',
                'email' => 'partner1@tyreservice.ua',
                'password' => Hash::make('password'),
                'role' => 'partner',
            ],
            [
                'name' => 'Катерина Коваленко',
                'email' => 'partner2@tyreservice.ua',
                'password' => Hash::make('password'),
                'role' => 'partner',
            ],
            [
                'name' => 'Сергій Петренко',
                'email' => 'partner3@tyreservice.ua',
                'password' => Hash::make('password'),
                'role' => 'partner',
            ],
        ];

        foreach ($partners as $partner) {
            User::create($partner);
        }

        // Client users
        $clients = [
            [
                'name' => 'Максим Шевченко',
                'email' => 'client1@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'client',
            ],
            [
                'name' => 'Анна Бондаренко',
                'email' => 'client2@ukr.net',
                'password' => Hash::make('password'),
                'role' => 'client',
            ],
            [
                'name' => 'Ігор Ткаченко',
                'email' => 'client3@meta.ua',
                'password' => Hash::make('password'),
                'role' => 'client',
            ],
            [
                'name' => 'Оксана Мельник',
                'email' => 'client4@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'client',
            ],
            [
                'name' => 'Тарас Лисенко',
                'email' => 'client5@ukr.net',
                'password' => Hash::make('password'),
                'role' => 'client',
            ],
        ];

        foreach ($clients as $client) {
            User::create($client);
        }
    }
} 