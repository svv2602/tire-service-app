<?php

// This script inspects the Laravel models to understand how the relationships are defined

// Load Laravel environment
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Service;
use App\Models\ServicePoint;
use Illuminate\Support\Facades\DB;

echo "=== Model Relationship Inspection ===\n\n";

// Get a reflection of the models
$servicePointReflection = new ReflectionClass(ServicePoint::class);
$serviceReflection = new ReflectionClass(Service::class);

// Inspect ServicePoint model
echo "ServicePoint Model:\n";
echo "  - Class: " . ServicePoint::class . "\n";
echo "  - Table: " . (new ServicePoint())->getTable() . "\n";
echo "  - Fillable fields: " . implode(", ", (new ServicePoint())->getFillable()) . "\n";

// Get the services method content
try {
    $servicesMethod = $servicePointReflection->getMethod('services');
    $startLine = $servicesMethod->getStartLine();
    $endLine = $servicesMethod->getEndLine();
    $fileContent = file_get_contents($servicePointReflection->getFileName());
    $fileContentLines = explode("\n", $fileContent);
    $methodContent = array_slice($fileContentLines, $startLine - 1, $endLine - $startLine + 1);
    
    echo "  - Services relationship definition:\n";
    foreach ($methodContent as $line) {
        echo "    " . $line . "\n";
    }
} catch (\Exception $e) {
    echo "  - Error getting services method: " . $e->getMessage() . "\n";
}

// Inspect Service model
echo "\nService Model:\n";
echo "  - Class: " . Service::class . "\n";
echo "  - Table: " . (new Service())->getTable() . "\n";
echo "  - Fillable fields: " . implode(", ", (new Service())->getFillable()) . "\n";

// Get the servicePoints method content
try {
    $servicePointsMethod = $serviceReflection->getMethod('servicePoints');
    $startLine = $servicePointsMethod->getStartLine();
    $endLine = $servicePointsMethod->getEndLine();
    $fileContent = file_get_contents($serviceReflection->getFileName());
    $fileContentLines = explode("\n", $fileContent);
    $methodContent = array_slice($fileContentLines, $startLine - 1, $endLine - $startLine + 1);
    
    echo "  - ServicePoints relationship definition:\n";
    foreach ($methodContent as $line) {
        echo "    " . $line . "\n";
    }
} catch (\Exception $e) {
    echo "  - Error getting servicePoints method: " . $e->getMessage() . "\n";
}

// Check the pivot table structure
echo "\nPivot Table Structure:\n";
try {
    $columns = DB::select("PRAGMA table_info(service_point_services)");
    foreach ($columns as $column) {
        echo "  - Column: {$column->name}, Type: {$column->type}, Nullable: " . ($column->notnull ? "No" : "Yes") . "\n";
    }
} catch (\Exception $e) {
    echo "  - Error fetching pivot table structure: " . $e->getMessage() . "\n";
}

// Test relationship loading
echo "\nTesting Relationship Loading:\n";
try {
    $servicePoint = ServicePoint::first();
    if ($servicePoint) {
        echo "  - Found service point: {$servicePoint->id}, {$servicePoint->name}\n";
        $services = $servicePoint->services()->get();
        echo "  - Services count: " . $services->count() . "\n";
        
        if ($services->count() > 0) {
            echo "  - Services:\n";
            foreach ($services as $service) {
                echo "    - ID: {$service->id}, Name: {$service->name}\n";
                
                // Check if pivot data is properly loaded
                if (isset($service->pivot)) {
                    echo "      Pivot data: " . json_encode($service->pivot->toArray()) . "\n";
                } else {
                    echo "      WARNING: No pivot data available!\n";
                }
            }
        }
    } else {
        echo "  - No service points found in the database.\n";
    }
} catch (\Exception $e) {
    echo "  - Error testing relationship: " . $e->getMessage() . "\n";
}

echo "\n=== Inspection Complete ===\n";