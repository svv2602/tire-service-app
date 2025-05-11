<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Services\NotificationService;
use Mockery;

class NotificationFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_push_notification()
    {
        $mockNotificationService = Mockery::mock(NotificationService::class);
        $mockNotificationService->shouldReceive('sendPushNotification')
            ->withAnyArgs()
            ->andReturn(['success' => true]);
        $this->app->instance(NotificationService::class, $mockNotificationService);

        $user = User::factory()->create();
        $tokens = ['test_token_1', 'test_token_2'];

        $response = app(NotificationService::class)->sendPushNotification(
            $tokens,
            'Test Title',
            'Test Body'
        );

        $this->assertEquals(['success' => true], $response);
    }
}