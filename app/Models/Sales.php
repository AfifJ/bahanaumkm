<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sales extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'status',
    ];

    /**
     * Get the user that owns the sale.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the borrowed products for the sale.
     */
    public function borrowedProducts(): HasMany
    {
        return $this->hasMany(BorrowedProduct::class);
    }

    /**
     * Get the orders for the sale.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
