<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\ServicePoint;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition()
    {
        return [
            'service_point_id' => ServicePoint::factory(),
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'post_number' => $this->faker->numberBetween(1, 10),
            'slot_duration' => $this->faker->numberBetween(15, 60),
        ];
    }
}
