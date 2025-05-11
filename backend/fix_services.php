<?php

// Simple script to directly fix service-point-services relations for a specific service point

// Load Laravel environment
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Service;
use App\Models\ServicePoint;
use Illuminate\Support\Facades\DB;

// Configuration - CHANGE THESE VALUES:
$servicePointId = 9; // The ID of the service point to fix
$serviceId = 1;      // The ID of the service to add
$comment = "Fixed service comment at " . date('Y-m-d H:i:s');

// Start the fix
echo "=== Service Point Direct Fix ===\n\n";

// Get the service point
$servicePoint = ServicePoint::find($servicePointId);
if (!$servicePoint) {
    echo "ERROR: Service point with ID {$servicePointId} not found!\n";
    exit(1);
}

echo "Found service point: {$servicePoint->name} (ID: {$servicePoint->id})\n";

// Get the service
$service = Service::find($serviceId);
if (!$service) {
    echo "ERROR: Service with ID {$serviceId} not found!\n";
    exit(1);
}

echo "Found service: {$service->name} (ID: {$service->id})\n\n";

// Check current state
echo "Current services for this service point:\n";
$currentServices = DB::table('service_point_services')
    ->where('service_point_id', $servicePointId)
    ->get();

if ($currentServices->isEmpty()) {
    echo "  No services attached.\n";
} else {
    foreach ($currentServices as $svc) {
        $svcName = Service::find($svc->service_id)->name ?? "Unknown";
        echo "  Service ID: {$svc->service_id} ({$svcName}), Comment: " . ($svc->comment ?? 'NULL') . "\n";
    }
}

echo "\nPerforming fix...\n";

// Step 1: Detach the service to ensure a clean state
DB::table('service_point_services')
    ->where('service_point_id', $servicePointId)
    ->where('service_id', $serviceId)
    ->delete();

echo "Detached service {$serviceId} from service point {$servicePointId}\n";

// Step 2: Add the service with a comment using direct SQL
DB::table('service_point_services')->insert([
    'service_point_id' => $servicePointId,
    'service_id' => $serviceId,
    'comment' => $comment,
    'created_at' => now(),
    'updated_at' => now()
]);

echo "Attached service {$serviceId} to service point {$servicePointId} with comment: {$comment}\n";

// Step 3: Verify the changes
echo "\nVerifying changes...\n";
$updatedServices = DB::table('service_point_services')
    ->where('service_point_id', $servicePointId)
    ->get();

echo "Updated services for this service point:\n";
foreach ($updatedServices as $svc) {
    $svcName = Service::find($svc->service_id)->name ?? "Unknown";
    echo "  Service ID: {$svc->service_id} ({$svcName}), Comment: " . ($svc->comment ?? 'NULL') . "\n";
}

// Check if our specific service was added
$ourService = DB::table('service_point_services')
    ->where('service_point_id', $servicePointId)
    ->where('service_id', $serviceId)
    ->first();

if ($ourService) {
    if ($ourService->comment === $comment) {
        echo "\nSUCCESS: Service {$serviceId} was correctly attached with the expected comment.\n";
    } else {
        echo "\nWARNING: Service {$serviceId} was attached but the comment doesn't match.\n";
        echo "Expected: {$comment}\n";
        echo "Actual: {$ourService->comment}\n";
    }
} else {
    echo "\nERROR: Service {$serviceId} was not found after the attachment operation!\n";
}

echo "\n=== Fix Complete ===\n";