<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Schedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'service_point_id',
        'post_number',
        'date',
        'time',
        'start_time',
        'end_time',
        'status',
        'metadata'
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'metadata' => 'array'
    ];

    public function servicePoint()
    {
        return $this->belongsTo(ServicePoint::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available' && 
               Carbon::parse($this->start_time)->isFuture();
    }

    public function getDurationInMinutes(): int
    {
        return Carbon::parse($this->start_time)->diffInMinutes(Carbon::parse($this->end_time));
    }

    public function markAsBooked(): void
    {
        $this->update([
            'status' => 'booked'
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed'
        ]);
    }

    public function markAsCancelled(): void
    {
        $this->update([
            'status' => 'cancelled'
        ]);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')
                    ->where('start_time', '>', now());
    }

    public function scopeForServicePoint($query, $servicePointId)
    {
        return $query->where('service_point_id', $servicePointId);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }
}