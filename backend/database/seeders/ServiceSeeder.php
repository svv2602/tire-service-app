<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Сезонная замена шин',
                'description' => 'Снятие и установка колес, балансировка, проверка давления.',
                'is_active' => true,
            ],
            [
                'name' => 'Ремонт проколов',
                'description' => 'Восстановление герметичности шин после прокола.',
                'is_active' => true,
            ],
            [
                'name' => 'Балансировка колес',
                'description' => 'Динамическая и статическая балансировка колес.',
                'is_active' => true,
            ],
            [
                'name' => 'Шиномонтаж RunFlat',
                'description' => 'Монтаж и демонтаж шин RunFlat с использованием спецоборудования.',
                'is_active' => true,
            ],
            [
                'name' => 'Хранение шин',
                'description' => 'Сезонное хранение шин и колес на складе.',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(['name' => $service['name']], $service);
        }
    }
}
