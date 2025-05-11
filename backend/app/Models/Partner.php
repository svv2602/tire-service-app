<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'contact_person',
        'phone',
        'address',
        'status',
    ];

    /**
     * Bootstrap the model and its traits.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        // When a partner is deleted, also delete their service points
        static::deleting(function ($partner) {
            $partner->servicePoints()->delete();
        });
    }

    /**
     * Get the user associated with the partner
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all service points for this partner
     *
     * @return HasMany
     */
    public function servicePoints(): HasMany
    {
        return $this->hasMany(ServicePoint::class);
    }

    /**
     * Scope a query to only include partners with status 'работает'.
     */
    public function scopeWorking($query)
    {
        return $query->where('status', 'работает');
    }

    /**
     * Scope a query to only include partners with status 'приостановлена'.
     */
    public function scopeSuspended($query)
    {
        return $query->where('status', 'приостановлена');
    }

    /**
     * Scope a query to only include partners with status 'закрыта'.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'закрыта');
    }
}