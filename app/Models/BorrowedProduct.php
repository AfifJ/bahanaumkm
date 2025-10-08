<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowedProduct extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'borrowed_quantity',
        'sold_quantity',
        'status',
        'borrowed_date',
        'return_date',
    ];

    protected $casts = [
        'borrowed_date' => 'date',
        'return_date' => 'date',
    ];

    /**
     * Get the user (sales) that owns the borrowed product.
     */
    public function sale(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sale_id');
    }

    /**
     * Get the user (sales) that owns the borrowed product.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sale_id');
    }

    /**
     * Get the product that is borrowed.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate current stock (borrowed - sold)
     */
    public function getCurrentStockAttribute(): int
    {
        return $this->borrowed_quantity - $this->sold_quantity;
    }
}
