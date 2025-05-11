<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServicePoint;
use App\Services\MapService;
use App\Models\Schedule;
use Carbon\Carbon;
use App\Http\Requests\CreateScheduleRequest;
use Illuminate\Support\Facades\DB;

class ServicePointController extends Controller
{
    public function __construct(private MapService $mapService) {}

    public function index(Request $request)
    {
        try {
            $query = ServicePoint::query();
            
            // Include inactive service points if requested
            if (!($request->has('include_inactive') && $request->boolean('include_inactive'))) {
                $query->active();
            }
            
            // Include additional filtering options if needed
            if ($request->has('partner_id')) {
                $query->where('partner_id', $request->input('partner_id'));
            }
            
            $servicePoints = $query->get();
            
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
                'message' => 'Failed to retrieve service points',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        \Log::info('Incoming request data', $request->all());

        try {
            $validated = $request->validate([
                'partner_id' => 'required|exists:partners,id',
                'name' => 'required|string',
                'region' => 'nullable|string',
                'city' => 'nullable|string',
                'address' => 'required|string',
                'working_hours' => 'required|json',
                'description' => 'nullable|string',
                'contact_info' => 'nullable|string',
                'notes' => 'nullable|string',
                'is_active' => 'nullable|boolean',
                'num_posts' => 'nullable|integer|min:1',
                'service_time_grid' => 'nullable|json',
                'service_posts' => 'nullable|json',
                'services' => 'nullable|array',
                'services.*' => 'exists:services,id',
                'service_comments' => 'nullable',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', $e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        }

        // Special handling for boolean fields to ensure they're properly saved
        if (isset($validated['is_active'])) {
            $originalValue = $validated['is_active'];
            
            // Determine the boolean value regardless of input format (int, string, bool)
            $isActive = false;
            
            // Handle different input types
            if (is_bool($originalValue)) {
                $isActive = $originalValue;
            } else if (is_numeric($originalValue)) {
                $isActive = (bool)$originalValue;
            } else if (is_string($originalValue)) {
                // Handle string values like "true", "false", "1", "0"
                $isActive = in_array(strtolower($originalValue), ['true', '1', 'yes', 'on']);
            }
            
            // Convert to integer for database compatibility
            $validated['is_active'] = $isActive ? 1 : 0;
            
            \Log::info('Enhanced handling of boolean is_active field in store', [
                'original_value' => $originalValue,
                'value_type' => gettype($originalValue),
                'parsed_boolean' => $isActive,
                'converted_value' => $validated['is_active']
            ]);
        }

        // Validate service_posts time durations if present
        if (isset($validated['service_posts'])) {
            try {
                $servicePosts = $validated['service_posts'];
                
                // If it's a string, decode and validate
                if (is_string($servicePosts)) {
                    $decodedPosts = json_decode($servicePosts, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        // Validate each post's time duration
                        foreach ($decodedPosts as $post) {
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
                        // Re-encode with validated data
                        $validated['service_posts'] = json_encode($decodedPosts);
                    }
                }
                // If it's an array, validate and encode
                else if (is_array($servicePosts)) {
                    foreach ($servicePosts as $post) {
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
                    $validated['service_posts'] = json_encode($servicePosts);
                }
            } catch (\Exception $e) {
                \Log::error('Error processing service posts', [
                    'error' => $e->getMessage()
                ]);
                // Remove invalid service_posts data
                unset($validated['service_posts']);
            }
        }

        // Get coordinates through MapService
        $coordinates = $this->mapService->geocodeAddress($validated['address']);

        if (!$coordinates) {
            return response()->json(['error' => 'Не удалось определить координаты для указанного адреса.'], 422);
        }

        $validated['lat'] = $coordinates['lat'];
        $validated['lng'] = $coordinates['lng'];

        // Handle services separately
        $services = $validated['services'] ?? [];
        unset($validated['services']);
        
        // Handle service_comments if provided
        $serviceComments = null;
        if (isset($validated['service_comments'])) {
            try {
                // If it's a string, try to decode it
                if (is_string($validated['service_comments'])) {
                    $serviceComments = json_decode($validated['service_comments'], true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        \Log::error('Failed to parse service_comments JSON', [
                            'service_comments' => $validated['service_comments'],
                            'json_error' => json_last_error_msg()
                        ]);
                        $serviceComments = null;
                    }
                } else if (is_array($validated['service_comments'])) {
                    $serviceComments = $validated['service_comments'];
                }
                
                \Log::info('Processed service_comments for new service point', [
                    'service_comments' => $serviceComments
                ]);
            } catch (\Exception $e) {
                \Log::error('Error processing service_comments for new service point', [
                    'error' => $e->getMessage()
                ]);
                $serviceComments = null;
            }
            
            unset($validated['service_comments']);
        }

        // Create service point
        $servicePoint = ServicePoint::create($validated);

        // Attach services with comments if available
        if ($serviceComments !== null) {
            $attachedServices = 0;
            $errorServices = [];

            foreach ($serviceComments as $serviceComment) {
                if (isset($serviceComment['service_id'])) {
                    $serviceId = $serviceComment['service_id'];
                    $comment = $serviceComment['comment'] ?? null;
                    
                    // Проверить существование услуги
                    $service = \App\Models\Service::find($serviceId);
                    if (!$service) {
                        \Log::warning('Service not found for attachment during create', [
                            'service_id' => $serviceId
                        ]);
                        $errorServices[] = $serviceId;
                        continue;
                    }
                    
                    try {
                        $servicePoint->services()->attach($serviceId, ['comment' => $comment]);
                        $attachedServices++;
                        
                        \Log::info('Attached service with comment to new service point', [
                            'service_id' => $serviceId,
                            'comment' => $comment
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('Failed to attach service to new service point', [
                            'service_id' => $serviceId,
                            'comment' => $comment,
                            'error' => $e->getMessage()
                        ]);
                        $errorServices[] = $serviceId;
                    }
                }
            }
            
            // Лог результатов привязки услуг
            \Log::info('Finished attaching services to new service point', [
                'service_point_id' => $servicePoint->id,
                'attached_count' => $attachedServices,
                'errors_count' => count($errorServices),
                'error_services' => $errorServices
            ]);
        }
        // Otherwise attach services without comments
        else if (!empty($services)) {
            try {
                $servicePoint->services()->attach($services);
                \Log::info('Attached services without comments to new service point', [
                    'services' => $services,
                    'count' => count($services)
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to attach services without comments to new service point', [
                    'services' => $services,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Handle file upload - price list
        if ($request->hasFile('price_list') && $request->file('price_list')->isValid()) {
            $file = $request->file('price_list');
            $extension = $file->getClientOriginalExtension();
            
            // Check if the file is Excel or PDF
            if (!in_array(strtolower($extension), ['xlsx', 'xls', 'pdf'])) {
                return response()->json(['error' => 'Файл прайс-листа должен быть в формате Excel или PDF.'], 422);
            }
            
            $fileName = 'price_list_' . $servicePoint->id . '_' . time() . '.' . $extension;
            $file->storeAs('price_lists', $fileName, 'public');
            
            $servicePoint->price_list_path = 'price_lists/' . $fileName;
            $servicePoint->save();
        }

        // Handle photo uploads
        if ($request->hasFile('photos')) {
            $photos = $request->file('photos');
            $order = 0;
            
            // Check if photos count doesn't exceed 10
            if (count($photos) > 10) {
                return response()->json(['error' => 'Максимальное количество фотографий: 10.'], 422);
            }
            
            foreach ($photos as $photo) {
                if ($photo->isValid()) {
                    $fileName = 'service_point_' . $servicePoint->id . '_' . time() . '_' . $order . '.' . $photo->getClientOriginalExtension();
                    $photo->storeAs('service_point_photos', $fileName, 'public');
                    
                    $servicePoint->photos()->create([
                        'path' => 'service_point_photos/' . $fileName,
                        'sort_order' => $order
                    ]);
                    
                    $order++;
                }
            }
        }

        // Load the services with their comments for the response
        $servicePoint->load('services');
        
        // Prepare service_comments based on pivot data
        $responseServiceComments = [];
        foreach ($servicePoint->services as $service) {
            $responseServiceComments[] = [
                'service_id' => $service->id,
                'comment' => $service->pivot->comment
            ];
        }
        
        // Add service_comments to the response
        $servicePoint->service_comments = $responseServiceComments;

        // Сбросить любые кэши и проверить, что отношения загружены правильно
        DB::flushQueryLog();
        $servicePoint->refresh();
        
        // Проверить, что услуги корректно подключены
        \Log::info('Final service point services check after create', [
            'id' => $servicePoint->id, 
            'services_count' => $servicePoint->services()->count(),
            'services' => $servicePoint->services()->pluck('id')->toArray()
        ]);
        
        // Выполнить проверку pivot-таблицы
        $pivotCheck = DB::table('service_point_services')
            ->where('service_point_id', $servicePoint->id)
            ->get();
        
        \Log::info('Final pivot table check after create', [
            'service_point_id' => $servicePoint->id,
            'pivot_count' => $pivotCheck->count(),
            'pivot_services' => $pivotCheck->pluck('service_id')->toArray()
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $servicePoint
        ], 201);
    }

    public function show(ServicePoint $servicePoint)
    {
        try {
            // Transform working_hours to JSON object from string
            if (is_string($servicePoint->working_hours)) {
                $servicePoint->working_hours = json_decode($servicePoint->working_hours, true);
            }
            
            // Transform service_posts to JSON object from string
            if (is_string($servicePoint->service_posts)) {
                $servicePoint->service_posts = json_decode($servicePoint->service_posts, true);
            }
            
            // Load services with comments
            $servicePoint->load('services');
            
            // Prepare service_comments based on pivot data
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
                'data' => $servicePoint
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching service point', [
                'id' => $servicePoint->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve service point',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, ServicePoint $servicePoint)
    {
        try {
            // Получаем сервисную точку с withInactive, чтобы можно было менять статус
            $servicePoint = ServicePoint::withInactive()->find($servicePoint->id);
            \Log::info('Updating service point - DETAILED DEBUG', [
                'id' => $servicePoint->id,
                'request_data' => $request->all(),
                'headers' => $request->headers->all(),
                'raw_content' => $request->getContent(),
            ]);
            
            $validated = $request->validate([
                'name' => 'sometimes|string',
                'region' => 'nullable|string',
                'city' => 'nullable|string',
                'address' => 'sometimes|string',
                'lat' => 'sometimes|numeric',
                'lng' => 'sometimes|numeric',
                'working_hours' => 'sometimes',
                'description' => 'nullable|string',
                'contact_info' => 'nullable|string',
                'notes' => 'nullable|string',
                'is_active' => 'nullable|boolean',
                'num_posts' => 'nullable|integer|min:1',
                'service_time_grid' => 'nullable|json',
                'service_posts' => 'nullable|json',
                'services' => 'nullable|array',
                'services.*' => 'exists:services,id',
                'service_comments' => 'nullable',
            ]);
            
            // Special handling for boolean fields to ensure they're properly saved
            if (isset($validated['is_active'])) {
                $originalValue = $validated['is_active'];
                
                // Determine the boolean value regardless of input format (int, string, bool)
                $isActive = false;
                
                // Handle different input types
                if (is_bool($originalValue)) {
                    $isActive = $originalValue;
                } else if (is_numeric($originalValue)) {
                    $isActive = (bool)$originalValue;
                } else if (is_string($originalValue)) {
                    // Handle string values like "true", "false", "1", "0"
                    $isActive = in_array(strtolower($originalValue), ['true', '1', 'yes', 'on']);
                }
                
                // Convert to integer for database compatibility
                $validated['is_active'] = $isActive ? 1 : 0;
                
                \Log::info('Enhanced handling of boolean is_active field in update', [
                    'original_value' => $originalValue,
                    'value_type' => gettype($originalValue),
                    'parsed_boolean' => $isActive,
                    'converted_value' => $validated['is_active']
                ]);
            }
            
            \Log::info('Validated data for service point update - DETAILED DEBUG', [
                'id' => $servicePoint->id,
                'validated_data' => $validated
            ]);
            
            // Ensure working_hours is properly formatted as JSON
            if (isset($validated['working_hours'])) {
                try {
                    $workingHours = $validated['working_hours'];
                    \Log::info('Processing working_hours', [
                        'type' => gettype($workingHours),
                        'value' => $workingHours
                    ]);
                    
                    // Handle different input formats
                    if (is_string($workingHours)) {
                        // Try to decode the string to check if it's valid JSON
                        $decodedHours = json_decode($workingHours, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            \Log::warning('Invalid working_hours JSON received', [
                                'id' => $servicePoint->id,
                                'error' => json_last_error_msg(),
                                'working_hours' => $workingHours
                            ]);
                            
                            // If we can't parse it, use a default structure
                            $decodedHours = [
                                'monday' => ['open' => '09:00', 'close' => '18:00'],
                                'tuesday' => ['open' => '09:00', 'close' => '18:00'],
                                'wednesday' => ['open' => '09:00', 'close' => '18:00'],
                                'thursday' => ['open' => '09:00', 'close' => '18:00'],
                                'friday' => ['open' => '09:00', 'close' => '18:00'],
                                'saturday' => ['open' => '10:00', 'close' => '16:00'],
                                'sunday' => 'closed'
                            ];
                        }
                        // Re-encode to ensure valid JSON
                        $validated['working_hours'] = json_encode($decodedHours);
                    } 
                    // If it's already an array or object
                    else if (is_array($workingHours) || is_object($workingHours)) {
                        // Ensure all days of the week are present
                        $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                        $workingHoursArray = (array)$workingHours;
                        
                        foreach ($daysOfWeek as $day) {
                            if (!isset($workingHoursArray[$day])) {
                                $workingHoursArray[$day] = 'closed';
                            }
                        }
                        
                        // Re-encode as a valid JSON string
                        $validated['working_hours'] = json_encode($workingHoursArray);
                    }
                    
                    \Log::info('Final working_hours for database', [
                        'working_hours' => $validated['working_hours']
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Error processing working hours', [
                        'id' => $servicePoint->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    
                    // If an exception occurred, don't update working_hours
                    unset($validated['working_hours']);
                }
            }
            
            // Handle service time grid similarly
            if (isset($validated['service_time_grid'])) {
                try {
                    $serviceTimeGrid = $validated['service_time_grid'];
                    
                    // Process similarly to working_hours
                    if (is_string($serviceTimeGrid)) {
                        $decodedGrid = json_decode($serviceTimeGrid, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            unset($validated['service_time_grid']);
                        } else {
                            $validated['service_time_grid'] = json_encode($decodedGrid);
                        }
                    } else if (is_array($serviceTimeGrid) || is_object($serviceTimeGrid)) {
                        $validated['service_time_grid'] = json_encode((array)$serviceTimeGrid);
                    }
                } catch (\Exception $e) {
                    unset($validated['service_time_grid']);
                }
            }
            
            // Process service_posts for storage
            if (isset($validated['service_posts'])) {
                try {
                    $servicePosts = $validated['service_posts'];
                    
                    // If it's a string, try to decode it
                    if (is_string($servicePosts)) {
                        $decodedPosts = json_decode($servicePosts, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            // Validate each post's time duration is within allowed range
                            foreach ($decodedPosts as $post) {
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
                            $validated['service_posts'] = json_encode($decodedPosts);
                        } else {
                            unset($validated['service_posts']);
                        }
                    } 
                    // If it's already an array, validate and encode
                    else if (is_array($servicePosts)) {
                        // Validate each post's time duration is within allowed range
                        foreach ($servicePosts as $post) {
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
                        $validated['service_posts'] = json_encode($servicePosts);
                    }
                } catch (\Exception $e) {
                    \Log::error('Error processing service posts', [
                        'error' => $e->getMessage()
                    ]);
                    unset($validated['service_posts']);
                }
            }
            
            // Handle services and service_comments separately
            $services = null;
            $serviceComments = null;
            
            if (isset($validated['services'])) {
                $services = $validated['services'];
                \Log::info('Services found in request - DETAILED DEBUG', [
                    'services' => $services
                ]);
                unset($validated['services']);
            } else {
                \Log::info('No services found in request - DETAILED DEBUG');
            }
            
            if (isset($validated['service_comments'])) {
                try {
                    // If it's a string, try to decode it
                    if (is_string($validated['service_comments'])) {
                        $serviceComments = json_decode($validated['service_comments'], true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            \Log::error('Failed to parse service_comments JSON - DETAILED DEBUG', [
                                'service_comments' => $validated['service_comments'],
                                'json_error' => json_last_error_msg()
                            ]);
                            $serviceComments = null;
                        } else {
                            \Log::info('Successfully parsed service_comments from JSON string - DETAILED DEBUG', [
                                'service_comments' => $serviceComments
                            ]);
                        }
                    } else if (is_array($validated['service_comments'])) {
                        $serviceComments = $validated['service_comments'];
                        \Log::info('Service comments found as array - DETAILED DEBUG', [
                            'service_comments' => $serviceComments
                        ]);
                    } else {
                        \Log::warning('Service comments found but in unsupported format - DETAILED DEBUG', [
                            'type' => gettype($validated['service_comments'])
                        ]);
                    }
                    
                    \Log::info('Processed service_comments - DETAILED DEBUG', [
                        'service_comments' => $serviceComments
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Error processing service_comments - DETAILED DEBUG', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    $serviceComments = null;
                }
                
                unset($validated['service_comments']);
            } else {
                \Log::info('No service_comments found in request - DETAILED DEBUG');
            }
            
            // Apply the address update if needed
            if (isset($validated['address']) && (!isset($validated['lat']) || !isset($validated['lng']))) {
                try {
                    $coordinates = $this->mapService->geocodeAddress($validated['address']);
                    if ($coordinates) {
                        $validated['lat'] = $coordinates['lat'];
                        $validated['lng'] = $coordinates['lng'];
                    }
                } catch (\Exception $e) {
                    \Log::error('Error geocoding address', [
                        'address' => $validated['address'],
                        'error' => $e->getMessage()
                    ]);
                    // Continue with the update even if geocoding fails
                }
            }
            
            // Update the service point with validated data
            \Log::info('Updating service point base data - DETAILED DEBUG', [
                'validated_data' => $validated
            ]);
            $servicePoint->update($validated);
            
            // Update services and their comments
            if ($services !== null || $serviceComments !== null) {
                \Log::info('Starting services update - DETAILED DEBUG', [
                    'has_services' => $services !== null,
                    'has_service_comments' => $serviceComments !== null
                ]);
                
                // If we have service_comments, use those to handle services and comments together
                if ($serviceComments !== null) {
                    // First, detach all existing services
                    \Log::info('Detaching all existing services - DETAILED DEBUG');
                    $servicePoint->services()->detach();
                    
                    // Счетчики для логирования
                    $attachedServices = 0;
                    $errorServices = [];
                    
                    // Then, attach services with comments
                    foreach ($serviceComments as $serviceComment) {
                        if (isset($serviceComment['service_id'])) {
                            $serviceId = $serviceComment['service_id'];
                            $comment = $serviceComment['comment'] ?? null;
                            
                            \Log::info('Attaching service with comment - DETAILED DEBUG', [
                                'service_id' => $serviceId,
                                'comment' => $comment
                            ]);
                            
                            // Проверить существование услуги
                            $service = \App\Models\Service::find($serviceId);
                            if (!$service) {
                                \Log::warning('Service not found for attachment - DETAILED DEBUG', [
                                    'service_id' => $serviceId
                                ]);
                                $errorServices[] = $serviceId;
                                continue;
                            }
                            
                            try {
                                $servicePoint->services()->attach($serviceId, ['comment' => $comment]);
                                $attachedServices++;
                                
                                \Log::info('Successfully attached service - DETAILED DEBUG', [
                                    'service_id' => $serviceId,
                                    'comment' => $comment
                                ]);
                            } catch (\Exception $e) {
                                \Log::error('Failed to attach service - DETAILED DEBUG', [
                                    'service_id' => $serviceId,
                                    'comment' => $comment,
                                    'error' => $e->getMessage(),
                                    'trace' => $e->getTraceAsString()
                                ]);
                                $errorServices[] = $serviceId;
                            }
                        } else {
                            \Log::warning('Invalid service comment entry with no service_id - DETAILED DEBUG', [
                                'entry' => $serviceComment
                            ]);
                        }
                    }
                    
                    // Итоговый результат прикрепления услуг
                    \Log::info('Finished attaching services - DETAILED DEBUG', [
                        'service_point_id' => $servicePoint->id, 
                        'attached_count' => $attachedServices,
                        'errors_count' => count($errorServices),
                        'error_services' => $errorServices
                    ]);
                    
                    // Проверка после закрепления услуг
                    $pivotCheck = DB::table('service_point_services')
                        ->where('service_point_id', $servicePoint->id)
                        ->get();
                    
                    \Log::info('Pivot table check after service attachment - DETAILED DEBUG', [
                        'service_point_id' => $servicePoint->id,
                        'pivot_count' => $pivotCheck->count(),
                        'pivot_services' => $pivotCheck->pluck('service_id')->toArray()
                    ]);
                }
                // If we only have services array but no service_comments, use that
                else if ($services !== null) {
                    \Log::info('Syncing services without comments - DETAILED DEBUG', [
                        'services' => $services
                    ]);
                    
                    try {
                        $servicePoint->services()->sync($services);
                        \Log::info('Successfully synced services - DETAILED DEBUG');
                    } catch (\Exception $e) {
                        \Log::error('Failed to sync services - DETAILED DEBUG', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }
            } else {
                \Log::info('No services or service_comments to update - DETAILED DEBUG');
            }
            
            // Handle price list upload
            if ($request->hasFile('price_list') && $request->file('price_list')->isValid()) {
                // Delete old price list if it exists
                if (!empty($servicePoint->price_list_path)) {
                    \Storage::disk('public')->delete($servicePoint->price_list_path);
                }
                
                $file = $request->file('price_list');
                $extension = $file->getClientOriginalExtension();
                
                // Check if the file is Excel or PDF
                if (!in_array(strtolower($extension), ['xlsx', 'xls', 'pdf'])) {
                    return response()->json(['error' => 'Файл прайс-листа должен быть в формате Excel или PDF.'], 422);
                }
                
                $fileName = 'price_list_' . $servicePoint->id . '_' . time() . '.' . $extension;
                $file->storeAs('price_lists', $fileName, 'public');
                
                $servicePoint->price_list_path = 'price_lists/' . $fileName;
                $servicePoint->save();
            }
            
            // Handle photo uploads
            if ($request->hasFile('photos')) {
                $photos = $request->file('photos');
                
                // Count existing photos
                $existingPhotoCount = $servicePoint->photos()->count();
                
                // Check if total photos count doesn't exceed 10
                if ($existingPhotoCount + count($photos) > 10) {
                    return response()->json(['error' => 'Максимальное количество фотографий: 10. У вас уже есть ' . $existingPhotoCount . ' фото.'], 422);
                }
                
                $order = $existingPhotoCount;
                foreach ($photos as $photo) {
                    if ($photo->isValid()) {
                        $fileName = 'service_point_' . $servicePoint->id . '_' . time() . '_' . $order . '.' . $photo->getClientOriginalExtension();
                        $photo->storeAs('service_point_photos', $fileName, 'public');
                        
                        $servicePoint->photos()->create([
                            'path' => 'service_point_photos/' . $fileName,
                            'sort_order' => $order
                        ]);
                        
                        $order++;
                    }
                }
            }
            
            // Delete photos if requested
            if ($request->has('photos_to_delete') && is_array($request->photos_to_delete)) {
                $photosToDelete = $request->photos_to_delete;
                $photos = $servicePoint->photos()->whereIn('id', $photosToDelete)->get();
                
                foreach ($photos as $photo) {
                    // Delete the file
                    \Storage::disk('public')->delete($photo->path);
                    
                    // Delete the record
                    $photo->delete();
                }
            }
            
            // Load fresh instance with services and their comments
            $servicePoint = $servicePoint->fresh(['services']);
            
            // Prepare service_comments based on pivot data
            $serviceComments = [];
            foreach ($servicePoint->services as $service) {
                $serviceComments[] = [
                    'service_id' => $service->id,
                    'comment' => $service->pivot->comment
                ];
            }
            
            // Add service_comments to the response
            $servicePoint->service_comments = $serviceComments;
            
            \Log::info('Returning updated service point with service_comments', [
                'service_point_id' => $servicePoint->id,
                'service_comments' => $serviceComments
            ]);
            
            // Сбросить любые кэши и проверить, что отношения загружены правильно
            DB::flushQueryLog();
            $servicePoint->refresh();
            
            // Проверить, что услуги корректно подключены
            \Log::info('Final service point services check after update', [
                'id' => $servicePoint->id, 
                'services_count' => $servicePoint->services()->count(),
                'services' => $servicePoint->services()->pluck('id')->toArray()
            ]);
            
            // Выполнить проверку pivot-таблицы
            $pivotCheck = DB::table('service_point_services')
                ->where('service_point_id', $servicePoint->id)
                ->get();
            
            \Log::info('Final pivot table check after update', [
                'service_point_id' => $servicePoint->id,
                'pivot_count' => $pivotCheck->count(),
                'pivot_services' => $pivotCheck->pluck('service_id')->toArray()
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Service point updated successfully',
                'data' => $servicePoint
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating service point', [
                'id' => $servicePoint->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while updating the service point',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(ServicePoint $servicePoint)
    {
        // Force delete to permanently remove the record instead of soft delete
        $servicePoint->forceDelete();

        return response()->noContent();
    }

    public function generateSchedule(ServicePoint $servicePoint, CreateScheduleRequest $request)
    {
        try {
        $workingHours = $servicePoint->working_hours;
            if (is_string($workingHours)) {
                $workingHours = json_decode($workingHours, true);
            }
            
        $date = Carbon::parse($request->date);
        $dayOfWeek = strtolower($date->format('l'));
            
            \Log::info('Generating schedule', [
                'day' => $dayOfWeek,
                'working_hours' => $workingHours,
                'service_point_id' => $servicePoint->id
            ]);
        
        if (!isset($workingHours[$dayOfWeek]) || $workingHours[$dayOfWeek] === 'closed') {
            return response()->json([
                'status' => 'error',
                'message' => 'Service point is closed on this day'
            ], 422);
        }

            // Handle both old and new format
            if (is_array($workingHours[$dayOfWeek]) && isset($workingHours[$dayOfWeek]['open']) && isset($workingHours[$dayOfWeek]['close'])) {
                $startTime = Carbon::parse($workingHours[$dayOfWeek]['open']);
                $endTime = Carbon::parse($workingHours[$dayOfWeek]['close']);
            } else {
                // Old format with "XX:XX-YY:YY" string
        list($start, $end) = explode('-', $workingHours[$dayOfWeek]);
        $startTime = Carbon::parse($start);
        $endTime = Carbon::parse($end);
            }
            
        $slotDuration = $request->slot_duration;

        $schedules = [];
        $currentTime = clone $startTime;

        while ($currentTime->copy()->addMinutes($slotDuration)->lte($endTime)) {
            $scheduleEndTime = $currentTime->copy()->addMinutes($slotDuration);
            
            $schedules[] = Schedule::create([
                'service_point_id' => $servicePoint->id,
                'post_number' => $request->post_number,
                'date' => $date->toDateString(),
                'start_time' => $currentTime->format('H:i'),
                'end_time' => $scheduleEndTime->format('H:i'),
                'status' => 'available'
            ]);

            $currentTime->addMinutes($slotDuration);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Schedule generated successfully',
            'data' => $schedules
        ]);
        } catch (\Exception $e) {
            \Log::error('Error generating schedule', [
                'service_point_id' => $servicePoint->id,
                'date' => $request->date,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAvailableSlots(ServicePoint $servicePoint, Request $request)
    {
        $date = $request->date ?? now()->toDateString();
        
        $slots = $servicePoint->schedules()
            ->where('date', $date)
            ->where('status', 'available')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $slots
        ]);
    }

    public function getByPartnerId($partnerId)
    {
        try {
            \Log::info('Fetching service points for partner', ['partner_id' => $partnerId]);
            
            // Validate partnerId
            if (!is_numeric($partnerId)) {
                \Log::warning('Invalid partner ID provided', ['partner_id' => $partnerId]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid partner ID format'
                ], 400);
            }
            
            // Attempt to get service points
            try {
                $query = ServicePoint::where('partner_id', $partnerId);
                if (!($request->has('include_inactive') && $request->boolean('include_inactive'))) {
                    $query->active();
                }
                $servicePoints = $query->get();
                \Log::info('Service points retrieved for partner', [
                    'partner_id' => $partnerId,
                    'count' => $servicePoints->count()
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to retrieve service points for partner', [
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
            
            // Transform working_hours to JSON objects from strings
            $transformedPoints = [];
            foreach ($servicePoints as $point) {
                try {
                    $transformed = $point->toArray();
                    
                    if (isset($transformed['working_hours']) && is_string($transformed['working_hours'])) {
                        $transformed['working_hours'] = json_decode($transformed['working_hours'], true);
                        
                        // If JSON decoding failed
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            \Log::warning('Failed to decode working_hours JSON', [
                                'id' => $point->id,
                                'error' => json_last_error_msg(),
                                'working_hours' => $transformed['working_hours']
                            ]);
                            
                            // Keep the original string
                            $transformed['working_hours'] = $point->working_hours;
                        }
                    }
                    
                    $transformedPoints[] = $transformed;
                } catch (\Exception $e) {
                    \Log::error('Error processing service point', [
                        'id' => $point->id ?? 'unknown',
                        'partner_id' => $partnerId,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    
                    // Still include the point but without transformation
                    $transformedPoints[] = $point->toArray();
                }
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $transformedPoints
            ]);
        } catch (\Exception $e) {
            \Log::error('Unexpected error fetching service points for partner', [
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
    }
}