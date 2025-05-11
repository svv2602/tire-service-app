<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\ServicePoint;
use App\Models\Schedule;
use App\Models\Partner;
use App\Models\User;
use Carbon\Carbon;

class ScheduleFeatureTest extends TestCase
{
    use RefreshDatabase;

    private $partner;
    private $servicePoint;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->partner = User::factory()->create(['role' => 'partner']);
        $partnerModel = Partner::factory()->create(['user_id' => $this->partner->id]);
        
        $this->servicePoint = ServicePoint::factory()->create([
            'working_hours' => [
                'monday' => '9:00-18:00',
                'tuesday' => '9:00-18:00',
                'wednesday' => '9:00-18:00',
                'thursday' => '9:00-18:00',
                'friday' => '9:00-18:00',
                'saturday' => '10:00-16:00',
                'sunday' => 'closed',
            ],
            'partner_id' => $partnerModel->id,
        ]);
    }

    public function test_generate_schedule()
    {
        $response = $this->actingAsWithRole($this->partner)
            ->postJson("/api/v1/service-points/{$this->servicePoint->id}/generate-schedule", [
                'post_number' => 1,
                'slot_duration' => 60,
                'date' => Carbon::tomorrow()->toDateString()
            ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('schedules', [
            'service_point_id' => $this->servicePoint->id,
            'post_number' => 1,
            'date' => Carbon::tomorrow()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'status' => 'available'
        ]);
    }

    public function test_schedule_status_transitions()
    {
        $schedule = Schedule::factory()->available()->create([
            'service_point_id' => $this->servicePoint->id,
            'post_number' => 1,
            'date' => Carbon::tomorrow()->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00'
        ]);

        // Test booking
        $response = $this->actingAsWithRole($this->partner)
            ->postJson("/api/v1/schedules/{$schedule->id}/book");
        
        $response->assertStatus(200);
        $this->assertEquals('booked', $schedule->fresh()->status);

        // Test completing
        $response = $this->actingAsWithRole($this->partner)
            ->postJson("/api/v1/schedules/{$schedule->id}/complete");
        
        $response->assertStatus(200);
        $this->assertEquals('completed', $schedule->fresh()->status);
    }

    public function test_validate_schedule_creation()
    {
        $response = $this->actingAsWithRole($this->partner)
            ->postJson("/api/v1/service-points/{$this->servicePoint->id}/generate-schedule", [
                'post_number' => 0, // Invalid post number
                'slot_duration' => 60,
                'date' => Carbon::yesterday()->toDateString() // Past date
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['post_number', 'date']);
    }

    public function test_get_available_slots()
    {
        // Create some test schedules
        Schedule::factory()->count(3)->available()->create([
            'service_point_id' => $this->servicePoint->id,
            'date' => Carbon::tomorrow()->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00'
        ]);

        Schedule::factory()->count(2)->booked()->create([
            'service_point_id' => $this->servicePoint->id,
            'date' => Carbon::tomorrow()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00'
        ]);

        $response = $this->actingAsWithRole($this->partner)
            ->getJson("/api/v1/service-points/{$this->servicePoint->id}/available-slots?" . 
                     "date=" . Carbon::tomorrow()->toDateString());

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonFragment(['status' => 'available']);
    }
}