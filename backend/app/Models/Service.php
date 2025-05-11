<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * The service points that offer this service
     */
    public function servicePoints()
    {
        return $this->belongsToMany(ServicePoint::class, 'service_point_services')
                    ->withPivot('comment')
                    ->withTimestamps();
    }
} 