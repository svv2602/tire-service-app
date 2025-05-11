<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\User;
use App\Models\ServicePoint;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get client users
        $clients = User::where('role', 'client')->get();
        
        // Ensure we have clients
        if ($clients->isEmpty()) {
            $this->command->error('No client users found. Please run UserSeeder first.');
            return;
        }
        
        // Get service points to ensure we have valid service_point_id values
        $servicePoints = ServicePoint::all();
        
        // Ensure we have service points
        if ($servicePoints->isEmpty()) {
            $this->command->error('No service points found. Please run ServicePointSeeder first.');
            return;
        }
        
        // Get some available schedules
        $schedules = Schedule::where('status', 'available')
            ->where('date', '>=', Carbon::today())
            ->where('date', '<=', Carbon::today()->addDays(7))
            ->take(20)
            ->get();
        
        // If we don't have enough schedules, create some
        if ($schedules->count() < 10) {
            $this->command->info('Creating some test schedules for bookings...');
            
            // If we have no schedules at all, create at least one minimal schedule for each service point
            if ($schedules->count() == 0) {
                $this->command->info('No schedules found. Creating minimal test schedules for each service point...');
                
                foreach ($servicePoints as $servicePoint) {
                    // Create 2 schedules per service point
                    for ($i = 0; $i < 2; $i++) {
                        $schedule = $this->createMinimalSchedule($servicePoint);
                        if ($schedule) {
                            $schedules->push($schedule);
                        }
                    }
                }
            }
            
            // Create 20 schedules over the next 7 days
            $schedulesToCreate = 20 - $schedules->count();
            
            for ($day = 0; $day < 7; $day++) {
                $date = Carbon::today()->addDays($day);
                $servicePoint = $servicePoints->random(); // Random service point
                
                for ($hour = 9; $hour < 18; $hour++) {
                    // Stop if we have enough schedules
                    if ($schedulesToCreate <= 0) break;
                    
                    // Create a schedule
                    $schedule = Schedule::create([
                        'service_point_id' => $servicePoint->id,
                        'date' => $date->format('Y-m-d'),
                        'time' => sprintf('%02d:00', $hour),
                        'status' => 'available',
                    ]);
                    
                    $schedules->push($schedule);
                    $schedulesToCreate--;
                    
                    if ($schedulesToCreate <= 0) break;
                }
            }
        }
            
        // Ukrainian car numbers
        $carNumbers = [
            'АА1234ВС', 'КА5678ВХ', 'АЕ9012ВК', 'ВІ3456СН', 'ВС7890АА',
            'АХ1122СС', 'ВТ3344ХА', 'СА5566ВВ', 'ВН7788АІ', 'АВ9900ЄЄ',
            'СВ1357КК', 'КІ2468ЄС', 'ЄС1470КН', 'КВ1293ВА', 'ВК4321СК'
        ];
        
        // Vehicle brand models (popular in Ukraine)
        $vehicleBrands = [
            'Volkswagen', 'Renault', 'Toyota', 'Skoda', 'Hyundai',
            'Kia', 'Ford', 'Chevrolet', 'Nissan', 'Mercedes-Benz',
            'BMW', 'Audi', 'Mazda', 'Mitsubishi', 'Opel'
        ];
        
        // Vehicle types
        $vehicleTypes = ['passenger', 'light_truck', 'suv', 'off_road'];
            
        // Create bookings for some of the schedules
        $count = min(count($schedules), 15); // Create up to 15 bookings
        
        $this->command->info("Creating {$count} test bookings...");
        
        for ($i = 0; $i < $count; $i++) {
            $schedule = $schedules[$i];
            $client = $clients->random(); // Get a random client
            $carNumber = $carNumbers[array_rand($carNumbers)];
            $vehicleBrand = $vehicleBrands[array_rand($vehicleBrands)];
            $vehicleType = $vehicleTypes[array_rand($vehicleTypes)];
            
            // Get the service point associated with this schedule or use a random one
            $servicePoint = null;
            try {
                $servicePoint = $schedule->servicePoint;
            } catch (\Exception $e) {
                // If there's no service point associated with the schedule, use a random one
                $servicePoint = $servicePoints->random();
            }
            
            if (!$servicePoint) {
                $servicePoint = $servicePoints->random();
            }
            
            try {
                // Create booking
                $booking = Booking::create([
                    'schedule_id' => $schedule->id,
                    'client_id' => $client->id,
                    'service_point_id' => $servicePoint->id,
                    'full_name' => $client->name,
                    'phone' => '+380' . rand(50, 99) . rand(1000000, 9999999), // Ukrainian mobile format
                    'car_number' => $carNumber,
                    'vehicle_brand' => $vehicleBrand,
                    'vehicle_type' => $vehicleType,
                    'notes' => 'Створено автоматично для тестування'
                ]);
                
                // Update schedule status
                $schedule->markAsBooked();
                
                // For some bookings, mark them as completed or cancelled
                if ($i < 5) {
                    $schedule->markAsCompleted();
                } elseif ($i > 10) {
                    $schedule->markAsCancelled();
                }
            } catch (\Exception $e) {
                $this->command->error("Error creating booking for schedule {$schedule->id}: " . $e->getMessage());
            }
        }
        
        $this->command->info('Finished creating test bookings.');
    }

    /**
     * Create a minimal test schedule if one doesn't exist
     */
    private function createMinimalSchedule($servicePoint)
    {
        $date = Carbon::today()->addDays(rand(1, 7))->format('Y-m-d');
        $time = sprintf('%02d:00', rand(9, 17)); // Random hour between 9 AM and 5 PM
        
        // Check if we need to include start_time and end_time columns
        $hasStartTime = Schema::hasColumn('schedules', 'start_time');
        $hasEndTime = Schema::hasColumn('schedules', 'end_time');
        $hasTime = Schema::hasColumn('schedules', 'time');
        
        // Create base schedule data
        $scheduleData = [
            'service_point_id' => $servicePoint->id,
            'post_number' => 1,
            'date' => $date,
            'status' => 'available',
        ];
        
        // Add the appropriate time columns
        if ($hasTime) {
            $scheduleData['time'] = $time;
        }
        
        if ($hasStartTime && $hasEndTime) {
            $endTime = Carbon::createFromFormat('H:i', $time)->addMinutes(30)->format('H:i');
            $scheduleData['start_time'] = $time;
            $scheduleData['end_time'] = $endTime;
        }
        
        try {
            $schedule = Schedule::create($scheduleData);
            $this->command->info("Created minimal test schedule for service point {$servicePoint->id} on {$date} at {$time}");
            return $schedule;
        } catch (\Exception $e) {
            $this->command->error("Failed to create minimal schedule: " . $e->getMessage());
            return null;
        }
    }
} 