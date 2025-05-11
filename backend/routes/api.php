<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\PartnerTestController;
use App\Http\Controllers\ServicePointController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\BookingTestController;
use Illuminate\Support\Facades\Validator;
use App\Services\DBAdapterService;
use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\v2\AppointmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/test-login', [AuthController::class, 'testLogin']);
Route::post('/login-create', [AuthController::class, 'loginOrCreate']);

// Resource routes using test controllers
Route::get('/partners', [PartnerTestController::class, 'index']);
Route::get('/partners/{id}', [PartnerTestController::class, 'show']);
Route::post('/partners', [PartnerTestController::class, 'store']);
Route::put('/partners/{id}', [PartnerTestController::class, 'update']);
Route::patch('/partners/{id}', [PartnerTestController::class, 'update']);
Route::delete('/partners/{id}', [PartnerTestController::class, 'destroy']);

// Direct implementation of service-points endpoint - SIMPLIFIED VERSION
Route::get('/service-points', function () {
    try {
        // Get all service points with only necessary fields to reduce complexity
        $servicePoints = \App\Models\ServicePoint::all(['id', 'partner_id', 'name', 'address', 'lat', 'lng', 'working_hours']);
        
        // Transform working_hours objects if needed
        $transformedPoints = [];
        foreach ($servicePoints as $point) {
            $pointArray = $point->toArray();
            
            // Only try to transform working_hours if it's a string
            if (isset($pointArray['working_hours']) && is_string($pointArray['working_hours'])) {
                try {
                    $decoded = json_decode($pointArray['working_hours'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $pointArray['working_hours'] = $decoded;
                    }
                } catch (\Exception $e) {
                    // Keep original if we can't decode
                }
            }
            
            $transformedPoints[] = $pointArray;
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $transformedPoints
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to retrieve service points',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Service Point routes - replace the simplified implementation with controller
Route::get('/service-points', [ServicePointController::class, 'index']);
Route::post('/service-points', [ServicePointController::class, 'store']);
Route::get('/service-points/{servicePoint}', [ServicePointController::class, 'show']);
Route::put('/service-points/{servicePoint}', [ServicePointController::class, 'update']);
Route::patch('/service-points/{servicePoint}', [ServicePointController::class, 'update']);
Route::delete('/service-points/{servicePoint}', [ServicePointController::class, 'destroy']);

// Keep the partner-specific route
Route::get('/partners/{id}/service-points', [ServicePointController::class, 'getByPartnerId']);

// Service point schedule routes
Route::post('/service-points/{servicePoint}/schedule', [ServicePointController::class, 'generateSchedule']);
Route::get('/service-points/{servicePoint}/slots', [ServicePointController::class, 'getAvailableSlots']);

// Service point photos route for deletion
Route::delete('/service-points/{servicePoint}/photos/{photo}', function (\App\Models\ServicePoint $servicePoint, $photo) {
    $photoModel = $servicePoint->photos()->findOrFail($photo);
    \Storage::disk('public')->delete($photoModel->path);
    $photoModel->delete();
    
    return response()->json([
        'status' => 'success',
        'message' => 'Photo deleted successfully'
    ]);
});

// Service CRUD routes
Route::get('/services', [ServiceController::class, 'index']);
Route::post('/services', [ServiceController::class, 'store']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::put('/services/{service}', [ServiceController::class, 'update']);
Route::patch('/services/{service}', [ServiceController::class, 'update']);
Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

// Get services for a specific service point
Route::get('/service-points/{servicePoint}/services', [ServiceController::class, 'getServicesByServicePoint']);

// Appointment booking routes
Route::get('/service-points/{servicePointId}/available-days', [AppointmentController::class, 'getAvailableDays']);
Route::get('/service-points/{servicePointId}/available-slots/{date}', [AppointmentController::class, 'getAvailableTimeSlots']);
Route::post('/appointments', [AppointmentController::class, 'createAppointment']);

// Booking routes using BookingTestController
Route::get('/bookings', [BookingTestController::class, 'index']);
Route::get('/bookings/{id}', [BookingTestController::class, 'show']);
Route::post('/bookings', [BookingTestController::class, 'store']);
Route::put('/bookings/{id}', [BookingTestController::class, 'update']);
Route::delete('/bookings/{id}', [BookingTestController::class, 'destroy']);
Route::get('/bookings/{booking}/history', [BookingTestController::class, 'getHistory']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Diagnostic routes
Route::get('/check-db', [DiagnosticController::class, 'checkConnection']);
Route::get('/check-users', [DiagnosticController::class, 'listUsers']);
Route::get('/ping', function() {
    return response()->json(['message' => 'pong']);
});

// Test routes
Route::get('/test-db', [TestController::class, 'testDb']);
Route::get('/test-json', [TestController::class, 'testJson']);
Route::get('/test-bookings', [BookingTestController::class, 'index']);
Route::get('/test-bookings/{id}', [BookingTestController::class, 'show']);

// Original Debug route 
Route::get('/debug/service-points', function () {
    try {
        $servicePoints = \App\Models\ServicePoint::all();
        
        // Transform working_hours to JSON objects from strings
        $servicePoints = $servicePoints->map(function ($point) {
            try {
                if (is_string($point->working_hours)) {
                    $point->working_hours = json_decode($point->working_hours);
                }
                return $point;
            } catch (\Exception $e) {
                return [
                    'id' => $point->id,
                    'error' => $e->getMessage(),
                    'working_hours_raw' => $point->working_hours
                ];
            }
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $servicePoints
        ]);
    } catch (\Exception $e) {
        \Log::error('Error fetching service points', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Debug route with more information
Route::get('/debug/service-points-direct', function () {
    try {
        // Check if the app is in debug mode
        \Log::info('App debug mode: ' . (config('app.debug') ? 'true' : 'false'));
        
        // Check if the database connection is working
        try {
            \DB::connection()->getPdo();
            \Log::info('Database connection established successfully');
        } catch (\Exception $e) {
            \Log::error('Database connection failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Database connection failed',
                'error' => $e->getMessage()
            ], 500);
        }
        
        // Try to get a direct reference to the ServicePoint model
        if (!class_exists('App\Models\ServicePoint')) {
            \Log::error('ServicePoint model does not exist');
            return response()->json([
                'status' => 'error',
                'message' => 'ServicePoint model not found'
            ], 500);
        }
        
        // Check if the service_points table exists
        try {
            if (!\Schema::hasTable('service_points')) {
                \Log::error('service_points table does not exist');
                return response()->json([
                    'status' => 'error',
                    'message' => 'service_points table not found'
                ], 500);
            }
            \Log::info('service_points table exists');
        } catch (\Exception $e) {
            \Log::error('Error checking service_points table', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error checking service_points table',
                'error' => $e->getMessage()
            ], 500);
        }
        
        // Try to get service points directly
        try {
            $servicePoints = \App\Models\ServicePoint::all()->toArray();
            \Log::info('Service points retrieved directly', ['count' => count($servicePoints)]);
            
            return response()->json([
                'status' => 'success',
                'count' => count($servicePoints),
                'data' => $servicePoints
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching service points directly', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error fetching service points directly',
                'error' => $e->getMessage()
            ], 500);
        }
    } catch (\Exception $e) {
        \Log::error('Unexpected error in direct debug route', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Unexpected error in direct debug route',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Simplified test route for service-points
Route::get('/test-service-points', function () {
    try {
        // Basic test to retrieve service points
        $servicePoints = \App\Models\ServicePoint::take(3)->get(['id', 'name', 'address']);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Simple test route working',
            'data' => $servicePoints
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error in test route',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Debug route for service point model
Route::get('/debug/model-info', function () {
    try {
        // Check if we can instantiate the model
        $model = new \App\Models\ServicePoint();
        
        // Get model information
        $fillable = $model->getFillable();
        $casts = $model->getCasts();
        $uses = class_uses_recursive(\App\Models\ServicePoint::class);
        
        return response()->json([
            'status' => 'success',
            'model_info' => [
                'fillable' => $fillable,
                'casts' => $casts,
                'uses' => $uses
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error getting model info',
            'error' => $e->getMessage()
        ], 500);
    }
});

// V2 API routes
Route::get('/v2/service-points', function (Request $request) {
    try {
        // Use DB adapter service instead of direct connection
        $dbAdapter = app(DBAdapterService::class);
        
        $query = $dbAdapter->servicePoints();
        
        $partnerId = $request->query('partner_id');
        if ($partnerId) {
            $query->where('partner_id', $partnerId);
        }
        
        $servicePoints = $query->get();
        
        $result = [];
        foreach ($servicePoints as $point) {
            $item = (array)$point;
            
            // Only try to decode working_hours if it's a string
            if (isset($item['working_hours']) && is_string($item['working_hours'])) {
                try {
                    $decoded = json_decode($item['working_hours'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $item['working_hours'] = $decoded;
                    }
                } catch (\Exception $e) {
                    // Keep as is
                }
            }
            
            $result[] = $item;
        }
        
        // Загружаем услуги для всех точек обслуживания
        try {
            $servicePointsWithServices = \App\Models\ServicePoint::with('services')->get();
            
            // Индексируем по ID для быстрого доступа
            $servicesById = [];
            foreach ($servicePointsWithServices as $servicePoint) {
                $servicesArray = $servicePoint->services->pluck('id')->toArray();
                
                // Подготовить service_comments
                $serviceComments = [];
                foreach ($servicePoint->services as $service) {
                    $serviceComments[] = [
                        'service_id' => $service->id,
                        'comment' => $service->pivot->comment
                    ];
                }
                
                $servicesById[$servicePoint->id] = [
                    'services' => $servicesArray,
                    'service_comments' => $serviceComments
                ];
            }
            
            // Дополняем результат услугами
            foreach ($result as &$item) {
                $pointId = $item['id'];
                if (isset($servicesById[$pointId])) {
                    $item['services'] = $servicesById[$pointId]['services'];
                    $item['service_comments'] = $servicesById[$pointId]['service_comments'];
                } else {
                    $item['services'] = [];
                    $item['service_comments'] = [];
                }
            }
            
            \Log::info('v2 - Enhanced service points list with services', [
                'points_count' => count($result),
                'with_services_count' => count($servicesById)
            ]);
        } catch (\Exception $e) {
            \Log::error('v2 - Error loading services for service points list', [
                'error' => $e->getMessage()
            ]);
            
            // Добавляем пустые массивы услуг, если произошла ошибка
            foreach ($result as &$item) {
                $item['services'] = [];
                $item['service_comments'] = [];
            }
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $result
        ]);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to retrieve service points', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to retrieve service points',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Filter service points with v2 API
Route::get('/v2/service-points/filter', function (Request $request) {
    try {
        \Log::info('Filter endpoint called with parameters', [
            'region' => $request->input('region'),
            'city' => $request->input('city')
        ]);
        
        // Use DB adapter service
        $dbAdapter = app(DBAdapterService::class);
        
        $query = $dbAdapter->servicePoints();
        
        // Filter by region if provided
        if ($request->has('region')) {
            $query->where('region', $request->input('region'));
        }
        
        // Filter by city if provided
        if ($request->has('city')) {
            $query->where('city', $request->input('city'));
        }
        
        // Only include active service points
        $query->where('is_active', 1);
        
        // Ensure deleted_at is null (soft-deleted records are excluded)
        $query->whereNull('deleted_at');
        
        // Get filtered service points
        $servicePoints = $query->get();
        
        $result = [];
        foreach ($servicePoints as $point) {
            $item = (array)$point;
            
            // Only try to decode working_hours if it's a string
            if (isset($item['working_hours']) && is_string($item['working_hours'])) {
                try {
                    $decoded = json_decode($item['working_hours'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $item['working_hours'] = $decoded;
                    }
                } catch (\Exception $e) {
                    // Keep as is
                }
            }
            
            $result[] = $item;
        }
        
        \Log::info('Filter results', [
            'count' => count($result)
        ]);
        
        // Загружаем услуги для отфильтрованных точек обслуживания
        try {
            // Получаем ID всех отфильтрованных точек
            $pointIds = array_column($result, 'id');
            
            // Загружаем модели с услугами по этим ID
            $servicePointsWithServices = \App\Models\ServicePoint::with('services')
                ->whereIn('id', $pointIds)
                ->get();
            
            // Индексируем по ID для быстрого доступа
            $servicesById = [];
            foreach ($servicePointsWithServices as $servicePoint) {
                $servicesArray = $servicePoint->services->pluck('id')->toArray();
                
                // Подготовить service_comments
                $serviceComments = [];
                foreach ($servicePoint->services as $service) {
                    $serviceComments[] = [
                        'service_id' => $service->id,
                        'comment' => $service->pivot->comment
                    ];
                }
                
                $servicesById[$servicePoint->id] = [
                    'services' => $servicesArray,
                    'service_comments' => $serviceComments
                ];
            }
            
            // Дополняем результат услугами
            foreach ($result as &$item) {
                $pointId = $item['id'];
                if (isset($servicesById[$pointId])) {
                    $item['services'] = $servicesById[$pointId]['services'];
                    $item['service_comments'] = $servicesById[$pointId]['service_comments'];
                } else {
                    $item['services'] = [];
                    $item['service_comments'] = [];
                }
            }
            
            \Log::info('v2 - Enhanced filtered service points with services', [
                'filtered_points_count' => count($result),
                'with_services_count' => count($servicesById)
            ]);
        } catch (\Exception $e) {
            \Log::error('v2 - Error loading services for filtered service points', [
                'error' => $e->getMessage()
            ]);
            
            // Добавляем пустые массивы услуг, если произошла ошибка
            foreach ($result as &$item) {
                $item['services'] = [];
                $item['service_comments'] = [];
            }
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $result
        ]);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to filter service points', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to filter service points',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Regions endpoint for v2 API
Route::get('/v2/regions', function () {
    try {
        // Use DB adapter service
        $dbAdapter = app(DBAdapterService::class);
        
        $regions = $dbAdapter->servicePoints()
            ->select('region')
            ->whereNotNull('region')
            ->where('region', '!=', '')
            ->distinct()
            ->orderBy('region')
            ->get()
            ->pluck('region')
            ->toArray();
        
        return response()->json([
            'status' => 'success',
            'data' => $regions
        ]);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to retrieve regions', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to retrieve regions',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Cities by region endpoint for v2 API
Route::get('/v2/regions/{region}/cities', function ($region) {
    try {
        // Use DB adapter service
        $dbAdapter = app(DBAdapterService::class);
        
        $cities = $dbAdapter->servicePoints()
            ->select('city')
            ->where('region', $region)
            ->whereNotNull('city')
            ->where('city', '!=', '')
            ->distinct()
            ->orderBy('city')
            ->get()
            ->pluck('city')
            ->toArray();
        
        \Log::info('Cities for region', [
            'region' => $region,
            'cities' => $cities,
            'count' => count($cities)
        ]);
        
        return response()->json([
            'status' => 'success',
            'data' => $cities
        ]);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to retrieve cities for region', [
            'region' => $region,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to retrieve cities for region',
            'error' => $e->getMessage()
        ], 500);
    }
});

// All cities endpoint for v2 API
Route::get('/v2/cities', function () {
    try {
        // Use DB adapter service
        $dbAdapter = app(DBAdapterService::class);
        
        $cities = $dbAdapter->servicePoints()
            ->select('city')
            ->whereNotNull('city')
            ->where('city', '!=', '')
            ->distinct()
            ->orderBy('city')
            ->get()
            ->pluck('city')
            ->toArray();
        
        \Log::info('All cities fetched', [
            'count' => count($cities)
        ]);
        
        return response()->json([
            'status' => 'success',
            'data' => $cities
        ]);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to retrieve all cities', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to retrieve all cities',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Single service point endpoint for v2 API (updated version with services)
Route::get('/v2/service-points/{id}', function ($id) {
    try {
        // Use DB adapter service
        $dbAdapter = app(DBAdapterService::class);
        
        // Use the new finder method that handles ID type conversion
        // Note: After our update, this will include inactive service points
        $servicePoint = $dbAdapter->findServicePoint($id);
            
        if (!$servicePoint) {
            return response()->json([
                'status' => 'error',
                'message' => 'Service point not found',
                'debug_info' => [
                    'id' => $id,
                    'id_type' => gettype($id)
                ]
            ], 404);
        }
        
        $result = (array)$servicePoint;
        
        // Only try to decode working_hours if it's a string
        if (isset($result['working_hours']) && is_string($result['working_hours'])) {
            try {
                $decoded = json_decode($result['working_hours'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $result['working_hours'] = $decoded;
                }
            } catch (\Exception $e) {
                // Keep as is
            }
        }
        
        // Decode service_posts if it's a string
        if (isset($result['service_posts']) && is_string($result['service_posts'])) {
            try {
                $decodedPosts = json_decode($result['service_posts'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $result['service_posts'] = $decodedPosts;
                }
            } catch (\Exception $e) {
                // Keep as is
            }
        }
        
        // Загрузить услуги через модель Laravel
        try {
            // Include inactive service points when loading the model
            $servicePointModel = \App\Models\ServicePoint::withInactive()->with(['services'])->find($id);
            
            if ($servicePointModel) {
                // Добавляем услуги в результат
                $result['services'] = $servicePointModel->services->pluck('id')->toArray();
                
                // Подготовить service_comments в формате, ожидаемом фронтендом
                $serviceComments = [];
                foreach ($servicePointModel->services as $service) {
                    $serviceComments[] = [
                        'service_id' => $service->id,
                        'comment' => $service->pivot->comment
                    ];
                }
                
                // Добавить service_comments в ответ
                $result['service_comments'] = $serviceComments;
                
                \Log::info('v2 - Enhanced service point response with services and comments', [
                    'id' => $id,
                    'services_count' => count($result['services']), 
                    'service_comments_count' => count($serviceComments),
                    'service_comments' => $serviceComments
                ]);
            } else {
                \Log::warning('v2 - Failed to load Laravel model for services', [
                    'id' => $id
                ]);
                // Инициализировать пустые массивы
                $result['services'] = [];
                $result['service_comments'] = [];
            }
            
            // Double-check pivot table to see what's actually in the database
            $pivotTableContents = DB::table('service_point_services')
                ->where('service_point_id', $id)
                ->get();
                
            \Log::info('Final pivot table check in response preparation', [
                'service_point_id' => $id,
                'pivot_records' => $pivotTableContents,
                'pivot_count' => $pivotTableContents->count(),
                'pivot_service_ids' => $pivotTableContents->pluck('service_id')->toArray()
            ]);
            
        } catch (\Exception $e) {
            \Log::error('v2 - Error loading services for response', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            // Инициализировать пустые массивы
            $result['services'] = [];
            $result['service_comments'] = [];
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $result
        ]);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to retrieve service point', [
            'id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to retrieve service point',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Update service point endpoint for v2 API
Route::put('/v2/service-points/{id}', function (Request $request, $id) {
    try {
        \Log::info('V2 endpoint - Updating service point', [
            'id' => $id,
            'request_data' => $request->all()
        ]);
        
        // Use DB adapter service instead of direct connection
        $dbAdapter = app(DBAdapterService::class);
        
        // Check if service point exists using the new method
        if (!$dbAdapter->servicePointExists($id)) {
            \Log::error('Service point not found', [
                'id' => $id,
                'id_type' => gettype($id),
                'converted_id' => (int)$id
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Service point not found',
                'details' => [
                    'id' => $id,
                    'id_type' => gettype($id)
                ]
            ], 404);
        }
        
        // Prepare update data - only include fields that are actually present in the request
        $updateData = [];
        
        // Text fields - updated to include all text fields
        foreach (['name', 'region', 'city', 'address', 'description', 'contact_info', 'notes'] as $field) {
            if ($request->has($field)) {
                \Log::info("Processing text field '{$field}'", [
                    'value' => $request->input($field)
                ]);
                $updateData[$field] = $request->input($field);
            }
        }
        
        // Numeric fields
        foreach (['partner_id', 'lat', 'lng', 'num_posts'] as $field) {
            if ($request->has($field)) {
                \Log::info("Processing numeric field '{$field}'", [
                    'value' => $request->input($field)
                ]);
                $updateData[$field] = is_numeric($request->input($field)) 
                    ? $request->input($field) 
                    : 0;
            }
        }
        
        // Boolean fields - explicitly handle to ensure false values are properly saved
        foreach (['is_active'] as $field) {
            if ($request->has($field)) {
                // Convert to proper boolean integer (0 or 1)
                $updateData[$field] = $request->boolean($field) ? 1 : 0;
                \Log::info("Handling boolean field {$field}", [
                    'raw_value' => $request->input($field),
                    'converted_value' => $updateData[$field]
                ]);
            }
        }
        
        // Handle working_hours with special care
        if ($request->has('working_hours')) {
            $workingHours = $request->input('working_hours');
            \Log::info('Processing working_hours in v2 endpoint', [
                'type' => gettype($workingHours),
                'raw' => $workingHours
            ]);
            
            // Process working_hours based on its type
            if (is_array($workingHours) || is_object($workingHours)) {
                \Log::info('Working hours is already an array/object');
                
                // Ensure all days are present
                $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                $normalizedWorkingHours = [];
                
                // Convert to array if it's an object
                $workingHoursArray = (array)$workingHours;
                
                foreach ($daysOfWeek as $day) {
                    if (isset($workingHoursArray[$day])) {
                        $normalizedWorkingHours[$day] = $workingHoursArray[$day];
                    } else {
                        // Default to closed if day not specified
                        $normalizedWorkingHours[$day] = 'closed';
                    }
                }
                
                // Encode the normalized structure
                try {
                    $encoded = json_encode($normalizedWorkingHours);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $updateData['working_hours'] = $encoded;
                        \Log::info('Successfully encoded working_hours', [
                            'encoded' => $encoded
                        ]);
                    } else {
                        \Log::error('Failed to encode working_hours', [
                            'error' => json_last_error_msg()
                        ]);
                        // Use a default value
                        $updateData['working_hours'] = json_encode([
                            'monday' => ['open' => '09:00', 'close' => '18:00'],
                            'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                            'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                            'thursday' => ['open' => '09:00', 'close' => '18:00'],
                            'friday' => ['open' => '09:00', 'close' => '18:00'],
                            'saturday' => ['open' => '09:00', 'close' => '18:00'],
                            'sunday' => 'closed'
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Exception encoding working_hours', [
                        'error' => $e->getMessage()
                    ]);
                    // Use a default value
                    $updateData['working_hours'] = json_encode([
                        'monday' => ['open' => '09:00', 'close' => '18:00'],
                        'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                        'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                        'thursday' => ['open' => '09:00', 'close' => '18:00'],
                        'friday' => ['open' => '09:00', 'close' => '18:00'],
                        'saturday' => ['open' => '10:00', 'close' => '16:00'],
                        'sunday' => 'closed'
                    ]);
                }
            } 
            else if (is_string($workingHours)) {
                \Log::info('Working hours is a string, trying to parse JSON');
                
                // Try to parse the string to see if it's valid JSON
                try {
                    $decoded = json_decode($workingHours, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        \Log::info('Successfully parsed working_hours JSON');
                        
                        // Ensure all days are present in the decoded data
                        $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                        foreach ($daysOfWeek as $day) {
                            if (!isset($decoded[$day])) {
                                $decoded[$day] = 'closed';
                            }
                        }
                        
                        // Re-encode with the normalized data
                        $updateData['working_hours'] = json_encode($decoded);
                    } else {
                        \Log::warning('Invalid JSON string for working_hours', [
                            'input' => $workingHours,
                            'error' => json_last_error_msg()
                        ]);
                        
                        // Try to fix known issues with input format
                        $cleanedInput = str_replace('\\"', '"', $workingHours);
                        $cleanedInput = preg_replace('/\\\\+/', '\\', $cleanedInput);
                        
                        $decodedCleaned = json_decode($cleanedInput, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            \Log::info('Successfully parsed cleaned working_hours JSON');
                            
                            // Ensure all days are present
                            $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                            foreach ($daysOfWeek as $day) {
                                if (!isset($decodedCleaned[$day])) {
                                    $decodedCleaned[$day] = 'closed';
                                }
                            }
                            
                            // Re-encode with the normalized data
                            $updateData['working_hours'] = json_encode($decodedCleaned);
                        } else {
                            \Log::error('Failed to parse cleaned working_hours JSON', [
                                'cleaned_input' => $cleanedInput,
                                'error' => json_last_error_msg()
                            ]);
                            
                            // Use a default value
                            $updateData['working_hours'] = json_encode([
                                'monday' => ['open' => '09:00', 'close' => '18:00'],
                                'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                                'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                                'thursday' => ['open' => '09:00', 'close' => '18:00'],
                                'friday' => ['open' => '09:00', 'close' => '18:00'],
                                'saturday' => ['open' => '10:00', 'close' => '16:00'],
                                'sunday' => 'closed'
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Exception while parsing working_hours JSON', [
                        'input' => $workingHours,
                        'error' => $e->getMessage()
                    ]);
                    
                    // Use a default value
                    $updateData['working_hours'] = json_encode([
                        'monday' => ['open' => '09:00', 'close' => '18:00'],
                        'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                        'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                        'thursday' => ['open' => '09:00', 'close' => '18:00'],
                        'friday' => ['open' => '09:00', 'close' => '18:00'],
                        'saturday' => ['open' => '10:00', 'close' => '16:00'],
                        'sunday' => 'closed'
                    ]);
                }
            }
            else {
                \Log::warning('Working hours has unexpected type', [
                    'type' => gettype($workingHours)
                ]);
                
                // Use a default value
                $updateData['working_hours'] = json_encode([
                    'monday' => ['open' => '09:00', 'close' => '18:00'],
                    'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                    'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                    'thursday' => ['open' => '09:00', 'close' => '18:00'],
                    'friday' => ['open' => '09:00', 'close' => '18:00'],
                    'saturday' => ['open' => '10:00', 'close' => '16:00'],
                    'sunday' => 'closed'
                ]);
            }
        }
        
        // Handle service_posts with similar care to working_hours
        if ($request->has('service_posts')) {
            $servicePosts = $request->input('service_posts');
            \Log::info('Processing service_posts in v2 endpoint', [
                'type' => gettype($servicePosts),
                'raw' => $servicePosts
            ]);
            
            // If it's an array or object, encode it
            if (is_array($servicePosts) || is_object($servicePosts)) {
                try {
                    // Validate each post's time duration
                    foreach ((array)$servicePosts as $post) {
                        if (isset($post['service_time_minutes'])) {
                            $minutes = (int)$post['service_time_minutes'];
                            if ($minutes < 5 || $minutes > 240) {
                                return response()->json([
                                    'status' => 'error',
                                    'message' => 'Service time minutes must be between 5 and 240'
                                ], 422);
                            }
                        }
                    }
                    
                    $encoded = json_encode($servicePosts);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $updateData['service_posts'] = $encoded;
                    }
                } catch (\Exception $e) {
                    \Log::error('Exception encoding service_posts', [
                        'error' => $e->getMessage()
                    ]);
                }
            } 
            // If it's a string, try to validate it as JSON
            else if (is_string($servicePosts)) {
                try {
                    $decoded = json_decode($servicePosts, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        // Validate each post's time duration
                        foreach ($decoded as $post) {
                            if (isset($post['service_time_minutes'])) {
                                $minutes = (int)$post['service_time_minutes'];
                                if ($minutes < 5 || $minutes > 240) {
                                    return response()->json([
                                        'status' => 'error',
                                        'message' => 'Service time minutes must be between 5 and 240'
                                    ], 422);
                                }
                            }
                        }
                        // It's valid JSON, store it as is
                        $updateData['service_posts'] = $servicePosts;
                    } else {
                        \Log::warning('Invalid JSON string for service_posts', [
                            'input' => $servicePosts,
                            'error' => json_last_error_msg()
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Exception processing service_posts', [
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }
        
        // Add timestamp
        $updateData['updated_at'] = now();
        
        // Обработка price_list_path, так как он может передаваться отдельно
        if ($request->has('price_list_path')) {
            $updateData['price_list_path'] = $request->input('price_list_path');
            \Log::info('Updating price list path', [
                'service_point_id' => $id,
                'path' => $updateData['price_list_path']
            ]);
        }
        
        // Filter out columns that don't exist in the current database
        $updateData = $dbAdapter->prepareServicePointData($updateData);
        
        \Log::info('Final update data prepared', [
            'update_data' => $updateData
        ]);
        
        // Perform update
        $updated = $dbAdapter->servicePoints()
            ->where('id', (int)$id)
            ->update($updateData);
        
        if (!$updated) {
            \Log::warning('Update query returned 0 rows affected', [
                'id' => $id,
                'converted_id' => (int)$id
            ]);
        }
        
        // Получаем данные из запроса для обработки услуг
        $requestData = $request->all();
        \Log::info('Raw request data for services processing', [
            'requestData' => $requestData
        ]);
        
        // Обработка услуг и связанных данных через модель Laravel
        try {
            // Найти сервисную точку через модель Laravel для работы с отношениями
            $servicePointModel = \App\Models\ServicePoint::find($id);
            
            if ($servicePointModel) {
                // Обработка services и service_comments
                if (isset($requestData['services']) || isset($requestData['service_comments'])) {
                    \Log::info('Processing services data after direct update', [
                        'has_services' => isset($requestData['services']),
                        'has_service_comments' => isset($requestData['service_comments'])
                    ]);
                    
                    // Сначала отсоединяем все существующие услуги
                    $servicePointModel->services()->detach();
                    \Log::info('Detached all existing services', ['service_point_id' => $id]);
                    
                    // Обработка service_comments если есть
                    if (isset($requestData['service_comments'])) {
                        $serviceComments = $requestData['service_comments'];
                        \Log::info('Processing service_comments from request', [
                            'type' => gettype($serviceComments),
                            'raw_value' => $serviceComments
                        ]);
                        
                        // Если строка JSON, пробуем распарсить
                        if (is_string($serviceComments)) {
                            try {
                                $serviceComments = json_decode($serviceComments, true);
                                \Log::info('Parsed service_comments from JSON string', [
                                    'result' => $serviceComments,
                                    'parsed_type' => gettype($serviceComments)
                                ]);
                                
                                if (json_last_error() !== JSON_ERROR_NONE) {
                                    \Log::warning('JSON parse error for service_comments', [
                                        'error' => json_last_error_msg()
                                    ]);
                                }
                            } catch (\Exception $e) {
                                \Log::warning('Failed to parse service_comments', [
                                    'error' => $e->getMessage(),
                                    'raw' => $serviceComments
                                ]);
                                $serviceComments = [];
                            }
                        }
                        
                        \Log::info('Final service_comments ready for attachment', [
                            'service_comments' => $serviceComments,
                            'count' => is_array($serviceComments) ? count($serviceComments) : 0
                        ]);
                        
                        // Подключаем услуги с комментариями
                        $attachedCount = 0;
                        foreach ($serviceComments as $item) {
                            if (isset($item['service_id'])) {
                                $servicePointModel->services()->attach(
                                    $item['service_id'], 
                                    ['comment' => $item['comment'] ?? null]
                                );
                                $attachedCount++;
                                \Log::info('Attached service with comment', [
                                    'service_id' => $item['service_id'],
                                    'comment' => $item['comment'] ?? null
                                ]);
                            } else {
                                \Log::warning('Skipping invalid service_comment item - missing service_id', [
                                    'item' => $item
                                ]);
                            }
                        }
                        \Log::info('Finished attaching services from service_comments', [
                            'count' => $attachedCount
                        ]);
                    }
                    // Обработка services если service_comments отсутствует
                    else if (isset($requestData['services'])) {
                        $services = $requestData['services'];
                        
                        // Если строка JSON, пробуем распарсить
                        if (is_string($services)) {
                            try {
                                $services = json_decode($services, true);
                            } catch (\Exception $e) {
                                \Log::warning('Failed to parse services', [
                                    'error' => $e->getMessage(),
                                    'raw' => $services
                                ]);
                                $services = [];
                            }
                        }
                        
                        // Подключаем услуги без комментариев
                        $attachedCount = 0;
                        foreach ($services as $serviceId) {
                            $servicePointModel->services()->attach($serviceId);
                            $attachedCount++;
                            \Log::info('Attached service without comment', [
                                'service_id' => $serviceId
                            ]);
                        }
                        \Log::info('Finished attaching services from services array', [
                            'count' => $attachedCount
                        ]);
                    }
                    
                    // Проверка после закрепления услуг
                    $pivotCheck = DB::table('service_point_services')
                        ->where('service_point_id', $id)
                        ->get();
                    
                    \Log::info('Pivot table check after service attachment', [
                        'service_point_id' => $id,
                        'pivot_count' => $pivotCheck->count(),
                        'pivot_services' => $pivotCheck->pluck('service_id')->toArray()
                    ]);
                }
                
                // Принудительный сброс кэша
                $servicePointModel->refresh();
            } else {
                \Log::warning('Failed to find service point model for relationship processing', [
                    'id' => $id
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error processing service relationships', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        // Get updated service point using the new method
        $servicePoint = $dbAdapter->findServicePoint($id);
        if (!$servicePoint) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve service point after update'
            ], 500);
        }
        
        $result = (array)$servicePoint;
        
        // Process working_hours for response
        if (isset($result['working_hours']) && is_string($result['working_hours'])) {
            try {
                $decoded = json_decode($result['working_hours'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $result['working_hours'] = $decoded;
                } else {
                    \Log::warning('Invalid JSON in working_hours after update', [
                        'id' => $id,
                        'working_hours' => $result['working_hours'],
                        'error' => json_last_error_msg() 
                    ]);
                }
            } catch (\Exception $e) {
                \Log::warning('Exception processing working_hours after update', [
                    'id' => $id,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        // Decode service_posts if it's a string
        if (isset($result['service_posts']) && is_string($result['service_posts'])) {
            try {
                $decodedPosts = json_decode($result['service_posts'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $result['service_posts'] = $decodedPosts;
                }
            } catch (\Exception $e) {
                // Keep as is
            }
        }
        
        // Загрузить услуги через модель Laravel
        try {
            // Include inactive service points when loading the model
            $servicePointModel = \App\Models\ServicePoint::withInactive()->with(['services'])->find($id);
            
            if ($servicePointModel) {
                // Добавляем услуги в результат
                $result['services'] = $servicePointModel->services->pluck('id')->toArray();
                
                // Подготовить service_comments в формате, ожидаемом фронтендом
                $serviceComments = [];
                foreach ($servicePointModel->services as $service) {
                    $serviceComments[] = [
                        'service_id' => $service->id,
                        'comment' => $service->pivot->comment
                    ];
                }
                
                // Добавить service_comments в ответ
                $result['service_comments'] = $serviceComments;
                
                \Log::info('v2 - Enhanced service point response with services and comments', [
                    'id' => $id,
                    'services_count' => count($result['services']), 
                    'service_comments_count' => count($serviceComments),
                    'service_comments' => $serviceComments
                ]);
            } else {
                \Log::warning('v2 - Failed to load Laravel model for services', [
                    'id' => $id
                ]);
                // Инициализировать пустые массивы
                $result['services'] = [];
                $result['service_comments'] = [];
            }
            
            // Double-check pivot table to see what's actually in the database
            $pivotTableContents = DB::table('service_point_services')
                ->where('service_point_id', $id)
                ->get();
                
            \Log::info('Final pivot table check in response preparation', [
                'service_point_id' => $id,
                'pivot_records' => $pivotTableContents,
                'pivot_count' => $pivotTableContents->count(),
                'pivot_service_ids' => $pivotTableContents->pluck('service_id')->toArray()
            ]);
            
        } catch (\Exception $e) {
            \Log::error('v2 - Error loading services for response', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            // Инициализировать пустые массивы
            $result['services'] = [];
            $result['service_comments'] = [];
        }
        
        \Log::info('Service point update completed successfully', [
            'id' => $id
        ]);
        
        // Final detailed check of the response data
        \Log::info('Final response data check', [
            'id' => $id,
            'description' => $result['description'] ?? null,
            'notes' => $result['notes'] ?? null,
            'is_active' => $result['is_active'] ?? null,
            'services' => $result['services'] ?? [],
            'service_comments' => $result['service_comments'] ?? [],
            'update_data_description' => $updateData['description'] ?? 'not set in update data',
            'update_data_notes' => $updateData['notes'] ?? 'not set in update data',
            'request_description' => $request->input('description'),
            'request_notes' => $request->input('notes')
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Service point updated successfully',
            'data' => $result
        ]);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to update service point', [
            'id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to update service point',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Debug endpoint to check if service point exists
Route::get('/debug/service-point/{id}', function ($id) {
    $servicePoint = \App\Models\ServicePoint::with('services')->findOrFail($id);
    
    // Prepare service_comments in format expected by frontend
    $serviceComments = [];
    foreach ($servicePoint->services as $service) {
        $serviceComments[] = [
            'service_id' => $service->id,
            'comment' => $service->pivot->comment
        ];
    }
    
    // Add service_comments to the response
    $servicePoint->service_comments = $serviceComments;
    
    return response()->json([
        'status' => 'success',
        'data' => [
            'id' => $servicePoint->id,
            'name' => $servicePoint->name,
            'services' => $servicePoint->services,
            'service_ids' => $servicePoint->services->pluck('id'),
            'service_comments' => $serviceComments,
            'pivot_data' => $servicePoint->services->map(function($service) {
                return [
                    'service_id' => $service->id,
                    'pivot_data' => $service->pivot->toArray()
                ];
            })
        ]
    ]);
});

// Debug endpoint to test v2 endpoint lookup
Route::get('/debug/v2-service-point/{id}', function ($id) {
    try {
        // Use DB adapter service
        $dbAdapter = app(DBAdapterService::class);
        
        // Check if service point exists with direct SQL check
        $checkQuery = "SELECT * FROM service_points WHERE id = :id AND deleted_at IS NULL";
        $rawResult = DB::select($checkQuery, ['id' => $id]);
        
        // Also check with query builder
        $exists = $dbAdapter->servicePoints()->where('id', $id)->exists();
        $servicePoint = $dbAdapter->servicePoints()->where('id', $id)->first();
        
        // Get database configuration info
        $dbConfig = [
            'connection' => DB::getDefaultConnection(),
            'database' => DB::connection()->getDatabaseName(),
            'url' => config('database.connections.' . DB::getDefaultConnection() . '.url'),
            'driver' => config('database.connections.' . DB::getDefaultConnection() . '.driver'),
        ];
        
        // Check table structure
        $columns = [];
        $tableInfo = DB::select("PRAGMA table_info(service_points)");
        foreach ($tableInfo as $column) {
            $columns[] = (array)$column;
        }
        
        return response()->json([
            'status' => 'success',
            'id' => $id,
            'id_type' => gettype($id),
            'raw_result' => $rawResult,
            'raw_count' => count($rawResult),
            'builder_exists' => $exists,
            'builder_result' => $servicePoint ? (array)$servicePoint : null,
            'db_config' => $dbConfig,
            'table_columns' => $columns,
            'route_path' => url()->current()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Debug endpoint to list all service points
Route::get('/debug/service-points-list', function () {
    try {
        // Get all service points directly from the database
        $servicePoints = DB::select("SELECT * FROM service_points");
        $formatted = array_map(function($point) {
            // Convert to array for consistent output
            return (array)$point;
        }, $servicePoints);
        
        // Also check with the DBAdapter
        $dbAdapter = app(DBAdapterService::class);
        $adapterPoints = $dbAdapter->servicePoints()->get();
        $adapterFormatted = [];
        foreach ($adapterPoints as $point) {
            $adapterFormatted[] = (array)$point;
        }
        
        return response()->json([
            'status' => 'success',
            'all_records' => $formatted,
            'record_count' => count($formatted),
            'adapter_records' => $adapterFormatted,
            'adapter_count' => count($adapterFormatted)
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Partner service points endpoint for v2 API
Route::get('/v2/partners/{partnerId}/service-points', function ($partnerId) {
    try {
        \Log::info('V2 endpoint - Fetching service points for partner', [
            'partner_id' => $partnerId
        ]);
        
        // Use DB adapter service
        $dbAdapter = app(DBAdapterService::class);
        
        // Get service points for partner
        $servicePoints = $dbAdapter->servicePoints()
            ->where('partner_id', $partnerId)
            ->get();
        
        $result = [];
        foreach ($servicePoints as $point) {
            $item = (array)$point;
            
            // Process working_hours if it's a string
            if (isset($item['working_hours']) && is_string($item['working_hours'])) {
                try {
                    $decoded = json_decode($item['working_hours'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $item['working_hours'] = $decoded;
                    }
                } catch (\Exception $e) {
                    // Keep as is
                }
            }
            
            $result[] = $item;
        }
        
        \Log::info('Service points found for partner', [
            'partner_id' => $partnerId,
            'count' => count($result)
        ]);
        
        // Загружаем услуги для точек обслуживания партнера
        try {
            // Получаем ID всех точек партнера
            $pointIds = array_column($result, 'id');
            
            // Загружаем модели с услугами по этим ID
            $servicePointsWithServices = \App\Models\ServicePoint::with('services')
                ->whereIn('id', $pointIds)
                ->get();
            
            // Индексируем по ID для быстрого доступа
            $servicesById = [];
            foreach ($servicePointsWithServices as $servicePoint) {
                $servicesArray = $servicePoint->services->pluck('id')->toArray();
                
                // Подготовить service_comments
                $serviceComments = [];
                foreach ($servicePoint->services as $service) {
                    $serviceComments[] = [
                        'service_id' => $service->id,
                        'comment' => $service->pivot->comment
                    ];
                }
                
                $servicesById[$servicePoint->id] = [
                    'services' => $servicesArray,
                    'service_comments' => $serviceComments
                ];
            }
            
            // Дополняем результат услугами
            foreach ($result as &$item) {
                $pointId = $item['id'];
                if (isset($servicesById[$pointId])) {
                    $item['services'] = $servicesById[$pointId]['services'];
                    $item['service_comments'] = $servicesById[$pointId]['service_comments'];
                } else {
                    $item['services'] = [];
                    $item['service_comments'] = [];
                }
            }
            
            \Log::info('v2 - Enhanced partner service points with services', [
                'partner_id' => $partnerId,
                'points_count' => count($result),
                'with_services_count' => count($servicesById)
            ]);
        } catch (\Exception $e) {
            \Log::error('v2 - Error loading services for partner service points', [
                'partner_id' => $partnerId,
                'error' => $e->getMessage()
            ]);
            
            // Добавляем пустые массивы услуг, если произошла ошибка
            foreach ($result as &$item) {
                $item['services'] = [];
                $item['service_comments'] = [];
            }
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $result
        ]);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to retrieve service points for partner', [
            'partner_id' => $partnerId,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to retrieve service points for partner',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Delete service point endpoint for v2 API
Route::delete('/v2/service-points/{id}', function ($id) {
    try {
        \Log::info('V2 endpoint - Deleting service point', [
            'id' => $id
        ]);
        
        // Use DB adapter service
        $dbAdapter = app(DBAdapterService::class);
        
        // Check if service point exists
        if (!$dbAdapter->servicePointExists($id)) {
            \Log::error('Service point not found for deletion', [
                'id' => $id
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Service point not found'
            ], 404);
        }
        
        // Perform soft delete
        $dbAdapter->servicePoints()
            ->where('id', (int)$id)
            ->update([
                'deleted_at' => now()
            ]);
        
        \Log::info('Service point deleted successfully', [
            'id' => $id
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Service point deleted successfully'
        ]);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to delete service point', [
            'id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to delete service point',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Create service point endpoint for v2 API
Route::post('/v2/service-points', function (Request $request) {
    try {
        \Log::info('V2 endpoint - Creating service point', [
            'request_data' => $request->all()
        ]);
        
        // Basic validation
        $validator = Validator::make($request->all(), [
            'partner_id' => 'required|numeric',
            'name' => 'required|string',
            'address' => 'required|string',
            'working_hours' => 'required'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Use DB adapter service
        $dbAdapter = app(DBAdapterService::class);
        
        // Prepare data for insertion
        $data = [
            'partner_id' => $request->input('partner_id'),
            'name' => $request->input('name'),
            'address' => $request->input('address'),
            'region' => $request->input('region'),
            'city' => $request->input('city'),
            'created_at' => now(),
            'updated_at' => now()
        ];
        
        // Set coordinates if provided, otherwise use defaults
        $data['lat'] = $request->input('lat', 0);
        $data['lng'] = $request->input('lng', 0);
        
        // Handle working_hours with special care
        $workingHours = $request->input('working_hours');
        if (is_array($workingHours) || is_object($workingHours)) {
            // Ensure all days are present
            $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            $normalizedWorkingHours = [];
            
            // Convert to array if it's an object
            $workingHoursArray = (array)$workingHours;
            
            foreach ($daysOfWeek as $day) {
                if (isset($workingHoursArray[$day])) {
                    $normalizedWorkingHours[$day] = $workingHoursArray[$day];
                } else {
                    // Default to closed if day not specified
                    $normalizedWorkingHours[$day] = 'closed';
                }
            }
            
            // Encode the normalized structure
            $data['working_hours'] = json_encode($normalizedWorkingHours);
        } else if (is_string($workingHours)) {
            // Try to parse the string to see if it's valid JSON
            try {
                $decoded = json_decode($workingHours, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    // Ensure all days are present in the decoded data
                    $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    foreach ($daysOfWeek as $day) {
                        if (!isset($decoded[$day])) {
                            $decoded[$day] = 'closed';
                        }
                    }
                    
                    // Re-encode with the normalized data
                    $data['working_hours'] = json_encode($decoded);
                } else {
                    // Use a default value
                    $data['working_hours'] = json_encode([
                        'monday' => ['open' => '09:00', 'close' => '18:00'],
                        'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                        'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                        'thursday' => ['open' => '09:00', 'close' => '18:00'],
                        'friday' => ['open' => '09:00', 'close' => '18:00'],
                        'saturday' => ['open' => '10:00', 'close' => '16:00'],
                        'sunday' => 'closed'
                    ]);
                }
            } catch (\Exception $e) {
                // Use a default value
                $data['working_hours'] = json_encode([
                    'monday' => ['open' => '09:00', 'close' => '18:00'],
                    'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                    'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                    'thursday' => ['open' => '09:00', 'close' => '18:00'],
                    'friday' => ['open' => '09:00', 'close' => '18:00'],
                    'saturday' => ['open' => '10:00', 'close' => '16:00'],
                    'sunday' => 'closed'
                ]);
            }
        } else {
            // Use a default value
            $data['working_hours'] = json_encode([
                'monday' => ['open' => '09:00', 'close' => '18:00'],
                'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                'thursday' => ['open' => '09:00', 'close' => '18:00'],
                'friday' => ['open' => '09:00', 'close' => '18:00'],
                'saturday' => ['open' => '10:00', 'close' => '16:00'],
                'sunday' => 'closed'
            ]);
        }
        
        // Additional fields from service points extensions
        $additionalFields = [
            'description', 'contact_info', 'notes', 'is_active', 
            'num_posts', 'service_time_grid', 'price_list_path'
        ];
        
        foreach ($additionalFields as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }
        
        // Filter to include only existing columns
        $data = $dbAdapter->prepareServicePointData($data);
        
        // Insert the new service point
        $id = $dbAdapter->servicePoints()->insertGetId($data);
        
        \Log::info('Service point created successfully', [
            'id' => $id
        ]);
        
        // Retrieve the newly created service point
        $servicePoint = $dbAdapter->findServicePoint($id);
        if (!$servicePoint) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve service point after creation'
            ], 500);
        }
        
        $result = (array)$servicePoint;
        
        // Process working_hours for response
        if (isset($result['working_hours']) && is_string($result['working_hours'])) {
            try {
                $decoded = json_decode($result['working_hours'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $result['working_hours'] = $decoded;
                }
            } catch (\Exception $e) {
                // Keep as is
            }
        }
        
        // Decode service_posts if it's a string
        if (isset($result['service_posts']) && is_string($result['service_posts'])) {
            try {
                $decodedPosts = json_decode($result['service_posts'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $result['service_posts'] = $decodedPosts;
                }
            } catch (\Exception $e) {
                // Keep as is
            }
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Service point created successfully',
            'data' => $result
        ], 201);
    } catch (\Exception $e) {
        \Log::error('V2 endpoint - Failed to create service point', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to create service point',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Add a simple test endpoint
Route::get('/test-direct-service-points', function () {
    try {
        // First, let's check if we can connect to the database
        try {
            \DB::connection()->getPdo();
            $dbConnection = 'Connected to database: ' . \DB::connection()->getDatabaseName();
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database connection failed',
                'error' => $e->getMessage()
            ], 500);
        }
        
        // Check if tables exist
        $tables = [];
        $tablesCheck = \DB::select("SELECT name FROM sqlite_master WHERE type='table'");
        foreach ($tablesCheck as $table) {
            $tables[] = $table->name;
        }
        
        // Insert a test record
        \DB::table('service_points')->insert([
            'partner_id' => 1,
            'name' => 'Test Service Point',
            'address' => 'Test Address',
            'lat' => 55.555,
            'lng' => 37.777,
            'working_hours' => json_encode([
                'monday' => ['open' => '09:00', 'close' => '18:00'],
                'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                'thursday' => ['open' => '09:00', 'close' => '18:00'],
                'friday' => ['open' => '09:00', 'close' => '18:00'],
                'saturday' => ['open' => '10:00', 'close' => '16:00'],
                'sunday' => 'closed',
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Get all service points
        $servicePoints = \DB::table('service_points')->get();
        
        return response()->json([
            'status' => 'success',
            'db_connection' => $dbConnection,
            'tables' => $tables,
            'service_points' => $servicePoints,
            'count' => count($servicePoints)
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error in test route',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Ping endpoint to check if API is responding
Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});

// CORS Headers test endpoint
Route::get('/cors-test', function () {
    return response()->json([
        'message' => 'CORS headers test successful',
        'headers' => [
            'Access-Control-Allow-Origin' => request()->header('Origin') ?? '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
        ],
        'client_info' => [
            'ip' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'origin' => request()->header('Origin'),
        ]
    ]);
});

// Upload price list file endpoint
Route::post('/service-points/upload-price-list', function (Request $request) {
    try {
        if (!$request->hasFile('file')) {
            return response()->json([
                'status' => 'error',
                'message' => 'No file uploaded'
            ], 400);
        }
        
        $file = $request->file('file');
        
        // Validate file type
        $allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid file type. Allowed types: PDF, XLS, XLSX'
            ], 400);
        }
        
        // Store the file
        $path = $file->store('price-lists', 'public');
        
        return response()->json([
            'status' => 'success',
            'message' => 'Price list uploaded successfully',
            'path' => 'storage/' . $path
        ]);
    } catch (\Exception $e) {
        \Log::error('Failed to upload price list', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to upload price list',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Service point photos endpoint
Route::get('/service-points/{servicePoint}/photos', function ($servicePointId) {
    try {
        $photos = \App\Models\ServicePointPhoto::where('service_point_id', $servicePointId)
            ->orderBy('sort_order')
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $photos
        ]);
    } catch (\Exception $e) {
        \Log::error('Failed to get service point photos', [
            'service_point_id' => $servicePointId,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to get service point photos',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Upload service point photos endpoint
Route::post('/service-points/photos', function (Request $request) {
    try {
        $validator = Validator::make($request->all(), [
            'service_point_id' => 'required|exists:service_points,id',
            'photos' => 'required|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg|max:5120', // 5MB max
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $servicePointId = $request->input('service_point_id');
        
        // Check if we already have 10 photos
        $photoCount = \App\Models\ServicePointPhoto::where('service_point_id', $servicePointId)->count();
        if ($photoCount + count($request->file('photos')) > 10) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maximum of 10 photos allowed per service point'
            ], 400);
        }
        
        $uploadedPhotos = [];
        $nextSortOrder = $photoCount + 1;
        
        foreach ($request->file('photos') as $photo) {
            $path = $photo->store('service-point-photos', 'public');
            
            $photoModel = new \App\Models\ServicePointPhoto([
                'service_point_id' => $servicePointId,
                'path' => 'storage/' . $path,
                'sort_order' => $nextSortOrder++
            ]);
            $photoModel->save();
            
            $uploadedPhotos[] = $photoModel;
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Photos uploaded successfully',
            'data' => $uploadedPhotos
        ], 201);
    } catch (\Exception $e) {
        \Log::error('Failed to upload service point photos', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to upload photos',
            'error' => $e->getMessage()
        ], 500);
    }
});

// ВРЕМЕННЫЙ DEBUG-РОУТ: возвращает все точки без scope и фильтров
Route::get('/v2/service-points/all-raw', [\App\Http\Controllers\v2\ServicePointController::class, 'allRaw']);

// Direct status update route
Route::patch('/api/v2/service-points/{id}/status', [\App\Http\Controllers\v2\ServicePointController::class, 'updateStatus']);

// V2 API routes for ServicePointController
Route::prefix('v2')->group(function () {
    Route::get('/service-points', [\App\Http\Controllers\v2\ServicePointController::class, 'index']);
    Route::post('/service-points', [\App\Http\Controllers\v2\ServicePointController::class, 'store']);
    Route::get('/service-points/filter', [\App\Http\Controllers\v2\ServicePointController::class, 'filter']);
    Route::patch('/service-points/{id}/status', [\App\Http\Controllers\v2\ServicePointController::class, 'updateStatus']);
    Route::get('/service-points/{id}', [\App\Http\Controllers\v2\ServicePointController::class, 'show']);
    Route::put('/service-points/{id}', [\App\Http\Controllers\v2\ServicePointController::class, 'update']);
    Route::delete('/service-points/{id}', [\App\Http\Controllers\v2\ServicePointController::class, 'destroy']);
    Route::get('/partners/{id}/service-points', [\App\Http\Controllers\v2\ServicePointController::class, 'getByPartnerId']);
    Route::post('/service-points/{id}/files', [\App\Http\Controllers\v2\ServicePointController::class, 'uploadFiles']);
    
    // Add a v2 partners endpoint
    Route::get('/partners', [\App\Http\Controllers\PartnerTestController::class, 'index']);
    Route::get('/partners/{id}', [\App\Http\Controllers\PartnerTestController::class, 'show']);
    Route::post('/partners', [\App\Http\Controllers\PartnerTestController::class, 'store']);
    Route::put('/partners/{id}', [\App\Http\Controllers\PartnerTestController::class, 'update']);
    Route::delete('/partners/{id}', [\App\Http\Controllers\PartnerTestController::class, 'destroy']);
});

// Роуты для скачивания файлов
Route::get('/v2/download/price-list/{filename}', [App\Http\Controllers\v2\ServicePointController::class, 'downloadPriceList']);

// Debugging route for file access
Route::get('/test-file-access/{filename}', function($filename) {
    $path = 'price-lists/' . $filename;
    
    // Проверяем, существует ли файл
    if (!Storage::disk('public')->exists($path)) {
        return response()->json([
            'status' => 'error',
            'message' => 'File not found',
            'path' => $path,
            'available_files' => Storage::disk('public')->files('price-lists')
        ], 404);
    }
    
    $fullPath = Storage::disk('public')->path($path);
    
    return response()->json([
        'status' => 'success',
        'file_info' => [
            'path' => $path,
            'full_path' => $fullPath,
            'exists' => file_exists($fullPath),
            'size' => file_exists($fullPath) ? filesize($fullPath) : 0,
            'is_readable' => is_readable($fullPath),
            'mime' => mime_content_type($fullPath)
        ],
        'public_url' => Storage::disk('public')->url($path),
        'direct_download_url' => url("/api/v2/download/price-list/{$filename}")
    ]);
});

// Direct download route
Route::get('/direct-download/price-list/{filename}', function($filename) {
    try {
        // Normalize the filename
        $normalizedFilename = basename($filename);
        $path = 'price-lists/' . $normalizedFilename;
        
        \Log::info('Direct download request', [
            'filename' => $filename,
            'normalized' => $normalizedFilename,
            'path' => $path,
            'storage_path' => \Storage::disk('public')->path($path)
        ]);
        
        // Check if file exists
        if (!\Storage::disk('public')->exists($path)) {
            \Log::error('Direct download: file not found', [
                'path' => $path,
                'storage_path' => \Storage::disk('public')->path($path),
                'public_path' => public_path($path),
                'disk_files' => \Storage::disk('public')->files('price-lists'),
                'public_directory' => file_exists(public_path('price-lists')) ? 'exists' : 'not found'
            ]);
            
            // Try alternative path
            $alternativePath = basename($normalizedFilename);
            if (\Storage::disk('public')->exists('price-lists/' . $alternativePath)) {
                $path = 'price-lists/' . $alternativePath;
                \Log::info('Found file at alternative path', ['path' => $path]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File not found',
                    'path' => $path,
                    'filename' => $normalizedFilename,
                    'requested_filename' => $filename
                ], 404);
            }
        }
        
        // Get file path and extension
        $fullPath = \Storage::disk('public')->path($path);
        
        \Log::info('Serving file for direct download', [
            'path' => $path,
            'fullPath' => $fullPath,
            'file_exists' => file_exists($fullPath),
            'file_size' => file_exists($fullPath) ? filesize($fullPath) : 'N/A'
        ]);
        
        if (!file_exists($fullPath)) {
            \Log::error('File exists in storage but not in filesystem', [
                'path' => $path,
                'fullPath' => $fullPath
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'File not accessible on filesystem'
            ], 500);
        }
        
        $extension = strtolower(pathinfo($normalizedFilename, PATHINFO_EXTENSION));
        
        // Set content type based on extension
        $contentType = 'application/octet-stream';
        if ($extension === 'pdf') {
            $contentType = 'application/pdf';
        } elseif ($extension === 'xlsx') {
            $contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } elseif ($extension === 'xls') {
            $contentType = 'application/vnd.ms-excel';
        }
        
        // Return file for download
        return response()->file($fullPath, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'attachment; filename="' . $normalizedFilename . '"'
        ]);
    } catch (\Exception $e) {
        \Log::error('Error in direct download', [
            'filename' => $filename,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Error serving file: ' . $e->getMessage()
        ], 500);
    }
});

// Add identical route with /api prefix to match frontend expectations
Route::get('/api/direct-download/price-list/{filename}', function($filename) {
    try {
        // Normalize the filename
        $normalizedFilename = basename($filename);
        $path = 'price-lists/' . $normalizedFilename;
        
        \Log::info('API Direct download request', [
            'filename' => $filename,
            'normalized' => $normalizedFilename,
            'path' => $path,
            'storage_path' => \Storage::disk('public')->path($path)
        ]);
        
        // Check if file exists
        if (!\Storage::disk('public')->exists($path)) {
            \Log::error('API Direct download: file not found', [
                'path' => $path,
                'storage_path' => \Storage::disk('public')->path($path),
                'public_path' => public_path($path),
                'disk_files' => \Storage::disk('public')->files('price-lists'),
                'public_directory' => file_exists(public_path('price-lists')) ? 'exists' : 'not found'
            ]);
            
            // Try alternative path
            $alternativePath = basename($normalizedFilename);
            if (\Storage::disk('public')->exists('price-lists/' . $alternativePath)) {
                $path = 'price-lists/' . $alternativePath;
                \Log::info('Found file at alternative path', ['path' => $path]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File not found',
                    'path' => $path,
                    'filename' => $normalizedFilename,
                    'requested_filename' => $filename
                ], 404);
            }
        }
        
        // Get file path and extension
        $fullPath = \Storage::disk('public')->path($path);
        
        \Log::info('Serving file for API direct download', [
            'path' => $path,
            'fullPath' => $fullPath,
            'file_exists' => file_exists($fullPath),
            'file_size' => file_exists($fullPath) ? filesize($fullPath) : 'N/A'
        ]);
        
        if (!file_exists($fullPath)) {
            \Log::error('File exists in storage but not in filesystem', [
                'path' => $path,
                'fullPath' => $fullPath
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'File not accessible on filesystem'
            ], 500);
        }
        
        $extension = strtolower(pathinfo($normalizedFilename, PATHINFO_EXTENSION));
        
        // Set content type based on extension
        $contentType = 'application/octet-stream';
        if ($extension === 'pdf') {
            $contentType = 'application/pdf';
        } elseif ($extension === 'xlsx') {
            $contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } elseif ($extension === 'xls') {
            $contentType = 'application/vnd.ms-excel';
        }
        
        // Return file for download
        return response()->file($fullPath, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'attachment; filename="' . $normalizedFilename . '"'
        ]);
    } catch (\Exception $e) {
        \Log::error('Error in API direct download', [
            'filename' => $filename,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Error serving file: ' . $e->getMessage()
        ], 500);
    }
});

// Add the v2 download route with /api prefix to match frontend expectations
Route::get('/api/v2/download/price-list/{filename}', [App\Http\Controllers\v2\ServicePointController::class, 'downloadPriceList']);