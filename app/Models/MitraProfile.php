<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MitraProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'hotel_name',
        'address',
        'city',
        'phone',
        'partner_tier',
        'commission_rate',
        'unique_code'
    ];

    /**
     * Get the user that owns the mitra profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the affiliate orders for the mitra.
     */
    public function affiliateOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'mitra_id');
    }
}
