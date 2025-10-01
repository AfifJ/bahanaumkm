<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_code',
        'buyer_id',
        'mitra_id',
        'total_amount',
        'partner_commission',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'partner_commission' => 'decimal:2'
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function mitra(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mitra_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_code)) {
                $order->order_code = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            }
        });
    }
}
