<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function partner()
    {
        return $this->hasOne(Partner::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'client_id');
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isPartner()
    {
        return $this->role === 'partner';
    }

    public function isClient()
    {
        return $this->role === 'client';
    }

    // Do not override tokens() method as it's provided by HasApiTokens trait
    // The tokens() method from HasApiTokens is needed for token authentication
}
