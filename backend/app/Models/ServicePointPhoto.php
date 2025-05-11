<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServicePointPhoto extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'service_point_id',
        'path',
        'sort_order'
    ];

    /**
     * Get the service point that owns the photo
     */
    public function servicePoint()
    {
        return $this->belongsTo(ServicePoint::class);
    }
} 