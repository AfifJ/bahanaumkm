<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    // Status Constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_VALIDATION = 'validation';
    public const STATUS_PAID = 'paid';
    public const STATUS_PROCESSED = 'processed';
    public const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_PAYMENT_REJECTED = 'payment_rejected';
    public const STATUS_FAILED_DELIVERY = 'failed_delivery';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_RETURNED = 'returned';
    public const STATUS_REFUNDED = 'refunded';

    protected $fillable = [
        'order_code',
        'buyer_id',
        'mitra_id',
        'sale_id',
        'total_amount',
        'shipping_cost',
        'partner_commission',
        'status',
        'payment_method',
        'notes',
        'payment_proof',
        'delivery_proof',
        'delivery_proof_uploaded_at',
        'paid_at',
        'processed_at',
                'delivered_at',
        'delivered_confirmed_at',
        'auto_delivered_at',
        'payment_rejected_at',
        'out_for_delivery_at',
        'failed_delivery_at',
        'returned_at',
        'refunded_at',
        'reject_reason',
        'delivery_notes',
        'tracking_number',
        'courier_name',
        'courier_phone',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'partner_commission' => 'decimal:2',
        'paid_at' => 'datetime',
        'processed_at' => 'datetime',
                'delivered_at' => 'datetime',
        'delivery_proof_uploaded_at' => 'datetime',
        'delivered_confirmed_at' => 'datetime',
        'auto_delivered_at' => 'datetime',
        'payment_rejected_at' => 'datetime',
        'out_for_delivery_at' => 'datetime',
        'failed_delivery_at' => 'datetime',
        'returned_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function mitra(): BelongsTo
    {
        return $this->belongsTo(MitraProfile::class, 'mitra_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sale_id');
    }

    /**
     * Get the user (sales) for the order.
     */
    public function salesUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sale_id');
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
