<?php

// This is an updated fix script for service points and services

// Load Laravel environment
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Service;
use App\Models\ServicePoint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== Service Point Fix Script (Updated) ===\n\n";

// Check if pivot table has correct structure
echo "Checking pivot table structure...\n";
$hasCommentField = Schema::hasColumn('service_point_services', 'comment');
if (!$hasCommentField) {
    echo "ERROR: The 'comment' field is missing from the pivot table!\n";
    echo "Please run the following migration:\n";
    echo "php artisan make:migration add_comment_to_service_point_services_table\n";
    echo "And add the following code to the migration:\n";
    echo "Schema::table('service_point_services', function (Blueprint \$table) {\n";
    echo "    \$table->text('comment')->nullable();\n";
    echo "});\n";
    exit;
}
echo "Pivot table structure is correct.\n\n";

// Prompt for service point ID
echo "Enter service point ID to fix (or 'all' for all service points): ";
$input = trim(fgets(STDIN));

$servicePoints = [];
if (strtolower($input) === 'all') {
    $servicePoints = ServicePoint::all();
    echo "Processing all service points (" . count($servicePoints) . " found)...\n\n";
} else {
    $id = (int)$input;
    $servicePoint = ServicePoint::find($id);
    if (!$servicePoint) {
        echo "Service point with ID {$id} not found!\n";
        exit;
    }
    $servicePoints = [$servicePoint];
    echo "Found service point: {$servicePoint->name} (ID: {$servicePoint->id})\n\n";
}

// Show available services
$services = Service::where('is_active', true)->get();
echo "Available services:\n";
foreach ($services as $service) {
    echo "{$service->id}: {$service->name}\n";
}
echo "\n";

foreach ($servicePoints as $servicePoint) {
    echo "Processing service point: {$servicePoint->name} (ID: {$servicePoint->id})\n";
    
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
    echo "Enter service ID to add (or enter 'all' for all services, 'none' to skip): ";
    $serviceChoice = trim(fgets(STDIN));

    if (strtolower($serviceChoice) === 'none') {
        echo "Skipping this service point...\n\n";
        continue;
    }

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
            echo "Service with ID {$serviceId} not found! Skipping...\n\n";
            continue;
        }
        
        echo "Enter comment for service {$service->name}: ";
        $comment = trim(fgets(STDIN));
        
        $servicesToAttach[$serviceId] = ['comment' => $comment];
    }

    // Confirm changes
    echo "\nWill attach the following services to {$servicePoint->name}:\n";
    foreach ($servicesToAttach as $serviceId => $data) {
        $serviceName = $services->find($serviceId)->name;
        echo "{$serviceId}: {$serviceName} (Comment: {$data['comment']})\n";
    }

    echo "\nConfirm changes? (yes/no): ";
    $confirm = trim(fgets(STDIN));

    if (strtolower($confirm) !== 'yes') {
        echo "Changes cancelled for this service point.\n\n";
        continue;
    }

    // Apply changes
    try {
        // First detach to ensure we're starting fresh
        foreach (array_keys($servicesToAttach) as $serviceId) {
            echo "Detaching service {$serviceId}...\n";
            $servicePoint->services()->detach($serviceId);
        }
        
        // Then attach with comments
        foreach ($servicesToAttach as $serviceId => $data) {
            echo "Attaching service {$serviceId} with comment: {$data['comment']}...\n";
            $servicePoint->services()->attach($serviceId, ['comment' => $data['comment']]);
        }
        
        echo "Changes applied successfully!\n";
        
        // Verify changes
        $servicePoint->refresh();
        echo "\nVerifying changes for service point {$servicePoint->name}...\n";
        
        // Direct database check
        $pivotData = DB::table('service_point_services')
            ->where('service_point_id', $servicePoint->id)
            ->get();
            
        echo "Database records in pivot table: " . $pivotData->count() . "\n";
        foreach ($pivotData as $pivot) {
            $serviceName = $services->find($pivot->service_id)->name ?? "Unknown";
            echo "Service ID: {$pivot->service_id} ({$serviceName}), Comment: " . ($pivot->comment ?? 'NULL') . "\n";
        }
        
        // Check with relationship
        echo "\nReloading service point relationship...\n";
        $servicePoint->load(['services' => function($query) {
            $query->withPivot('comment');
        }]);
        
        echo "Services via relationship: " . $servicePoint->services->count() . "\n";
        foreach ($servicePoint->services as $service) {
            echo "Service ID: {$service->id}, Name: {$service->name}, Comment: " . ($service->pivot->comment ?? 'NULL') . "\n";
            
            // Verify against what we set
            if (isset($servicesToAttach[$service->id])) {
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
    echo "\n";
}

echo "=== Fix Complete ===\n";