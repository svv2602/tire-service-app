<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'client_id',
        'service_point_id',
        'full_name',
        'phone',
        'car_number',
        'vehicle_brand',
        'vehicle_type',
        'notes',
        'status',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function servicePoint()
    {
        return $this->belongsTo(ServicePoint::class);
    }
}