<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceAppointment extends Model
{
    protected $fillable = [
        'service_point_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'appointment_date',
        'appointment_time',
        'duration_minutes',
        'services_description',
        'service_id',
        'status',
        'comment',
    ];
    
    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
    ];
    
    /**
     * Получить сервисную точку для этой записи
     */
    public function servicePoint(): BelongsTo
    {
        return $this->belongsTo(ServicePoint::class);
    }
    
    /**
     * Получить услугу, связанную с этой записью
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
    
    /**
     * Проверить, возможно ли создать запись на указанное время
     */
    public static function isSlotAvailable($servicePointId, $date, $time): bool
    {
        // Преобразуем дату в день недели
        $dayOfWeek = strtolower(date('l', strtotime($date)));
        
        // Проверяем наличие доступного слота
        $slot = ServiceTimeSlot::where('service_point_id', $servicePointId)
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<=', $time)
            ->where('end_time', '>', $time)
            ->where('is_available', true)
            ->first();
            
        if (!$slot) {
            return false; // Нет доступного слота на это время
        }
        
        // Подсчитываем количество уже существующих записей на это время
        $existingAppointments = self::where('service_point_id', $servicePointId)
            ->where('appointment_date', $date)
            ->where('appointment_time', $time)
            ->where('status', '!=', 'cancelled')
            ->count();
            
        // Проверяем, что количество записей меньше максимально допустимого
        return $existingAppointments < $slot->max_appointments;
    }
}
