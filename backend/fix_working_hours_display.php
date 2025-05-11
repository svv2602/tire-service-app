<?php

// Initialize Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ServicePoint;

// Get all service points
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
    
    // Check if any day needs updating
    $needsUpdate = false;
    $updatedWorkingHours = [];
    
    foreach ($workingHours as $day => $hours) {
        if ($hours === 'closed' || $hours === 'выходной') {
            $updatedWorkingHours[$day] = $hours;
        } else if (is_array($hours) && isset($hours['open']) && isset($hours['close'])) {
            // Convert to old format string for better display
            $updatedWorkingHours[$day] = $hours['open'] . '-' . $hours['close'];
            $needsUpdate = true;
        } else if (is_string($hours)) {
            $updatedWorkingHours[$day] = $hours;
        } else {
            echo "Warning: Unrecognized format for $day\n";
            $updatedWorkingHours[$day] = 'closed';
            $needsUpdate = true;
        }
    }
    
    if ($needsUpdate) {
        $servicePoint->working_hours = $updatedWorkingHours;
        $servicePoint->save();
        echo "Updated service point #{$servicePoint->id}: {$servicePoint->name}\n";
        $updated++;
    } else {
        echo "No changes needed for service point #{$servicePoint->id}\n";
        $skipped++;
    }
}

echo "\nUpdate complete. Updated: {$updated}, Skipped: {$skipped}\n"; 