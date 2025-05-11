<?php

namespace Database\Factories;

use App\Models\Schedule;
use App\Models\ServicePoint;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    public function definition()
    {
        $startTime = Carbon::now()->addHours(rand(1, 48));
        $endTime = (clone $startTime)->addMinutes(rand(30, 120));

        return [
            'service_point_id' => ServicePoint::factory(),
            'post_number' => $this->faker->numberBetween(1, 5),
            'date' => $startTime->toDateString(),
            'start_time' => $startTime->format('H:i'),
            'end_time' => $endTime->format('H:i'),
            'status' => $this->faker->randomElement(['available', 'booked', 'completed', 'cancelled']),
            'metadata' => [
                'created_by' => 'system',
                'notes' => $this->faker->sentence(),
                'service_type' => $this->faker->randomElement(['standard', 'premium', 'express'])
            ]
        ];
    }

    public function available()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'available'
            ];
        });
    }

    public function booked()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'booked'
            ];
        });
    }

    public function completed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed'
            ];
        });
    }
}
