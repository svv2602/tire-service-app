<?php

namespace App\Http\Controllers\v2;

use App\Http\Controllers\Controller;
use App\Models\ServiceAppointment;
use App\Models\ServicePoint;
use App\Models\ServiceTimeSlot;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Get available days for a specific service point
     */
    public function getAvailableDays(Request $request, $servicePointId)
    {
        $servicePoint = ServicePoint::find($servicePointId);
        if (!$servicePoint) {
            return response()->json(['error' => 'Сервисная точка не найдена'], 404);
        }
        
        // Get the working hours from the service point
        $workingHours = json_decode($servicePoint->working_hours, true);
        if (!$workingHours) {
            return response()->json(['error' => 'Нет информации о рабочих часах'], 404);
        }
        
        $availableDays = [];
        $daysMap = [
            'monday' => 'Понеделник',
            'tuesday' => 'Вторник',
            'wednesday' => 'Среда',
            'thursday' => 'Четверг',
            'friday' => 'Пятница',
            'saturday' => 'Суббота',
            'sunday' => 'Воскресенье',
        ];
        
        // Get next 14 days
        $startDate = Carbon::now();
        for ($i = 0; $i < 14; $i++) {
            $date = $startDate->copy()->addDays($i);
            $dayOfWeek = strtolower($date->englishDayOfWeek);
            
            // Check if the service point works this day
            if (isset($workingHours[$dayOfWeek]) && $workingHours[$dayOfWeek] !== 'closed') {
                $availableDays[] = [
                    'date' => $date->format('Y-m-d'),
                    'day_name' => $daysMap[$dayOfWeek],
                    'day_number' => $date->day,
                    'month_name' => $date->locale('ru')->monthName,
                    'year' => $date->year,
                ];
            }
        }
        
        return response()->json(['available_days' => $availableDays]);
    }
    
    /**
     * Get available time slots for a specific service point and date
     */
    public function getAvailableTimeSlots(Request $request, $servicePointId, $date)
    {
        $servicePoint = ServicePoint::find($servicePointId);
        if (!$servicePoint) {
            return response()->json(['error' => 'Сервисная точка не найдена'], 404);
        }
        
        $carbon = Carbon::parse($date);
        $dayOfWeek = strtolower($carbon->englishDayOfWeek);
        
        // Get slots from database or generate them if not exist
        $slots = ServiceTimeSlot::where('service_point_id', $servicePointId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->orderBy('start_time')
            ->get();
            
        if ($slots->isEmpty()) {
            // Generate slots from working hours
            $workingHours = json_decode($servicePoint->working_hours, true);
            if (!$workingHours || !isset($workingHours[$dayOfWeek]) || $workingHours[$dayOfWeek] === 'closed') {
                return response()->json(['error' => 'Нет доступных слотов на этот день'], 404);
            }
            
            ServiceTimeSlot::generateSlotsFromWorkingHours($servicePointId, $workingHours);
            
            $slots = ServiceTimeSlot::where('service_point_id', $servicePointId)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->orderBy('start_time')
                ->get();
        }
        
        // Check which slots are already booked
        $availableSlots = [];
        foreach ($slots as $slot) {
            $isAvailable = ServiceAppointment::isSlotAvailable(
                $servicePointId, 
                $date, 
                $slot->start_time->format('H:i')
            );
            
            $availableSlots[] = [
                'time' => $slot->start_time->format('H:i'),
                'is_available' => $isAvailable,
            ];
        }
        
        return response()->json([
            'date' => $date,
            'day_of_week' => $dayOfWeek,
            'time_slots' => $availableSlots
        ]);
    }
    
    /**
     * Create a new appointment
     */
    public function createAppointment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_point_id' => 'required|exists:service_points,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'service_id' => 'nullable|exists:services,id',
            'comment' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if the slot is available
        $isAvailable = ServiceAppointment::isSlotAvailable(
            $request->service_point_id,
            $request->appointment_date,
            $request->appointment_time
        );
        
        if (!$isAvailable) {
            return response()->json(['error' => 'Выбранное время недоступно'], 422);
        }
        
        // Create the appointment
        $appointment = ServiceAppointment::create([
            'service_point_id' => $request->service_point_id,
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'customer_email' => $request->customer_email,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'duration_minutes' => 30, // Default duration
            'service_id' => $request->service_id,
            'status' => 'pending',
            'comment' => $request->comment,
        ]);
        
        return response()->json([
            'message' => 'Запись успешно создана',
            'appointment' => $appointment
        ], 201);
    }
} 