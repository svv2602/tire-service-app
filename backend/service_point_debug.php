<?php

// This is a debug script to test service point and service relationships

// Load Laravel environment
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Service;
use App\Models\ServicePoint;
use Illuminate\Support\Facades\DB;

echo "=== Service Point Debug Script ===\n\n";

// 1. List all services
echo "Listing all services...\n";
$services = Service::all();
foreach ($services as $service) {
    echo "ID: {$service->id}, Name: {$service->name}, Active: " . ($service->is_active ? 'Yes' : 'No') . "\n";
}
echo "\n";

// 2. List all service points
echo "Listing all service points...\n";
$servicePoints = ServicePoint::all();
foreach ($servicePoints as $sp) {
    echo "ID: {$sp->id}, Name: {$sp->name}, Partner ID: {$sp->partner_id}\n";
}
echo "\n";

// 3. Get the pivot table data
echo "Checking pivot table data...\n";
$pivotData = DB::table('service_point_services')->get();
echo "Total records in pivot table: " . count($pivotData) . "\n";
foreach ($pivotData as $pivot) {
    echo "Service Point ID: {$pivot->service_point_id}, Service ID: {$pivot->service_id}, Comment: " . 
         ($pivot->comment ?? 'NULL') . "\n";
}
echo "\n";

// 4. Test attaching a service with comment to a service point
echo "Testing service attachment with comment...\n";
if (count($servicePoints) > 0 && count($services) > 0) {
    $testServicePoint = $servicePoints->first();
    $testService = $services->first();
    
    echo "Using Service Point: {$testServicePoint->id} ({$testServicePoint->name})\n";
    echo "Using Service: {$testService->id} ({$testService->name})\n";
    
    // First detach to ensure we're starting fresh
    $testServicePoint->services()->detach($testService->id);
    
    // Then attach with a comment
    $testComment = "Test comment at " . date('Y-m-d H:i:s');
    echo "Attaching with comment: {$testComment}\n";
    
    $testServicePoint->services()->attach($testService->id, ['comment' => $testComment]);
    
    // Refresh the model to get updated relationships
    $testServicePoint = ServicePoint::with('services')->find($testServicePoint->id);
    
    // Check if service was attached properly
    $attachedService = $testServicePoint->services->where('id', $testService->id)->first();
    
    if ($attachedService) {
        echo "Service was successfully attached.\n";
        echo "Pivot comment is: " . ($attachedService->pivot->comment ?? 'NULL') . "\n";
        
        // Check if the comment matches what we set
        if ($attachedService->pivot->comment === $testComment) {
            echo "SUCCESS: Comment was saved and retrieved correctly.\n";
        } else {
            echo "ERROR: Comment doesn't match what we set.\n";
        }
    } else {
        echo "ERROR: Service was not attached properly.\n";
    }
} else {
    echo "Cannot test attachment - no service points or services found.\n";
}
echo "\n";

// 5. Test the JSON response format
echo "Testing JSON response format...\n";
if (count($servicePoints) > 0) {
    $testServicePoint = ServicePoint::with('services')->find($servicePoints->first()->id);
    
    // Prepare service_comments based on pivot data
    $serviceComments = [];
    foreach ($testServicePoint->services as $service) {
        $serviceComments[] = [
            'service_id' => $service->id,
            'comment' => $service->pivot->comment
        ];
    }
    
    // Add service_comments to the service point
    $testServicePoint->service_comments = $serviceComments;
    
    // Output as JSON
    echo json_encode([
        'id' => $testServicePoint->id,
        'name' => $testServicePoint->name,
        'services' => $testServicePoint->services->pluck('id'),
        'service_comments' => $testServicePoint->service_comments
    ], JSON_PRETTY_PRINT);
    echo "\n";
}

echo "\n=== End of Debug Script ===\n"; 