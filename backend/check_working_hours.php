<?php

// Script to check service point working hours format

require __DIR__ . '/vendor/autoload.php';

// Initialize the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ServicePoint;

// Get all service points
$servicePoints = ServicePoint::all();

echo "Found " . $servicePoints->count() . " service points\n\n";

foreach ($servicePoints as $index => $servicePoint) {
    echo "Service Point #{$servicePoint->id}: {$servicePoint->name}\n";
    echo "Working Hours Type: " . gettype($servicePoint->working_hours) . "\n";
    
    $workingHours = $servicePoint->working_hours;
    
    // If it's a string, try to decode it
    if (is_string($workingHours)) {
        echo "Converting from string...\n";
        $workingHours = json_decode($workingHours, true);
        echo "After decode: " . gettype($workingHours) . "\n";
    }
    
    if (is_array($workingHours)) {
        echo "Days of week: " . implode(", ", array_keys($workingHours)) . "\n";
        
        // Check Monday (as an example)
        if (isset($workingHours['monday'])) {
            echo "Monday type: " . gettype($workingHours['monday']) . "\n";
            
            if (is_array($workingHours['monday'])) {
                echo "Monday data: " . json_encode($workingHours['monday']) . "\n";
            } else {
                echo "Monday data: " . $workingHours['monday'] . "\n";
            }
        }
    }
    
    echo "\n";
    
    // Only show first 3 for brevity
    if ($index >= 2) break;
} 