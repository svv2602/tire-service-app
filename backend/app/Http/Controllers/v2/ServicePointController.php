<?php

namespace App\Http\Controllers\v2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ServicePoint;
use App\Models\Service;
use App\Services\MapService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class ServicePointController extends Controller
{
    public function __construct(private MapService $mapService) {}

    public function index(Request $request)
    {
        try {
            $query = ServicePoint::with('services');
            
            // Filter by status if provided
            if ($request->has('status')) {
                $status = $request->input('status');
                if ($status === 'working') {
                    $query->working();
                } elseif ($status === 'suspended') {
                    $query->suspended();
                } elseif ($status === 'closed') {
                    $query->closed();
                }
            }
            
            $servicePoints = $query->get();
            
            Log::info('ServicePointController@index: points fetched', [
                'total' => $servicePoints->count(),
                'filters' => $request->all(),
            ]);
            
            // Add service_comments
            foreach ($servicePoints as $point) {
                $serviceComments = [];
                foreach ($point->services as $service) {
                    $serviceComments[] = [
                        'service_id' => $service->id,
                        'comment' => $service->pivot->comment
                    ];
                }
                $point->service_comments = $serviceComments;
            }
            return response()->json([
                'status' => 'success',
                'data' => $servicePoints
            ]);
        } catch (\Exception $e) {
            Log::error('v2 - Failed to retrieve service points', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve service points',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function show($id)
    {
        try {
            Log::info('v2 - Fetching service point', ['id' => $id]);
            
            // Use withInactive scope to include inactive service points
            $servicePoint = ServicePoint::find($id);
            
            if (!$servicePoint) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Service point not found'
                ], 404);
            }
            
            // Process service comments
            $serviceComments = [];
            foreach ($servicePoint->services as $service) {
                $serviceComments[] = [
                    'service_id' => $service->id,
                    'comment' => $service->pivot->comment
                ];
            }
            
            // Add service_comments to the point data
            $pointData = $servicePoint->toArray();
            $pointData['service_comments'] = $serviceComments;
            
            // Add formatted price lists with full URLs
            if ($servicePoint->price_list_path) {
                $priceLists = json_decode($servicePoint->price_list_path, true) ?? [];
                $pointData['price_lists'] = array_map(function($path) {
                    $fileUrl = Storage::disk('public')->url($path);
                    return [
                        'path' => $path,
                        'url' => $this->getPublicUrl($path),
                        'name' => basename($path),
                        'original_name' => basename($path)
                    ];
                }, $priceLists);
            } else {
                $pointData['price_lists'] = [];
            }
            
            // Add photos with URLs
            $pointData['images'] = $servicePoint->photos()->get(['id', 'path'])->map(function($photo) {
                $fileUrl = Storage::disk('public')->url($photo->path);
                return [
                    'id' => $photo->id,
                    'path' => $photo->path,
                    'url' => $this->getPublicUrl($photo->path)
                ];
            });
            
            Log::info('v2 - Successfully retrieved service point', ['id' => $id]);
            return response()->json([
                'status' => 'success',
                'data' => $pointData
            ]);
        } catch (\Exception $e) {
            Log::error('v2 - Failed to retrieve service point', [
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
    }
    
    /**
     * Обновление сервисной точки
     */
    public function update(Request $request, $id)
    {
        try {
            // Log the incoming update request
            Log::info('Service point update request', [
                'id' => $id,
                'has_status' => $request->has('status'),
                'status_value' => $request->input('status'),
                'all_fields' => array_keys($request->all())
            ]);
            
            // Start transaction
            DB::beginTransaction();
            
            // Find the service point
            $servicePoint = ServicePoint::find($id);
            
            if (!$servicePoint) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Service point not found'
                ], 404);
            }
            
            // Validate request data
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'region' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'address' => 'sometimes|string|max:255',
                'lat' => 'sometimes|numeric',
                'lng' => 'sometimes|numeric',
                'partner_id' => 'sometimes|nullable|exists:partners,id',
                'working_hours' => 'sometimes',
                'description' => 'nullable|string',
                'contact_info' => 'nullable|string',
                'notes' => 'nullable|string',
                'price_list_path' => 'nullable|string',
                'num_posts' => 'nullable|integer|min:1',
                'service_time_grid' => 'nullable',
                'service_posts' => 'nullable',
                'services' => 'nullable|array',
                'status' => 'nullable|string|in:working,suspended,closed',
            ]);
            
            // Important: Explicitly set the status if it's in the request
            if (isset($validated['status'])) {
                $servicePoint->status = $validated['status'];
                
                // Log status change
                Log::info('Status updated for service point via regular update', [
                    'id' => $id,
                    'old_status' => $servicePoint->getOriginal('status'),
                    'new_status' => $validated['status']
                ]);
            }
            
            // Handle price_list_path separately if it's a JSON string
            if (isset($validated['price_list_path'])) {
                Log::info('Handling price_list_path in update', [
                    'id' => $id, 
                    'value' => $validated['price_list_path']
                ]);
                
                try {
                    // Try decoding to validate it's proper JSON
                    $decodedPaths = json_decode($validated['price_list_path'], true);
                    
                    // If it's valid JSON and an array, keep it
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decodedPaths)) {
                        $servicePoint->price_list_path = $validated['price_list_path'];
                        $servicePoint->save();
                        Log::info('Price list paths updated from JSON string', [
                            'id' => $id,
                            'paths_count' => count($decodedPaths),
                            'paths' => $decodedPaths
                        ]);
                    } else {
                        Log::warning('Invalid price_list_path JSON', [
                            'id' => $id,
                            'value' => $validated['price_list_path'],
                            'json_error' => json_last_error_msg()
                        ]);
                    }
                    
                    // Remove from validated data to prevent overwriting in update()
                    unset($validated['price_list_path']);
                } catch (\Exception $e) {
                    Log::error('Error processing price_list_path', [
                        'id' => $id,
                        'error' => $e->getMessage()
                    ]);
                    unset($validated['price_list_path']);
                }
            }
            
            // Update other fields
            $servicePoint->update($validated);

            // Обработка services и service_comments
            if ($request->has('service_comments')) {
                Log::info('Обновление service_comments', [
                    'id' => $id,
                    'service_comments' => $request->input('service_comments')
                ]);

                // Отсоединяем все существующие сервисы
                $servicePoint->services()->detach();
                
                $serviceComments = is_string($request->input('service_comments')) 
                    ? json_decode($request->input('service_comments'), true)
                    : $request->input('service_comments');

                if (is_array($serviceComments)) {
                    foreach ($serviceComments as $comment) {
                        if (isset($comment['service_id'])) {
                            $servicePoint->services()->attach($comment['service_id'], [
                                'comment' => $comment['comment'] ?? null
                            ]);
                        }
                    }
                }
            }

            // Обработка прайс-листов
            if ($request->hasFile('price_lists')) {
                $priceListPaths = [];
                $files = $request->file('price_lists');
                
                if (count($files) > 3) {
                    DB::rollBack();
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Можно загрузить не более 3 прайс-листов.'
                    ], 400);
                }

                // Удаляем старые файлы
                if ($servicePoint->price_list_path) {
                    $oldPaths = json_decode($servicePoint->price_list_path, true) ?? [];
                    foreach ($oldPaths as $oldPath) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

                foreach ($files as $file) {
                    $extension = strtolower($file->getClientOriginalExtension());
                    if (!in_array($extension, ['xlsx', 'xls', 'pdf'])) {
                        DB::rollBack();
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Прайс-лист должен быть в формате Excel или PDF.'
                        ], 422);
                    }
                    $path = $file->store('price-lists', 'public');
                    $priceListPaths[] = $path;
                }
                
                $servicePoint->price_list_path = json_encode($priceListPaths);
                $servicePoint->save();
            }

            // Commit the transaction
            DB::commit();
            
            // Make sure we return a fresh version of the service point with updated data
            $freshServicePoint = ServicePoint::with('services')->find($id);
            
            // Prepare response data
            $responseData = $freshServicePoint->toArray();
            
            // Add service comments
            $serviceComments = [];
            foreach ($freshServicePoint->services as $service) {
                $serviceComments[] = [
                    'service_id' => $service->id,
                    'comment' => $service->pivot->comment
                ];
            }
            $responseData['service_comments'] = $serviceComments;
            
            // Add formatted price lists
            if ($freshServicePoint->price_list_path) {
                $priceLists = json_decode($freshServicePoint->price_list_path, true) ?? [];
                $responseData['price_lists'] = array_map(function($path) {
                    return [
                        'path' => $path,
                        'url' => $this->getPublicUrl($path),
                        'name' => basename($path),
                        'original_name' => basename($path)
                    ];
                }, $priceLists);
            } else {
                $responseData['price_lists'] = [];
            }
            
            // Add photos with URLs
            $responseData['images'] = $freshServicePoint->photos()->get(['id', 'path'])->map(function($photo) {
                return [
                    'id' => $photo->id,
                    'path' => $photo->path,
                    'url' => $this->getPublicUrl($photo->path)
                ];
            });
            
            return response()->json([
                'status' => 'success',
                'message' => 'Service point updated successfully',
                'data' => $responseData
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update service point', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update service point: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function destroy($id)
    {
        try {
            $servicePoint = ServicePoint::find($id);
            
            if (!$servicePoint) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Service point not found'
                ], 404);
            }
            
            // Use soft delete
            $servicePoint->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Service point deleted',
                'data' => $servicePoint
            ]);
        } catch (\Exception $e) {
            Log::error('v2 - Failed to delete service point', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete service point',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function store(Request $request)
    {
        Log::info('v2 - Create service point request', [
            'data' => $request->all(),
            'all_files' => $request->allFiles(),
            'images' => $request->file('images'),
            'price_lists' => $request->file('price_lists'),
            'hasFile_images' => $request->hasFile('images'),
            'hasFile_price_lists' => $request->hasFile('price_lists'),
            'content_type' => $request->header('Content-Type'),
        ]);

        try {
            DB::beginTransaction();
            
            // Validate request data
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'region' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'address' => 'required|string|max:255',
                'lat' => 'required|numeric',
                'lng' => 'required|numeric',
                'partner_id' => 'nullable|exists:partners,id',
                'working_hours' => 'required',
                'description' => 'nullable|string',
                'contact_info' => 'nullable|string',
                'notes' => 'nullable|string',
                'price_list_path' => 'nullable|string',
                'num_posts' => 'nullable|integer|min:1',
                'service_time_grid' => 'nullable',
                'service_posts' => 'nullable',
                'services' => 'nullable|array',
                'status' => 'nullable|string|in:working,suspended,closed',
            ]);
            
            // Set default values if missing
            if (!isset($validated['status'])) {
                $validated['status'] = 'working';
            }
            
            // Get coordinates from address
            $coordinates = $this->mapService->geocodeAddress($validated['address']);
            if (!$coordinates) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to geocode address'
                ], 422);
            }
            
            $validated['lat'] = $coordinates['lat'];
            $validated['lng'] = $coordinates['lng'];
            
            // Extract service comments from request
            $serviceComments = [];
            
            // Try to get service_comments from the request in different formats
            if ($request->has('service_comments')) {
                $rawComments = $request->input('service_comments');
                
                // If it's a string (JSON), decode it
                if (is_string($rawComments)) {
                    try {
                        $decoded = json_decode($rawComments, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            $serviceComments = $decoded;
                        }
                    } catch (\Exception $e) {
                        Log::error('v2 - Failed to decode service_comments string', [
                            'error' => $e->getMessage()
                        ]);
                    }
                } 
                // If it's already an array, use it
                else if (is_array($rawComments)) {
                    $serviceComments = $rawComments;
                }
            } 
            // Try to get services array as fallback
            else if ($request->has('services')) {
                $services = $request->input('services');
                
                // If it's a string (JSON), decode it
                if (is_string($services)) {
                    try {
                        $services = json_decode($services, true);
                    } catch (\Exception $e) {
                        Log::error('v2 - Failed to decode services string', [
                            'error' => $e->getMessage()
                        ]);
                        $services = [];
                    }
                }
                
                // Convert services to service_comments format
                if (is_array($services)) {
                    foreach ($services as $serviceId) {
                        $serviceComments[] = [
                            'service_id' => $serviceId,
                            'comment' => null
                        ];
                    }
                }
            }
            // If not found in request parameters, check JSON body
            else {
                // Parse request body as JSON
                $requestBody = json_decode($request->getContent(), true) ?: [];
                
                // Check for service_comments in JSON body
                if (isset($requestBody['service_comments'])) {
                    $rawComments = $requestBody['service_comments'];
                    
                    // If it's a string (nested JSON), decode it
                    if (is_string($rawComments)) {
                        try {
                            $decoded = json_decode($rawComments, true);
                            if (json_last_error() === JSON_ERROR_NONE) {
                                $serviceComments = $decoded;
                            }
                        } catch (\Exception $e) {
                            Log::error('v2 - Failed to decode service_comments string from JSON body', [
                                'error' => $e->getMessage()
                            ]);
                        }
                    } 
                    // If it's already an array, use it
                    else if (is_array($rawComments)) {
                        $serviceComments = $rawComments;
                    }
                }
                // Check for services array in JSON body as fallback
                else if (isset($requestBody['services'])) {
                    $services = $requestBody['services'];
                    
                    // If it's a string (nested JSON), decode it
                    if (is_string($services)) {
                        try {
                            $services = json_decode($services, true);
                        } catch (\Exception $e) {
                            Log::error('v2 - Failed to decode services string from JSON body', [
                                'error' => $e->getMessage()
                            ]);
                            $services = [];
                        }
                    }
                    
                    // Convert services to service_comments format
                    if (is_array($services)) {
                        foreach ($services as $serviceId) {
                            $serviceComments[] = [
                                'service_id' => $serviceId,
                                'comment' => null
                            ];
                        }
                    }
                }
            }
            
            // Log the final processed service_comments
            Log::info('v2 - Final processed service_comments for update', [
                'serviceComments' => $serviceComments,
                'count' => count($serviceComments)
            ]);
            
            // Create the service point
            $servicePoint = ServicePoint::create($validated);

            // --- Сохраняем изображения ---
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('service-point-photos', 'public');
                    $servicePoint->photos()->create([
                        'path' => $path,
                        'sort_order' => 0
                    ]);
                }
            }

            // --- Сохраняем прайс-листы ---
            if ($request->hasFile('price_lists')) {
                $priceListPaths = [];
                $files = $request->file('price_lists');
                if (count($files) > 3) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Можно загрузить не более 3 прайс-листов на одну точку.'
                    ], 400);
                }
                foreach ($files as $file) {
                    $path = $file->store('price-lists', 'public');
                    $priceListPaths[] = $path;
                }
                $servicePoint->price_list_path = json_encode($priceListPaths);
                $servicePoint->save();
            }
            
            // --- Возвращаем массив изображений с id и url ---
            $responseData['images'] = $servicePoint->photos()->get(['id', 'path'])->map(function($photo) {
                return [
                    'id' => $photo->id,
                    'path' => $photo->path,
                    'url' => $this->getPublicUrl($photo->path)
                ];
            });
            // --- Возвращаем массив прайс-листов ---
            $responseData['price_lists'] = array_map(function($path) {
                return [
                    'path' => $path,
                    'url' => $this->getPublicUrl($path),
                    'name' => basename($path),
                    'original_name' => basename($path)
                ];
            }, json_decode($servicePoint->price_list_path, true) ?? []);
            
            // Attach services with comments
            if (!empty($serviceComments)) {
                $attachedServices = 0;
                $errorServices = [];
                
                foreach ($serviceComments as $serviceComment) {
                    if (isset($serviceComment['service_id'])) {
                        $serviceId = $serviceComment['service_id'];
                        $comment = $serviceComment['comment'] ?? null;
                        
                        // Verify the service exists
                        $service = Service::find($serviceId);
                        if (!$service) {
                            Log::warning('v2 - Service not found for attachment in new service point', [
                                'service_id' => $serviceId
                            ]);
                            $errorServices[] = $serviceId;
                            continue;
                        }
                        
                        try {
                            // Attach service with comment
                            $servicePoint->services()->attach($serviceId, ['comment' => $comment]);
                            $attachedServices++;
                            
                            Log::info('v2 - Attached service with comment to new service point', [
                                'service_id' => $serviceId,
                                'comment' => $comment
                            ]);
                        } catch (\Exception $e) {
                            Log::error('v2 - Failed to attach service to new service point', [
                                'service_id' => $serviceId,
                                'error' => $e->getMessage()
                            ]);
                            $errorServices[] = $serviceId;
                        }
                    }
                }
                
                // Log the results
                Log::info('v2 - Finished attaching services to new service point', [
                    'service_point_id' => $servicePoint->id,
                    'attached_count' => $attachedServices,
                    'errors_count' => count($errorServices),
                    'error_services' => $errorServices
                ]);
                
                // Check pivot table after attaching services
                $pivotCheck = DB::table('service_point_services')
                    ->where('service_point_id', $servicePoint->id)
                    ->get();
                
                Log::info('v2 - Pivot table check after service attachment for new point', [
                    'service_point_id' => $servicePoint->id,
                    'pivot_count' => $pivotCheck->count(),
                    'pivot_services' => $pivotCheck->pluck('service_id')->toArray()
                ]);
            }
            
            // Commit transaction
            DB::commit();
            
            // Clear model cache first to ensure fresh data
            DB::flushQueryLog();
            $servicePoint->refresh();
            
            // Check services are properly loaded
            Log::info('v2 - Service point services after create', [
                'id' => $servicePoint->id, 
                'services_count' => $servicePoint->services()->count(),
                'services' => $servicePoint->services()->pluck('id')->toArray()
            ]);
            
            // Return the created service point with services relationship
            $createdServicePoint = ServicePoint::with('services')->withoutGlobalScopes()->find($servicePoint->id);
            
            // Process service comments for response
            $responseServiceComments = [];
            foreach ($createdServicePoint->services as $service) {
                $responseServiceComments[] = [
                    'service_id' => $service->id,
                    'comment' => $service->pivot->comment
                ];
            }
            
            // Add service_comments to response
            $responseData = $createdServicePoint->toArray();
            $responseData['service_comments'] = $responseServiceComments;
            // Возвращаем массив изображений с id и url
            $responseData['images'] = $servicePoint->photos()->get(['id', 'path'])->map(function($photo) {
                return [
                    'id' => $photo->id,
                    'path' => $photo->path,
                    'url' => $this->getPublicUrl($photo->path)
                ];
            });
            // Возвращаем массив прайс-листов (пути)
            $responseData['price_lists'] = array_map(function($path) {
                return [
                    'path' => $path,
                    'url' => $this->getPublicUrl($path),
                    'name' => basename($path),
                    'original_name' => basename($path)
                ];
            }, json_decode($servicePoint->price_list_path, true) ?? []);
            
            Log::info('v2 - Successfully created service point', [
                'id' => $servicePoint->id,
                'service_comments_count' => count($responseServiceComments)
            ]);
            
            return response()->json([
                'status' => 'success',
                'data' => $responseData
            ], 201);
            
        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();
            
            Log::error('v2 - Failed to create service point', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create service point',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function filter(Request $request)
    {
        try {
            if ($request->has('include_inactive') && $request->boolean('include_inactive')) {
                $query = ServicePoint::withoutGlobalScopes()->with('services');
            } else {
                $query = ServicePoint::with('services');
            }
            // Apply filters if provided
            if ($request->has('region') && $request->region) {
                $query->where('region', $request->region);
            }
            if ($request->has('city') && $request->city) {
                $query->where('city', $request->city);
            }
            if ($request->has('partner_id') && $request->partner_id) {
                $query->where('partner_id', $request->partner_id);
            }
            $servicePoints = $query->get();
            
            Log::info('ServicePointController@filter: points fetched', [
                'total' => $servicePoints->count(),
                'include_inactive' => $request->get('include_inactive'),
                'filters' => $request->all(),
            ]);
            
            // Transform data
            $transformedPoints = [];
            foreach ($servicePoints as $point) {
                // Process service comments
                $serviceComments = [];
                foreach ($point->services as $service) {
                    $serviceComments[] = [
                        'service_id' => $service->id,
                        'comment' => $service->pivot->comment
                    ];
                }
                
                // Add service_comments to the point data
                $pointData = $point->toArray();
                $pointData['service_comments'] = $serviceComments;
                
                $transformedPoints[] = $pointData;
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $transformedPoints
            ]);
        } catch (\Exception $e) {
            Log::error('v2 - Failed to filter service points', [
                'filters' => $request->all(),
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to filter service points',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getByPartnerId(Request $request, $partnerId)
    {
        try {
            if ($request->has('include_inactive') && $request->boolean('include_inactive')) {
                $query = ServicePoint::withoutGlobalScopes()->with('services')->where('partner_id', $partnerId);
            } else {
                $query = ServicePoint::with('services')->where('partner_id', $partnerId);
            }
            $servicePoints = $query->get();
            
            // Transform data
            $transformedPoints = [];
            foreach ($servicePoints as $point) {
                // Process service comments
                $serviceComments = [];
                foreach ($point->services as $service) {
                    $serviceComments[] = [
                        'service_id' => $service->id,
                        'comment' => $service->pivot->comment
                    ];
                }
                
                // Add service_comments to the point data
                $pointData = $point->toArray();
                $pointData['service_comments'] = $serviceComments;
                
                $transformedPoints[] = $pointData;
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $transformedPoints
            ]);
        } catch (\Exception $e) {
            Log::error('v2 - Failed to get service points by partner ID', [
                'partner_id' => $partnerId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get service points by partner ID',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ВРЕМЕННЫЙ DEBUG-ЭНДПОИНТ: Возвращает все точки без scope, фильтров и ресурсов
     */
    public function allRaw()
    {
        $query = \App\Models\ServicePoint::query();
        $sql = $query->toSql();
        $bindings = $query->getBindings();
        Log::info('DEBUG allRaw ServicePoint SQL', ['sql' => $sql, 'bindings' => $bindings]);
        $points = $query->get();
        Log::info('DEBUG allRaw ServicePoint count', [
            'count' => $points->count(), 
            'ids' => $points->pluck('id')
        ]);
        return response()->json([
            'status' => 'debug',
            'data' => $points
        ]);
    }

    /**
     * Update service point status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            // Find the service point
            $servicePoint = ServicePoint::find($id);
            
            if (!$servicePoint) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Service point not found'
                ], 404);
            }
            
            // Validate only the status field
            $validated = $request->validate([
                'status' => 'required|string|in:working,suspended,closed'
            ]);
            
            // Log status change
            Log::info('Direct status update for service point', [
                'id' => $id,
                'old_status' => $servicePoint->status,
                'new_status' => $validated['status']
            ]);
            
            // Save the updated status
            $servicePoint->status = $validated['status'];
            $servicePoint->save();
            
            // Return the updated service point
            return response()->json([
                'status' => 'success',
                'message' => 'Service point status updated successfully',
                'data' => $servicePoint->fresh()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error updating service point status', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update service point status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload files (images and price lists) for a service point
     */
    public function uploadFiles(Request $request, $id)
    {
        try {
            // Log the incoming files
            Log::info('uploadFiles request for service point', [
                'id' => $id,
                'has_images' => $request->hasFile('images'),
                'image_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
                'has_price_lists' => $request->hasFile('price_lists'),
                'price_list_count' => $request->hasFile('price_lists') ? count($request->file('price_lists')) : 0,
                'content_type' => $request->header('Content-Type'),
                'all_files' => $request->allFiles(),
            ]);
            
            // Start transaction
            DB::beginTransaction();
            
            // Find the service point
            $servicePoint = ServicePoint::find($id);
            
            if (!$servicePoint) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Service point not found'
                ], 404);
            }
            
            $uploadResults = [
                'images' => [],
                'price_lists' => []
            ];
            
            // Upload images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    // Validate image
                    $validator = \Illuminate\Support\Facades\Validator::make(
                        ['image' => $image],
                        ['image' => 'image|mimes:jpeg,png,jpg|max:5120'] // 5MB max
                    );
                    
                    if ($validator->fails()) {
                        Log::warning('Invalid image file', [
                            'file' => $image->getClientOriginalName(),
                            'errors' => $validator->errors()->toArray(),
                            'mime' => $image->getMimeType()
                        ]);
                        continue;
                    }
                    
                    try {
                        $path = $image->store('service-point-photos', 'public');
                        
                        // Check if file was stored successfully
                        if (!$path) {
                            throw new \Exception("Failed to store image file");
                        }
                        
                        // Create photo record
                        $photo = $servicePoint->photos()->create([
                            'path' => $path,
                            'sort_order' => $servicePoint->photos()->count() + 1
                        ]);
                        
                        $imageUrl = Storage::disk('public')->url($path);
                        
                        $uploadResults['images'][] = [
                            'id' => $photo->id,
                            'path' => $path,
                            'url' => URL::to($imageUrl)
                        ];
                        
                        Log::info('Uploaded image for service point', [
                            'service_point_id' => $id,
                            'path' => $path,
                            'public_url' => $imageUrl
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to process image file', [
                            'file' => $image->getClientOriginalName(),
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
            
            // Upload price lists
            if ($request->hasFile('price_lists')) {
                $files = $request->file('price_lists');
                
                // Check maximum count
                if (count($files) > 3) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Maximum 3 price lists allowed'
                    ], 400);
                }
                
                $priceListPaths = [];
                
                // Get existing price lists if any
                if ($servicePoint->price_list_path) {
                    try {
                        $existingPaths = json_decode($servicePoint->price_list_path, true);
                        if (is_array($existingPaths)) {
                            $priceListPaths = $existingPaths;
                        }
                    } catch (\Exception $e) {
                        Log::warning('Failed to decode existing price list paths', [
                            'service_point_id' => $id,
                            'error' => $e->getMessage()
                        ]);
                        // Initialize empty array if existing data is corrupted
                        $priceListPaths = [];
                    }
                }
                
                $newlyUploadedFiles = [];
                
                foreach ($files as $file) {
                    // Validate file
                    $extension = strtolower($file->getClientOriginalExtension());
                    $mimeType = $file->getMimeType();
                    
                    // Log file details for debugging
                    Log::info('Processing price list file', [
                        'filename' => $file->getClientOriginalName(),
                        'extension' => $extension,
                        'mime_type' => $mimeType,
                        'size' => $file->getSize()
                    ]);
                    
                    // Check valid file types
                    $validExtension = in_array($extension, ['pdf', 'xls', 'xlsx']);
                    $validMime = in_array($mimeType, [
                        'application/pdf', 
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/octet-stream'
                    ]);
                    
                    if (!$validExtension || !$validMime) {
                        Log::warning('Invalid price list file type', [
                            'file' => $file->getClientOriginalName(),
                            'extension' => $extension,
                            'mime' => $mimeType,
                            'valid_extension' => $validExtension,
                            'valid_mime' => $validMime
                        ]);
                        continue;
                    }
                    
                    try {
                        $path = $file->store('price-lists', 'public');
                        
                        // Check if file was stored successfully
                        if (!$path) {
                            throw new \Exception("Failed to store price list file");
                        }
                        
                        // Add the path to the array of price list paths
                        $priceListPaths[] = $path;
                        
                        $fileUrl = Storage::disk('public')->url($path);
                        $fileName = $file->getClientOriginalName();
                        
                        $newlyUploadedFiles[] = [
                            'path' => $path,
                            'url' => $this->getPublicUrl($path),
                            'name' => basename($path),
                            'original_name' => $fileName
                        ];
                        
                        Log::info('Uploaded price list for service point', [
                            'service_point_id' => $id,
                            'path' => $path,
                            'public_url' => $fileUrl,
                            'full_url' => URL::to($fileUrl),
                            'file_name' => $fileName
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to process price list file', [
                            'file' => $file->getClientOriginalName(),
                            'error' => $e->getMessage()
                        ]);
                    }
                }
                
                // Limit to maximum 3 files (keep the most recent ones)
                if (count($priceListPaths) > 3) {
                    // Sort paths to identify the oldest ones
                    $priceListPaths = array_slice($priceListPaths, -3);
                    Log::info('Trimmed price list paths to 3 items', [
                        'service_point_id' => $id,
                        'remaining_paths' => $priceListPaths
                    ]);
                }
                
                // Update service point with new price list paths
                $servicePoint->price_list_path = json_encode($priceListPaths);
                $servicePoint->save();
                
                Log::info('Updated service point price_list_path', [
                    'service_point_id' => $id,
                    'price_list_path' => $servicePoint->price_list_path,
                    'paths_count' => count($priceListPaths)
                ]);
                
                // Just for response tracking
                $uploadResults['newly_uploaded_price_lists'] = $newlyUploadedFiles;
            }
            
            // Commit transaction
            DB::commit();
            
            // Get fresh service point data to ensure consistent response
            $servicePoint->refresh();
            
            // Add formatted price lists with full URLs to the response
            // This includes ALL price lists, not just the newly uploaded ones
            if ($servicePoint->price_list_path) {
                $priceLists = json_decode($servicePoint->price_list_path, true) ?? [];
                $uploadResults['price_lists'] = array_map(function($path) {
                    $originalName = basename($path); // Базовое имя файла
                    
                    // Проверяем, существует ли файл в storage
                    if (Storage::disk('public')->exists($path)) {
                        // Для повышения совместимости с существующими файлами
                        return [
                            'path' => $path,
                            'url' => $this->getPublicUrl($path),
                            'name' => basename($path),
                            'original_name' => $originalName
                        ];
                    } else {
                        Log::warning('Price list file not found on disk', [
                            'path' => $path
                        ]);
                        return [
                            'path' => $path,
                            'url' => $this->getPublicUrl($path),
                            'name' => basename($path),
                            'original_name' => basename($path)
                        ];
                    }
                }, $priceLists);
                
                Log::info('Returning all price lists in response', [
                    'count' => count($uploadResults['price_lists']),
                    'price_lists' => $uploadResults['price_lists']
                ]);
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Files uploaded successfully',
                'data' => $uploadResults
            ]);
            
        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();
            
            Log::error('Failed to upload files for service point', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload files: ' . $e->getMessage()
            ], 500);
        }
    }

    // Добавим метод для формирования полного публичного URL к файлу
    private function getPublicUrl($path) {
        if (empty($path)) {
            return null;
        }
        
        // Используем URL::to для полного URL вместо относительного пути
        $fileUrl = Storage::disk('public')->url($path);
        return URL::to($fileUrl);
    }

    /**
     * Скачивание прайс-листа по имени файла
     */
    public function downloadPriceList($filename)
    {
        try {
            // Логируем запрос на скачивание
            Log::info('Download price list request', [
                'filename' => $filename, 
                'request_url' => request()->fullUrl()
            ]);
            
            // Нормализуем имя файла, удаляя путь, если он есть
            $normalizedFilename = basename($filename);
            
            // Проверяем, есть ли файл в директории price-lists
            $path = 'price-lists/' . $normalizedFilename;
            
            Log::info('Looking for file at path', [
                'path' => $path,
                'normalized_filename' => $normalizedFilename,
                'original_filename' => $filename,
                'storage_path' => Storage::disk('public')->path($path)
            ]);
            
            if (!Storage::disk('public')->exists($path)) {
                Log::error('Download price list: file not found', [
                    'path' => $path,
                    'storage_path' => Storage::disk('public')->path($path),
                    'public_path' => public_path($path),
                    'disk_files' => Storage::disk('public')->files('price-lists'),
                    'public_directory' => file_exists(public_path('price-lists')) ? 'exists' : 'not found'
                ]);
                
                // Try alternative path
                $alternativePath = basename($normalizedFilename);
                if (Storage::disk('public')->exists('price-lists/' . $alternativePath)) {
                    $path = 'price-lists/' . $alternativePath;
                    Log::info('Found file at alternative path', ['path' => $path]);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'File not found',
                        'requested_filename' => $filename,
                        'normalized_filename' => $normalizedFilename
                    ], 404);
                }
            }
            
            // Получаем полный путь к файлу
            $fullPath = Storage::disk('public')->path($path);
            
            Log::info('Downloading price list', [
                'path' => $path,
                'fullPath' => $fullPath,
                'file_exists' => file_exists($fullPath),
                'file_size' => file_exists($fullPath) ? filesize($fullPath) : 'N/A'
            ]);
            
            if (!file_exists($fullPath)) {
                Log::error('File exists in storage but not in filesystem', [
                    'path' => $path,
                    'fullPath' => $fullPath
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'File not accessible on filesystem'
                ], 500);
            }
            
            // Определяем MIME тип на основе расширения
            $extension = strtolower(pathinfo($normalizedFilename, PATHINFO_EXTENSION));
            $contentType = 'application/octet-stream';
            
            if ($extension === 'pdf') {
                $contentType = 'application/pdf';
            } elseif ($extension === 'xlsx') {
                $contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            } elseif ($extension === 'xls') {
                $contentType = 'application/vnd.ms-excel';
            }
            
            // Возвращаем файл для скачивания
            return response()->download($fullPath, $normalizedFilename, [
                'Content-Type' => $contentType,
                'Content-Disposition' => 'attachment; filename="' . $normalizedFilename . '"'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error downloading price list', [
                'filename' => $filename,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to download file: ' . $e->getMessage()
            ], 500);
        }
    }
}