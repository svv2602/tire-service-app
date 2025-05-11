<?php

// This script updates working hours format for all service points

require __DIR__ . '/vendor/autoload.php';

// Initialize the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get all service points
use App\Models\ServicePoint;

$servicePoints = ServicePoint::all();

echo "Found " . $servicePoints->count() . " service points to update.\n";

$updated = 0;
$skipped = 0;

foreach ($servicePoints as $servicePoint) {
    $workingHours = $servicePoint->working_hours;
    
    // If it's a string, try to decode it
    if (is_string($workingHours)) {
        $workingHours = json_decode($workingHours, true);
    }
    
    if (!is_array($workingHours)) {
        echo "Skipping service point #{$servicePoint->id}: Invalid working_hours format\n";
        $skipped++;
        continue;
    }
    
    // Check if we need to convert
    $needsUpdate = false;
    
    foreach ($workingHours as $day => $hours) {
        // Skip if it's already in new format or is "closed"
        if ($hours === 'closed' || (is_array($hours) && isset($hours['open']) && isset($hours['close']))) {
            continue;
        }
        
        // If it's a string with hour format like "09:00-18:00"
        if (is_string($hours) && strpos($hours, '-') !== false) {
            list($start, $end) = explode('-', $hours);
            $workingHours[$day] = [
                'open' => trim($start),
                'close' => trim($end)
            ];
            $needsUpdate = true;
        }
    }
    
    if ($needsUpdate) {
        $servicePoint->working_hours = $workingHours;
        $servicePoint->save();
        echo "Updated service point #{$servicePoint->id}: {$servicePoint->name}\n";
        $updated++;
    } else {
        echo "Skipped service point #{$servicePoint->id}: Already in correct format\n";
        $skipped++;
    }
}

echo "\nUpdate complete. Updated: {$updated}, Skipped: {$skipped}\n"; 