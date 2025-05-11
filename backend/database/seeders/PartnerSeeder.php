<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Partner;
use App\Models\User;

class PartnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get partner users
        $partnerUsers = User::where('role', 'partner')->get();

        // Create partner data with Ukrainian names and contacts
        $partnerData = [
            [
                'company_name' => 'ШинСервіс',
                'contact_person' => 'Олександр Іваненко',
                'phone' => '+380501112233',
                'status' => 'active',
            ],
            [
                'company_name' => 'АвтоШина Плюс',
                'contact_person' => 'Катерина Коваленко',
                'phone' => '+380672223344',
                'status' => 'active',
            ],
            [
                'company_name' => 'МастерКолес',
                'contact_person' => 'Сергій Петренко',
                'phone' => '+380633334455',
                'status' => 'active',
            ],
        ];

        foreach ($partnerUsers as $index => $user) {
            if (isset($partnerData[$index])) {
                Partner::create([
                    'user_id' => $user->id,
                    'company_name' => $partnerData[$index]['company_name'],
                    'contact_person' => $partnerData[$index]['contact_person'],
                    'phone' => $partnerData[$index]['phone'],
                    'status' => $partnerData[$index]['status'],
                ]);
            }
        }
    }
} 