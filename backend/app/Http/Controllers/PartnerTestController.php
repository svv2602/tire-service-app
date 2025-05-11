<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PartnerTestController extends Controller
{
    public function index()
    {
        try {
            $partners = DB::table('partners')
                ->join('users', 'partners.user_id', '=', 'users.id')
                ->select('partners.*', 'users.name', 'users.email')
                ->get();
            
            // Transform data to match the format expected by frontend
            $partners = $partners->map(function ($partner) {
                // Add any derived fields needed for frontend compatibility
                $partner->status = $partner->status ?? 'active'; // Default status
                return $partner;
            });
            
            return response()->json([
                'status' => 'success',
                'count' => count($partners),
                'partners' => $partners
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка получения списка партнеров: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $partner = DB::table('partners')
                ->join('users', 'partners.user_id', '=', 'users.id')
                ->select('partners.*', 'users.name', 'users.email')
                ->where('partners.id', $id)
                ->first();
            
            if (!$partner) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Партнер не найден'
                ], 404);
            }
            
            // Add derived fields for frontend compatibility
            $partner->status = $partner->status ?? 'active'; // Default status
            
            // Get service points for this partner
            $servicePoints = DB::table('service_points')
                ->where('partner_id', $id)
                ->get();
            
            return response()->json([
                'status' => 'success',
                'partner' => $partner,
                'service_points' => $servicePoints
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка получения данных партнера: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Log incoming request data for debugging
            \Illuminate\Support\Facades\Log::info('Partner create request', [
                'data' => $request->all()
            ]);
            
            $validated = $request->validate([
                'email' => 'required|email',
                'company_name' => 'required|string|max:255',
                'contact_person' => 'nullable|string|max:255',
                'phone' => 'required|string|max:20',
                'status' => 'required|in:active,inactive',
                'address' => 'nullable|string|max:255',
            ]);
            
            // If contact_person is not provided, use company_name
            if (empty($validated['contact_person'])) {
                $validated['contact_person'] = $validated['company_name'];
            }
            
            // Check if email already exists
            $existingUser = DB::table('users')->where('email', $validated['email'])->first();
            if ($existingUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Пользователь с таким email уже существует'
                ], 422);
            }
            
            // Create user
            $temporaryPassword = Str::random(8);
            $userId = DB::table('users')->insertGetId([
                'name' => $validated['contact_person'],
                'email' => $validated['email'],
                'password' => Hash::make($temporaryPassword),
                'role' => 'partner',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Create partner
            $partnerId = DB::table('partners')->insertGetId([
                'user_id' => $userId,
                'company_name' => $validated['company_name'],
                'contact_person' => $validated['contact_person'],
                'phone' => $validated['phone'],
                'address' => $validated['address'] ?? 'Адрес не указан',
                'status' => $validated['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Get the created partner with user details for the response
            $partner = DB::table('partners')
                ->join('users', 'partners.user_id', '=', 'users.id')
                ->select('partners.*', 'users.name', 'users.email')
                ->where('partners.id', $partnerId)
                ->first();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Партнер успешно создан',
                'partner' => $partner
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Partner creation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при создании партнера: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Log incoming request data for debugging
            \Illuminate\Support\Facades\Log::info('Partner update request', [
                'id' => $id,
                'data' => $request->all()
            ]);
            
            $partner = DB::table('partners')->where('id', $id)->first();
            
            if (!$partner) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Партнер не найден'
                ], 404);
            }
            
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'company_name' => 'sometimes|string|max:255',
                'contact_person' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'email' => 'sometimes|email',
                'address' => 'sometimes|string|max:255',
                'status' => 'sometimes|in:active,inactive',
            ]);
            
            $updateData = array_merge($validated, ['updated_at' => now()]);
            
            // Company name can come from either company_name or name fields
            $companyName = $updateData['company_name'] ?? $updateData['name'] ?? null;
            $contactPerson = $updateData['contact_person'] ?? $updateData['name'] ?? null;
            
            // Update partner record
            DB::table('partners')
                ->where('id', $id)
                ->update(array_filter([
                    'company_name' => $companyName,
                    'contact_person' => $contactPerson,
                    'phone' => $updateData['phone'] ?? null,
                    'address' => $updateData['address'] ?? null,
                    'status' => $updateData['status'] ?? null,
                    'updated_at' => now(),
                ]));
            
            // Update related user record
            $userUpdateData = array_filter([
                'name' => $contactPerson,
                'email' => $updateData['email'] ?? null,
                'updated_at' => now(),
            ]);
            
            if (!empty($userUpdateData)) {
                DB::table('users')
                    ->where('id', $partner->user_id)
                    ->update($userUpdateData);
            }
            
            // Get updated partner with user details
            $updatedPartner = DB::table('partners')
                ->join('users', 'partners.user_id', '=', 'users.id')
                ->select('partners.*', 'users.name', 'users.email')
                ->where('partners.id', $id)
                ->first();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Партнер успешно обновлен',
                'partner' => $updatedPartner
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Partner update error', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при обновлении партнера: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $partner = DB::table('partners')->where('id', $id)->first();
            
            if (!$partner) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Партнер не найден'
                ], 404);
            }
            
            // Get service points for this partner
            $servicePoints = DB::table('service_points')->where('partner_id', $id)->get();
            
            // Check if there are any active bookings for any of this partner's service points
            if ($servicePoints->isNotEmpty()) {
                $servicePointIds = $servicePoints->pluck('id')->toArray();
                
                $bookingsExist = DB::table('bookings')
                    ->join('schedules', 'bookings.schedule_id', '=', 'schedules.id')
                    ->join('service_points', 'schedules.service_point_id', '=', 'service_points.id')
                    ->whereIn('service_points.id', $servicePointIds)
                    ->exists();
                
                if ($bookingsExist) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Невозможно удалить партнера, так как есть активные бронирования для его сервисных точек'
                    ], 400);
                }
                
                // Delete service points
                DB::table('service_points')->whereIn('id', $servicePointIds)->delete();
            }
            
            // Delete user
            DB::table('users')->where('id', $partner->user_id)->delete();
            
            // Delete partner
            DB::table('partners')->where('id', $id)->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Партнер успешно удален'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при удалении партнера: ' . $e->getMessage()
            ], 500);
        }
    }
} 