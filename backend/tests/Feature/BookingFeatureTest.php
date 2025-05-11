<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\User;
use App\Models\ServicePoint;
use App\Models\Partner;
use App\Services\NotificationService;
use Mockery;

class BookingFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_booking_flow()
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $partner = User::factory()->create(['role' => 'partner']);
        $partnerModel = Partner::factory()->create(['user_id' => $partner->id]);
        
        $servicePoint = ServicePoint::factory()->create([
            'partner_id' => $partnerModel->id,
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

        $schedule = Schedule::factory()->create([
            'service_point_id' => $servicePoint->id,
            'date' => now()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'status' => 'available',
        ]);

        $mockNotificationService = Mockery::mock(NotificationService::class);
        $this->app->instance(NotificationService::class, $mockNotificationService);
        $mockNotificationService->shouldReceive('sendPushNotification')->andReturn(['success' => true]);

        $response = $this->actingAsWithRole($user)
                        ->postJson('/api/v1/bookings', [
            'schedule_id' => $schedule->id,
            'client_id' => $user->id,
            'full_name' => 'Test User',
            'phone' => '1234567890',
            'car_number' => 'ABC123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('bookings', [
            'schedule_id' => $schedule->id,
            'client_id' => $user->id,
            'full_name' => 'Test User',
        ]);

        // Проверка отправки уведомлений
        // Здесь можно добавить мок для NotificationService и проверить вызов метода sendPushNotification
    }
}