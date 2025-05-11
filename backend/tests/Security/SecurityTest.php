<?php

namespace Tests\Security;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_sql_injection_protection()
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->actingAs($user)->getJson('/api/partners?filter=1%27%20OR%20%271%27=%271');

        $response->assertStatus(400);
        $this->assertStringNotContainsString('SQL', $response->getContent());
    }

    public function test_xss_protection()
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->actingAs($user)->postJson('/api/partners', [
            'company_name' => '<script>alert("XSS")</script>',
            'contact_person' => 'John Doe',
            'email' => 'partner@example.com',
            'phone' => '1234567890',
            'status' => 'active',
        ]);

        $response->assertStatus(400);
        $this->assertStringNotContainsString('<script>', $response->getContent());
    }
}