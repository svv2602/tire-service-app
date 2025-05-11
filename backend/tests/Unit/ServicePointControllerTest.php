<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\ServicePoint;
use App\Models\Partner;
use App\Services\MapService;
use Mockery;

class ServicePointControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic unit test example.
     */
    public function test_example(): void
    {
        $this->assertTrue(true);
    }

    public function test_store_service_point()
    {
        $partner = Partner::factory()->create();

        $mockMapService = Mockery::mock(MapService::class);
        $mockMapService->shouldReceive('geocodeAddress')->andReturn(['lat' => 50.4501, 'lng' => 30.5234]);
        $this->app->instance(MapService::class, $mockMapService);

        $response = $this->postJson('/api/service-points', [
            'partner_id' => $partner->id,
            'name' => 'Test Service Point',
            'address' => '123 Test Street',
            'lat' => 50.4501,
            'lng' => 30.5234,
            'working_hours' => json_encode([
                'monday' => '9:00-18:00',
                'tuesday' => '9:00-18:00',
                'wednesday' => '9:00-18:00',
                'thursday' => '9:00-18:00',
                'friday' => '9:00-18:00',
                'saturday' => '10:00-16:00',
                'sunday' => 'closed',
            ]),
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('service_points', [
            'partner_id' => $partner->id,
            'name' => 'Test Service Point',
            'address' => '123 Test Street',
        ]);

        // Проверка координат, возвращаемых Google Maps API
        $this->assertDatabaseHas('service_points', [
            'lat' => 50.4501,
            'lng' => 30.5234,
        ]);
    }
}
