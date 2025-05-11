<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of the services.
     */
    public function index()
    {
        $services = Service::all();
        
        return response()->json([
            'status' => 'success',
            'data' => $services
        ]);
    }

    /**
     * Store a newly created service.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean'
        ]);
        
        $service = Service::create($validated);
        
        return response()->json([
            'status' => 'success',
            'data' => $service
        ], 201);
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        return response()->json([
            'status' => 'success',
            'data' => $service
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean'
        ]);
        
        $service->update($validated);
        
        return response()->json([
            'status' => 'success',
            'data' => $service
        ]);
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Service $service)
    {
        $service->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Service deleted successfully'
        ]);
    }

    /**
     * Get services for a specific service point
     */
    public function getServicesByServicePoint($servicePointId)
    {
        $services = Service::whereHas('servicePoints', function($query) use ($servicePointId) {
            $query->where('service_point_id', $servicePointId);
        })->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $services
        ]);
    }
} 