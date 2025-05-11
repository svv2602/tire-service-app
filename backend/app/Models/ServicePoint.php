<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class ServicePoint extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'partner_id',
        'name',
        'region',
        'city',
        'address',
        'lat',
        'lng',
        'working_hours',
        'description',
        'contact_info',
        'notes',
        'num_posts',
        'service_time_grid',
        'service_posts',
        'price_list_path',
        'status'
    ];

    protected $casts = [
        'working_hours' => 'array',
        'service_posts' => 'array',
        'lat' => 'float',
        'lng' => 'float',
        'status' => 'string'
    ];

    /**
     * Bootstrap the model and its traits.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        // Set default status for new service points
        static::creating(function ($servicePoint) {
            if (empty($servicePoint->status)) {
                $servicePoint->status = 'working';
            }
        });
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Связь с услугами через pivot таблицу
     */
    public function services()
    {
        return $this->belongsToMany(Service::class, 'service_point_services')
                    ->withPivot('comment')
                    ->withTimestamps();
    }

    /**
     * Добавляем связь с фотографиями
     */
    public function photos()
    {
        return $this->hasMany(ServicePointPhoto::class);
    }

    /**
     * Get the appointments for the service point
     */
    public function appointments()
    {
        return $this->hasMany(ServiceAppointment::class);
    }

    /**
     * Get the time slots for the service point
     */
    public function timeSlots()
    {
        return $this->hasMany(ServiceTimeSlot::class);
    }

    /**
     * Scope a query to only include service points with status 'working'.
     */
    public function scopeWorking($query)
    {
        return $query->where('status', 'working');
    }

    /**
     * Scope a query to only include service points with status 'suspended'.
     */
    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    /**
     * Scope a query to only include service points with status 'closed'.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function getWorkingHoursForDay($day)
    {
        $hours = $this->working_hours[strtolower($day)] ?? null;
        return $hours === 'closed' ? null : $hours;
    }

    public function isOpenOnDay($day)
    {
        return $this->getWorkingHoursForDay($day) !== null;
    }
}