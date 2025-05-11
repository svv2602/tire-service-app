<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceTimeSlot extends Model
{
    protected $fillable = [
        'service_point_id',
        'start_time',
        'end_time',
        'day_of_week',
        'is_available',
        'max_appointments',
    ];
    
    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_available' => 'boolean',
    ];
    
    /**
     * Получить сервисную точку, к которой относится этот временной слот
     */
    public function servicePoint(): BelongsTo
    {
        return $this->belongsTo(ServicePoint::class);
    }
    
    /**
     * Получить все доступные слоты для указанной сервисной точки и дня недели
     */
    public static function getAvailableSlots($servicePointId, $dayOfWeek)
    {
        return self::where('service_point_id', $servicePointId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->orderBy('start_time')
            ->get();
    }
    
    /**
     * Генерировать слоты для сервисной точки на основе рабочих часов
     */
    public static function generateSlotsFromWorkingHours($servicePointId, $workingHours, $slotDuration = 30)
    {
        $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        foreach ($daysOfWeek as $day) {
            // Проверяем наличие рабочих часов для этого дня
            if (isset($workingHours[$day]) && $workingHours[$day] !== 'closed') {
                // Разбираем рабочие часы
                $hours = is_string($workingHours[$day]) 
                    ? explode('-', $workingHours[$day]) 
                    : [$workingHours[$day]['open'], $workingHours[$day]['close']];
                
                if (count($hours) === 2) {
                    $startTime = trim($hours[0]);
                    $endTime = trim($hours[1]);
                    
                    // Удаляем все существующие слоты для этого дня
                    self::where('service_point_id', $servicePointId)
                        ->where('day_of_week', $day)
                        ->delete();
                    
                    // Создаем новые слоты с интервалом в $slotDuration минут
                    $currentTime = strtotime($startTime);
                    $endTimeStamp = strtotime($endTime);
                    
                    while ($currentTime < $endTimeStamp) {
                        $slotStart = date('H:i', $currentTime);
                        $currentTime += $slotDuration * 60;
                        $slotEnd = date('H:i', $currentTime);
                        
                        self::create([
                            'service_point_id' => $servicePointId,
                            'start_time' => $slotStart,
                            'end_time' => $slotEnd,
                            'day_of_week' => $day,
                            'is_available' => true,
                            'max_appointments' => 1, // По умолчанию 1 запись на слот
                        ]);
                    }
                }
            }
        }
    }
}
