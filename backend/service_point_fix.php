<?php

// This is a fix script for service points and services

// Load Laravel environment
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Service;
use App\Models\ServicePoint;
use Illuminate\Support\Facades\DB;

echo "=== Service Point Fix Script ===\n\n";

// Prompt for service point ID
echo "Enter service point ID to fix: ";
$id = trim(fgets(STDIN));

// Get the service point
$servicePoint = ServicePoint::find($id);
if (!$servicePoint) {
    echo "Service point with ID {$id} not found!\n";
    exit;
}

echo "Found service point: {$servicePoint->name} (ID: {$servicePoint->id})\n\n";

// Show available services
$services = Service::where('is_active', true)->get();
echo "Available services:\n";
foreach ($services as $service) {
    echo "{$service->id}: {$service->name}\n";
}
echo "\n";

// Show current services for this service point
echo "Current services for this service point:\n";
$servicePoint->load('services');
if ($servicePoint->services->isEmpty()) {
    echo "This service point has no services attached.\n";
} else {
    foreach ($servicePoint->services as $service) {
        echo "{$service->id}: {$service->name} (Comment: " . ($service->pivot->comment ?? 'NULL') . ")\n";
    }
}
echo "\n";

// Ask for service to add
echo "Enter service ID to add (or enter 'all' for all services): ";
$serviceChoice = trim(fgets(STDIN));

$servicesToAttach = [];
if (strtolower($serviceChoice) === 'all') {
    foreach ($services as $service) {
        $comment = "Fixed comment for service {$service->id} at " . date('Y-m-d H:i:s');
        $servicesToAttach[$service->id] = ['comment' => $comment];
    }
} else {
    $serviceId = (int)$serviceChoice;
    $service = $services->find($serviceId);
    if (!$service) {
        echo "Service with ID {$serviceId} not found!\n";
        exit;
    }
    
    echo "Enter comment for service {$service->name}: ";
    $comment = trim(fgets(STDIN));
    
    $servicesToAttach[$serviceId] = ['comment' => $comment];
}

// Confirm changes
echo "\nWill attach the following services:\n";
foreach ($servicesToAttach as $serviceId => $data) {
    $serviceName = $services->find($serviceId)->name;
    echo "{$serviceId}: {$serviceName} (Comment: {$data['comment']})\n";
}

echo "\nConfirm changes? (yes/no): ";
$confirm = trim(fgets(STDIN));

if (strtolower($confirm) !== 'yes') {
    echo "Changes cancelled.\n";
    exit;
}

// Apply changes
try {
    // First detach to ensure we're starting fresh
    foreach (array_keys($servicesToAttach) as $serviceId) {
        $servicePoint->services()->detach($serviceId);
    }
    
    // Then attach with comments
    foreach ($servicesToAttach as $serviceId => $data) {
        $servicePoint->services()->attach($serviceId, ['comment' => $data['comment']]);
    }
    
    echo "Changes applied successfully!\n";
    
    // Verify changes
    $servicePoint->refresh();
    echo "\nUpdated services for this service point:\n";
    foreach ($servicePoint->services as $service) {
        if (isset($servicesToAttach[$service->id])) {
            echo "{$service->id}: {$service->name} (Comment: " . ($service->pivot->comment ?? 'NULL') . ")\n";
            
            // Verify comment matches what we set
            $expectedComment = $servicesToAttach[$service->id]['comment'];
            if ($service->pivot->comment !== $expectedComment) {
                echo "WARNING: Comment doesn't match what we set!\n";
                echo "Expected: {$expectedComment}\n";
                echo "Actual: {$service->pivot->comment}\n";
            }
        }
    }
} catch (\Exception $e) {
    echo "Error applying changes: {$e->getMessage()}\n";
}

echo "\n=== Fix Complete ===\n"; 