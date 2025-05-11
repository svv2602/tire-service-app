<?php

// Initialize Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ServicePoint;

// Get a random service point
$servicePoint = ServicePoint::first();

if (!$servicePoint) {
    echo "No service points found in the database.\n";
    exit(1);
}

echo "Service Point #{$servicePoint->id}: {$servicePoint->name}\n\n";

// Display working hours
$workingHours = $servicePoint->working_hours;
echo "Working Hours Type: " . gettype($workingHours) . "\n\n";

// Display each day's hours
$days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
foreach ($days as $day) {
    $hours = $workingHours[$day] ?? 'not set';
    $hoursType = is_array($hours) ? 'array' : gettype($hours);
    
    echo "$day ($hoursType): ";
    
    if (is_array($hours)) {
        echo json_encode($hours);
    } else {
        echo $hours;
    }
    
    echo "\n";
}

echo "\nWorking hours raw: " . json_encode($workingHours, JSON_PRETTY_PRINT) . "\n"; 