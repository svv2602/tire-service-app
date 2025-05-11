<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function index()
    {
        return Schedule::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        return Schedule::create($validated);
    }

    public function show(Schedule $schedule)
    {
        return $schedule;
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'post_id' => 'exists:posts,id',
            'date' => 'date',
            'start_time' => 'string',
            'end_time' => 'string',
        ]);

        $schedule->update($validated);

        return $schedule;
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return response()->noContent();
    }

    public function book(Schedule $schedule)
    {
        if (!$schedule->isAvailable()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Schedule is not available for booking'
            ], 422);
        }

        $schedule->markAsBooked();

        return response()->json([
            'status' => 'success',
            'message' => 'Schedule booked successfully',
            'data' => $schedule
        ]);
    }

    public function complete(Schedule $schedule)
    {
        if ($schedule->status !== 'booked') {
            return response()->json([
                'status' => 'error',
                'message' => 'Schedule must be booked before completing'
            ], 422);
        }

        $schedule->markAsCompleted();

        return response()->json([
            'status' => 'success',
            'message' => 'Schedule marked as completed',
            'data' => $schedule
        ]);
    }

    public function cancel(Schedule $schedule)
    {
        if ($schedule->status !== 'booked') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only booked schedules can be cancelled'
            ], 422);
        }

        $schedule->markAsCancelled();

        return response()->json([
            'status' => 'success',
            'message' => 'Schedule cancelled successfully',
            'data' => $schedule
        ]);
    }

    /**
     * Проверяет возможность продолжения итерации для данного расписания
     *
     * @param Schedule $schedule
     * @return \Illuminate\Http\JsonResponse
     */
    public function canIterate(Schedule $schedule)
    {
        $nextSlot = Carbon::parse($schedule->end_time)->addMinutes(30);
        $endOfDay = Carbon::parse($schedule->date)->setHour(20)->setMinute(0);

        $hasConflict = Schedule::where('date', $schedule->date)
            ->where('start_time', $nextSlot->format('H:i:s'))
            ->exists();

        return response()->json([
            'can_iterate' => $nextSlot->lt($endOfDay) && !$hasConflict,
            'next_slot' => $nextSlot->format('H:i:s')
        ]);
    }

    /**
     * Создает следующий временной слот на основе текущего
     *
     * @param Schedule $schedule
     * @return \Illuminate\Http\JsonResponse
     */
    public function iterate(Schedule $schedule)
    {
        $nextSlot = Carbon::parse($schedule->end_time)->addMinutes(30);
        $endOfDay = Carbon::parse($schedule->date)->setHour(20)->setMinute(0);

        if ($nextSlot->gte($endOfDay)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot create next slot: end of working day reached'
            ], 422);
        }

        $hasConflict = Schedule::where('date', $schedule->date)
            ->where('start_time', $nextSlot->format('H:i:s'))
            ->exists();

        if ($hasConflict) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot create next slot: time slot already exists'
            ], 422);
        }

        $newSchedule = Schedule::create([
            'post_id' => $schedule->post_id,
            'date' => $schedule->date,
            'start_time' => $nextSlot->format('H:i:s'),
            'end_time' => $nextSlot->addMinutes(30)->format('H:i:s'),
            'status' => 'available'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Next slot created successfully',
            'data' => $newSchedule
        ]);
    }
}
