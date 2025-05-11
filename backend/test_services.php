<?php

require __DIR__ . '/vendor/autoload.php';

// Загрузка Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ServicePoint;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// Включаем подробное логирование
DB::enableQueryLog();

// Выводим информацию о подключении к базе данных
echo "Database connection: " . DB::connection()->getDriverName() . "\n";
echo "Database name: " . DB::connection()->getDatabaseName() . "\n";

// Получаем ID всех точек обслуживания
$servicePointIds = ServicePoint::pluck('id')->toArray();
echo "Service points IDs: " . implode(', ', $servicePointIds) . "\n";

// Получаем ID всех услуг
$serviceIds = Service::pluck('id')->toArray();
echo "Service IDs: " . implode(', ', $serviceIds) . "\n";

if (empty($servicePointIds) || empty($serviceIds)) {
    echo "No service points or services found in the database.\n";
    exit;
}

// Берем первую точку обслуживания для теста
$servicePointId = $servicePointIds[0];
$servicePoint = ServicePoint::find($servicePointId);

if (!$servicePoint) {
    echo "Service point with ID: $servicePointId not found.\n";
    exit;
}

echo "Testing with service point: " . $servicePoint->name . " (ID: " . $servicePoint->id . ")\n";

// Отсоединяем все услуги от точки обслуживания
$servicePoint->services()->detach();
echo "Detached all services from the service point.\n";

// Присоединяем услуги с комментариями
$servicesToAttach = [];
foreach (array_slice($serviceIds, 0, 3) as $index => $serviceId) {
    $comment = "Test comment for service $serviceId - " . date('Y-m-d H:i:s');
    $servicesToAttach[$serviceId] = ['comment' => $comment];
    echo "Attaching service $serviceId with comment: $comment\n";
}

// Присоединяем услуги
$servicePoint->services()->attach($servicesToAttach);
echo "Services attached with comments.\n";

// Проверяем, что услуги были присоединены
$attachedServices = $servicePoint->services()->get();
echo "Attached services count: " . $attachedServices->count() . "\n";

foreach ($attachedServices as $service) {
    echo "Service: " . $service->name . " (ID: " . $service->id . "), Comment: " . $service->pivot->comment . "\n";
}

// Выводим все SQL-запросы
echo "\nSQL queries executed:\n";
$queries = DB::getQueryLog();
foreach ($queries as $query) {
    echo $query['query'] . "\n";
    echo "Bindings: " . implode(', ', $query['bindings']) . "\n";
    echo "Time: " . $query['time'] . "ms\n\n";
}

echo "\nTest completed successfully.\n"; 