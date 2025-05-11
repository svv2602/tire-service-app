<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\ServicePoint;
use App\Models\Partner;
use App\Services\MapService;
use Mockery;

class ServicePointApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_returns_active_and_inactive_service_points()
    {
        $partner = Partner::factory()->create();
        $active = ServicePoint::factory()->create(['partner_id' => $partner->id, 'is_active' => true]);
        $inactive = ServicePoint::factory()->create(['partner_id' => $partner->id, 'is_active' => false]);
        fwrite(STDERR, "Inactive point: " . json_encode($inactive->toArray()) . "\n");
        // Лог: все точки в базе
        $all = ServicePoint::all();
        fwrite(STDERR, "All points in DB: " . $all->toJson() . "\n");

        $response = $this->getJson('/api/v2/service-points?include_inactive=true');
        fwrite(STDERR, "API response: " . json_encode($response->json()) . "\n");
        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($active->id));
        $this->assertTrue($ids->contains($inactive->id));
    }

    public function test_api_returns_only_active_service_points_by_default()
    {
        $partner = Partner::factory()->create();
        $active = ServicePoint::factory()->create(['partner_id' => $partner->id, 'is_active' => true]);
        $inactive = ServicePoint::factory()->create(['partner_id' => $partner->id, 'is_active' => false]);
        fwrite(STDERR, "Inactive point: " . json_encode($inactive->toArray()) . "\n");
        $response = $this->getJson('/api/v2/service-points');
        fwrite(STDERR, "API response: " . json_encode($response->json()) . "\n");
        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($active->id));
        $this->assertFalse($ids->contains($inactive->id));
    }

    public function test_api_filter_and_getByPartnerId_return_inactive_points_when_requested()
    {
        $partner = Partner::factory()->create();
        $active = ServicePoint::factory()->create(['partner_id' => $partner->id, 'is_active' => true]);
        $inactive = ServicePoint::factory()->create(['partner_id' => $partner->id, 'is_active' => false]);
        fwrite(STDERR, "Inactive point: " . json_encode($inactive->toArray()) . "\n");
        // filter
        $response = $this->getJson("/api/v2/service-points/filter?partner_id={$partner->id}&include_inactive=true");
        fwrite(STDERR, "API filter response: " . json_encode($response->json()) . "\n");
        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($active->id));
        $this->assertTrue($ids->contains($inactive->id));

        // getByPartnerId
        $response = $this->getJson("/api/v2/service-points/partner/{$partner->id}?include_inactive=true");
        fwrite(STDERR, "API getByPartnerId response: " . json_encode($response->json()) . "\n");
        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($active->id));
        $this->assertTrue($ids->contains($inactive->id));
    }
}
