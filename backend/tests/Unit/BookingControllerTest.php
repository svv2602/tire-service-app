<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\User;
use App\Services\NotificationService;
use Mockery;

class BookingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_booking()
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $schedule = Schedule::factory()->create();

        $mockNotificationService = Mockery::mock(NotificationService::class);
        $this->app->instance(NotificationService::class, $mockNotificationService);
        $mockNotificationService->shouldReceive('sendPushNotification')->andReturn(['success' => true]);

        $response = $this->actingAs($user)->postJson('/api/bookings', [
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
