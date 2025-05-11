<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Partner;
use App\Models\User;
use App\Services\NotificationService;
use Mockery;

class PartnerFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_partner()
    {
        $response = $this->get('/test-root');
        $response->dump();

        $admin = User::factory()->create(['role' => 'admin']);
        
        $mockNotificationService = Mockery::mock(NotificationService::class);
        $mockNotificationService->shouldReceive('sendPushNotification')->andReturn(['success' => true]);
        $this->app->instance(NotificationService::class, $mockNotificationService);

        $response = $this->actingAsWithRole($admin)
                        ->postJson('/api/v1/partners', [
            'company_name' => 'Test Company',
            'contact_person' => 'John Doe',
            'email' => 'partner@example.com',
            'phone' => '1234567890',
            'status' => 'active',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('partners', [
            'company_name' => 'Test Company',
            'contact_person' => 'John Doe',
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'partner@example.com',
        ]);

        $response = $this->get('/api/v1/test-route');
        $response->dump();
    }

    public function test_deactivate_partner()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $partner = Partner::factory()->create(['status' => 'active']);

        $response = $this->actingAsWithRole($admin)
                        ->patchJson("/api/v1/partners/{$partner->id}/deactivate");

        $response->assertStatus(200);
        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'status' => 'inactive',
        ]);
    }

    public function test_delete_partner()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $partner = Partner::factory()->create();

        $response = $this->actingAsWithRole($admin)
                        ->deleteJson("/api/v1/partners/{$partner->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('partners', [
            'id' => $partner->id,
        ]);
    }
}