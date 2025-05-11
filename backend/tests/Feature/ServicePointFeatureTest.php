<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\ServicePoint;
use App\Models\Partner;
use App\Services\MapService;
use Mockery;

class ServicePointFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_service_point_flow()
    {
        $partner = Partner::factory()->create();

        $mockMapService = Mockery::mock(MapService::class);
        $mockMapService->shouldReceive('geocodeAddress')->andReturn(['lat' => 50.4501, 'lng' => 30.5234]);
        $this->app->instance(MapService::class, $mockMapService);

        $response = $this->postJson('/api/service-points', [
            'partner_id' => $partner->id,
            'name' => 'Test Service Point',
            'address' => '123 Test Street',
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

        // Проверка обновления торговой точки
        $servicePoint = ServicePoint::first();
        $updateResponse = $this->putJson("/api/service-points/{$servicePoint->id}", [
            'name' => 'Updated Service Point',
        ]);

        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('service_points', [
            'id' => $servicePoint->id,
            'name' => 'Updated Service Point',
        ]);

        // Проверка удаления торговой точки
        $deleteResponse = $this->deleteJson("/api/service-points/{$servicePoint->id}");
        $deleteResponse->assertStatus(204);
        
        // Проверяем soft delete
        $this->assertSoftDeleted('service_points', [
            'id' => $servicePoint->id,
        ]);
    }
}