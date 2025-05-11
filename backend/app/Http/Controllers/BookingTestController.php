<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BookingTestController extends Controller
{
    public function index()
    {
        try {
            \Log::info('Fetching all bookings');
            
            $bookings = DB::table('bookings')
                ->select('bookings.*')
                ->get()
                ->map(function($booking) {
                    // Add derived fields for frontend compatibility
                    $schedule = DB::table('schedules')->where('id', $booking->schedule_id)->first();
                    
                    // Define derived properties
                    $booking->status = $booking->status ?? 'confirmed';
                    
                    // Get date from schedule
                    $booking->date = $schedule ? $schedule->date : date('Y-m-d');
                    $booking->appointment_date = $booking->date; // Add alternative field name for frontend
                    
                    // Get time from schedule
                    $booking->time = $schedule ? $schedule->start_time : '09:00';
                    $booking->appointment_time = $booking->time; // Add alternative field name for frontend
                    
                    // Format time slot for display
                    $booking->timeSlot = $schedule ? 
                        ($schedule->start_time . ' - ' . $schedule->end_time) : 
                        '09:00 - 10:00';
                    
                    $booking->services = ['Обслуживание шин']; // Default service
                    
                    // Set vehicle type for display
                    $booking->vehicleType = $booking->vehicle_type ?? 'passenger';
                    $booking->vehicleBrand = $booking->vehicle_brand ?? '';
                    
                    return $booking;
                });
            
            \Log::info('Returning all bookings', ['count' => count($bookings)]);
            
            return response()->json([
                'status' => 'success',
                'count' => count($bookings),
                'bookings' => $bookings
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching all bookings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении бронирований',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            \Log::info('Fetching booking details', ['id' => $id]);
            
            $booking = DB::table('bookings')->where('id', $id)->first();
            
            if (!$booking) {
                \Log::error('Booking not found', ['id' => $id]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Бронирование не найдено'
                ], 404);
            }
            
            // Add derived fields for frontend compatibility
            $schedule = DB::table('schedules')->where('id', $booking->schedule_id)->first();
            
            if (!$schedule) {
                \Log::warning('Schedule not found for booking', [
                    'booking_id' => $id, 
                    'schedule_id' => $booking->schedule_id
                ]);
            }
            
            // Define derived properties
            $booking->status = $booking->status ?? 'confirmed';
            
            // Get date from schedule
            $booking->date = $schedule ? $schedule->date : date('Y-m-d');
            $booking->appointment_date = $booking->date; // Add alternative field name for frontend
            
            // Get time from schedule
            $booking->time = $schedule ? $schedule->start_time : '09:00';
            $booking->appointment_time = $booking->time; // Add alternative field name for frontend
            
            // Format time slot for display
            $booking->timeSlot = $schedule ? 
                ($schedule->start_time . ' - ' . $schedule->end_time) : 
                '09:00 - 10:00';
            
            $booking->services = ['Обслуживание шин']; // Default service
            
            // Set vehicle type for display and ensure it's passed through correctly
            $booking->vehicleType = $booking->vehicle_type ?? 'passenger';
            $booking->vehicleBrand = $booking->vehicle_brand ?? '';
            
            \Log::info('Returning booking details', [
                'booking_id' => $id,
                'date' => $booking->date,
                'time' => $booking->time,
                'vehicle_type' => $booking->vehicle_type
            ]);
            
            return response()->json([
                'status' => 'success',
                'booking' => $booking
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching booking details', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении бронирования',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'schedule_id' => 'required|exists:schedules,id',
                'client_id' => 'required|exists:users,id',
                'service_point_id' => 'required|exists:service_points,id',
                'full_name' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'car_number' => 'required|string|max:20',
                'vehicle_brand' => 'nullable|string|max:50',
                'vehicle_type' => 'nullable|string|max:20',
                'notes' => 'nullable|string',
                'status' => 'nullable|string|in:pending,confirmed,completed,cancelled',
                'date' => 'nullable|date',
                'time' => 'nullable|string',
            ]);
            
            // Set default status if not provided
            $status = $validatedData['status'] ?? 'confirmed';
            
            // Process date and time if provided
            if (isset($validatedData['date']) || isset($validatedData['time'])) {
                // Get schedule for updating
                if (isset($validatedData['schedule_id'])) {
                    $scheduleId = $validatedData['schedule_id'];
                    $schedule = DB::table('schedules')->where('id', $scheduleId)->first();
                    
                    if ($schedule) {
                        $scheduleUpdateData = [];
                        
                        // Update date if provided
                        if (isset($validatedData['date'])) {
                            $scheduleUpdateData['date'] = $validatedData['date'];
                        }
                        
                        // Update time if provided (as start_time in schedule)
                        if (isset($validatedData['time'])) {
                            $scheduleUpdateData['start_time'] = $validatedData['time'];
                            
                            // Calculate end_time based on duration (default 60 minutes)
                            $duration = 60; // minutes
                            $startTime = \Carbon\Carbon::parse($validatedData['time']);
                            $endTime = $startTime->copy()->addMinutes($duration);
                            $scheduleUpdateData['end_time'] = $endTime->format('H:i');
                        }
                        
                        // Update schedule with new date/time
                        if (!empty($scheduleUpdateData)) {
                            DB::table('schedules')
                                ->where('id', $scheduleId)
                                ->update($scheduleUpdateData);
                        }
                    }
                }
            }
            
            // Создаем новое бронирование
            $booking = DB::table('bookings')->insert([
                'schedule_id' => $validatedData['schedule_id'],
                'client_id' => $validatedData['client_id'],
                'service_point_id' => $validatedData['service_point_id'],
                'full_name' => $validatedData['full_name'],
                'phone' => $validatedData['phone'],
                'car_number' => $validatedData['car_number'],
                'vehicle_brand' => $validatedData['vehicle_brand'] ?? null,
                'vehicle_type' => $validatedData['vehicle_type'] ?? 'passenger',
                'notes' => $validatedData['notes'] ?? null,
                'status' => $status,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Map booking status to schedule status
            $scheduleStatus = 'booked'; // Default
            if ($status === 'cancelled') {
                $scheduleStatus = 'available';
            } else if ($status === 'completed') {
                $scheduleStatus = 'completed';
            }
            
            // Обновляем статус расписания
            DB::table('schedules')
                ->where('id', $validatedData['schedule_id'])
                ->update([
                    'status' => $scheduleStatus,
                    'updated_at' => now()
                ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Бронирование создано успешно',
                'booking_id' => DB::getPdo()->lastInsertId()
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при создании бронирования',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Log incoming request data
            \Log::info('Booking update request', [
                'id' => $id,
                'request_data' => $request->all()
            ]);
            
            $booking = DB::table('bookings')->where('id', $id)->first();
            
            if (!$booking) {
                \Log::error('Booking not found', ['id' => $id]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Бронирование не найдено'
                ], 404);
            }
            
            // Extract date and time from various possible field names
            $dateFields = ['date', 'appointment_date'];
            $timeFields = ['time', 'appointment_time'];
            
            $date = null;
            $time = null;
            
            // Check for date in any of the date fields
            foreach ($dateFields as $field) {
                if ($request->has($field) && !empty($request->input($field))) {
                    $date = $request->input($field);
                    break;
                }
            }
            
            // Check for time in any of the time fields
            foreach ($timeFields as $field) {
                if ($request->has($field) && !empty($request->input($field))) {
                    $time = $request->input($field);
                    break;
                }
            }
            
            // Normalize request data
            $validationData = $request->all();
            if ($date !== null) {
                $validationData['date'] = $date;
            }
            if ($time !== null) {
                $validationData['time'] = $time;
            }
            
            $validator = Validator::make($validationData, [
                'full_name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'car_number' => 'sometimes|string|max:20',
                'vehicle_brand' => 'sometimes|nullable|string|max:50',
                'vehicle_type' => 'sometimes|nullable|string|max:20',
                'service_point_id' => 'sometimes|exists:service_points,id',
                'status' => 'sometimes|string|in:pending,confirmed,completed,cancelled',
                'date' => 'sometimes|date',
                'time' => 'sometimes|string',
            ]);
            
            if ($validator->fails()) {
                \Log::error('Validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ошибка валидации данных',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $validatedData = $validator->validated();
            
            \Log::info('Booking validated data', [
                'id' => $id,
                'validated_data' => $validatedData
            ]);
            
            $updateData = array_merge(['updated_at' => now()], $validatedData);
            
            // Remove date and time from update data as they need special handling
            if (isset($updateData['date']) || isset($updateData['time'])) {
                \Log::info('Processing date/time update', [
                    'booking_id' => $id,
                    'date' => $updateData['date'] ?? 'not provided',
                    'time' => $updateData['time'] ?? 'not provided'
                ]);
                
                // Get schedule for updating
                $scheduleId = $booking->schedule_id;
                $schedule = DB::table('schedules')->where('id', $scheduleId)->first();
                
                if ($schedule) {
                    $scheduleUpdateData = [];
                    
                    // Update date if provided
                    if (isset($updateData['date'])) {
                        $scheduleUpdateData['date'] = $updateData['date'];
                        unset($updateData['date']);
                    }
                    
                    // Update time if provided (as start_time in schedule)
                    if (isset($updateData['time'])) {
                        $scheduleUpdateData['start_time'] = $updateData['time'];
                        
                        // Calculate end_time based on duration (default 60 minutes)
                        $duration = 60; // minutes
                        $startTime = \Carbon\Carbon::parse($updateData['time']);
                        $endTime = $startTime->copy()->addMinutes($duration);
                        $scheduleUpdateData['end_time'] = $endTime->format('H:i');
                        
                        unset($updateData['time']);
                    }
                    
                    // Update schedule with new date/time
                    if (!empty($scheduleUpdateData)) {
                        \Log::info('Updating schedule', [
                            'schedule_id' => $scheduleId,
                            'updates' => $scheduleUpdateData
                        ]);
                        
                        DB::table('schedules')
                            ->where('id', $scheduleId)
                            ->update($scheduleUpdateData);
                    }
                } else {
                    \Log::warning('Schedule not found for booking', [
                        'booking_id' => $id,
                        'schedule_id' => $scheduleId
                    ]);
                }
            }
            
            // Update the booking
            if (!empty($updateData)) {
                \Log::info('Updating booking', [
                    'booking_id' => $id,
                    'updates' => $updateData
                ]);
                
                DB::table('bookings')
                    ->where('id', $id)
                    ->update($updateData);
            }
                
            // If status was updated, also update the related schedule status
            if (isset($validatedData['status'])) {
                $scheduleId = $booking->schedule_id;
                $scheduleStatus = 'booked'; // Default status
                
                // Map booking status to schedule status
                switch ($validatedData['status']) {
                    case 'pending':
                        $scheduleStatus = 'booked';
                        break;
                    case 'confirmed':
                        $scheduleStatus = 'booked';
                        break;
                    case 'completed':
                        $scheduleStatus = 'completed';
                        break;
                    case 'cancelled':
                        $scheduleStatus = 'available';
                        break;
                }
                
                \Log::info('Updating schedule status', [
                    'schedule_id' => $scheduleId,
                    'new_status' => $scheduleStatus
                ]);
                
                // Update the schedule status
                DB::table('schedules')
                    ->where('id', $scheduleId)
                    ->update([
                        'status' => $scheduleStatus,
                        'updated_at' => now()
                    ]);
            }
            
            // Get the updated booking for response validation
            $updatedBooking = DB::table('bookings')->where('id', $id)->first();
            $updatedSchedule = DB::table('schedules')->where('id', $updatedBooking->schedule_id)->first();
            
            \Log::info('Booking update completed', [
                'booking' => $updatedBooking,
                'schedule' => $updatedSchedule
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Бронирование обновлено успешно'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating booking', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при обновлении бронирования',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $booking = DB::table('bookings')->where('id', $id)->first();
            
            if (!$booking) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Бронирование не найдено'
                ], 404);
            }
            
            // Получаем ID расписания перед удалением
            $scheduleId = $booking->schedule_id;
            
            // Удаляем бронирование
            DB::table('bookings')->where('id', $id)->delete();
            
            // Обновляем статус расписания на "доступно"
            DB::table('schedules')
                ->where('id', $scheduleId)
                ->update([
                    'status' => 'available',
                    'updated_at' => now()
                ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Бронирование удалено успешно'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при удалении бронирования',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getHistory($id)
    {
        try {
            $booking = DB::table('bookings')->where('id', $id)->first();
            
            if (!$booking) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Бронирование не найдено'
                ], 404);
            }
            
            // Здесь можно реализовать получение истории бронирования
            // Это просто заглушка, так как у нас нет таблицы для истории
            $history = [
                [
                    'id' => 1,
                    'booking_id' => $id,
                    'status' => 'created',
                    'comment' => 'Бронирование создано',
                    'timestamp' => $booking->created_at
                ],
                [
                    'id' => 2,
                    'booking_id' => $id,
                    'status' => 'confirmed',
                    'comment' => 'Бронирование подтверждено',
                    'timestamp' => $booking->updated_at
                ]
            ];
            
            return response()->json([
                'status' => 'success',
                'booking_id' => $id,
                'history' => $history
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении истории бронирования',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 