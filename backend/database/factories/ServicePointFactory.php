<?php

namespace Database\Factories;

use App\Models\ServicePoint;
use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServicePointFactory extends Factory
{
    protected $model = ServicePoint::class;

    public function definition()
    {
        return [
            'partner_id' => Partner::factory(),
            'name' => $this->faker->company(),
            'address' => $this->faker->address(),
            'lat' => $this->faker->latitude(),
            'lng' => $this->faker->longitude(),
            'working_hours' => [
                'monday' => '9:00-18:00',
                'tuesday' => '9:00-18:00',
                'wednesday' => '9:00-18:00',
                'thursday' => '9:00-18:00',
                'friday' => '9:00-18:00',
                'saturday' => '10:00-16:00',
                'sunday' => 'closed'
            ],
            'is_active' => true,
        ];
    }

    public function withCustomHours(array $hours)
    {
        return $this->state(function (array $attributes) use ($hours) {
            return [
                'working_hours' => $hours
            ];
        });
    }
}
