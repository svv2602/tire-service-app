<?php

// This is a test script to debug the service point update API

// Load Laravel environment
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Service;
use App\Models\ServicePoint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

echo "=== Service Point API Test ===\n\n";

// 1. Get a service point to update
$servicePoint = ServicePoint::first();
if (!$servicePoint) {
    echo "No service points found. Please create a service point first.\n";
    exit;
}

echo "Using Service Point: ID {$servicePoint->id}, Name: {$servicePoint->name}\n\n";

// 2. Get available services
$services = Service::where('is_active', true)->get();
if ($services->isEmpty()) {
    echo "No active services found. Please create services first.\n";
    exit;
}

echo "Available Services:\n";
foreach ($services as $service) {
    echo "ID: {$service->id}, Name: {$service->name}\n";
}
echo "\n";

// 3. Prepare test data for API request
$testServiceId = $services->first()->id;
$testComment = "API Test Comment at " . date('Y-m-d H:i:s');

$apiPayload = [
    'name' => $servicePoint->name,
    'address' => $servicePoint->address,
    'services' => [$testServiceId],
    'service_comments' => [
        [
            'service_id' => $testServiceId,
            'comment' => $testComment
        ]
    ]
];

echo "API Payload:\n";
echo json_encode($apiPayload, JSON_PRETTY_PRINT) . "\n\n";

// 4. Make a direct API call to update the service point
$baseUrl = 'http://localhost:8000';
$apiUrl = "{$baseUrl}/api/v2/service-points/{$servicePoint->id}";

// Using Laravel's Http client for simplicity
echo "Making API request to {$apiUrl}...\n";
try {
    $response = Http::put($apiUrl, $apiPayload);
    
    echo "API Response Status: {$response->status()}\n";
    echo "API Response Body:\n";
    echo json_encode($response->json(), JSON_PRETTY_PRINT) . "\n\n";
} catch (\Exception $e) {
    echo "API Request Failed: {$e->getMessage()}\n\n";
}

// 5. Check database directly to see if services were updated
echo "Checking database for service relationship...\n";
$pivotData = DB::table('service_point_services')
    ->where('service_point_id', $servicePoint->id)
    ->get();

echo "Total pivot records: " . $pivotData->count() . "\n";
foreach ($pivotData as $pivot) {
    echo "Service ID: {$pivot->service_id}, Comment: " . ($pivot->comment ?? 'NULL') . "\n";
}
echo "\n";

// 6. Test the v1 API endpoint to compare behavior
$v1ApiUrl = "{$baseUrl}/api/service-points/{$servicePoint->id}";
echo "Making v1 API request to {$v1ApiUrl}...\n";
try {
    $v1Response = Http::put($v1ApiUrl, $apiPayload);
    
    echo "v1 API Response Status: {$v1Response->status()}\n";
    echo "v1 API Response Body:\n";
    echo json_encode($v1Response->json(), JSON_PRETTY_PRINT) . "\n\n";
} catch (\Exception $e) {
    echo "v1 API Request Failed: {$e->getMessage()}\n\n";
}

// 7. Check database again after v1 API call
echo "Checking database after v1 API call...\n";
$pivotDataAfterV1 = DB::table('service_point_services')
    ->where('service_point_id', $servicePoint->id)
    ->get();

echo "Total pivot records: " . $pivotDataAfterV1->count() . "\n";
foreach ($pivotDataAfterV1 as $pivot) {
    echo "Service ID: {$pivot->service_id}, Comment: " . ($pivot->comment ?? 'NULL') . "\n";
}
echo "\n";

echo "=== Test Complete ===\n"; 