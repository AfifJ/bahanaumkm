<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowedProduct extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'sku_id',
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
     * Get the SKU that is borrowed.
     */
    public function sku(): BelongsTo
    {
        return $this->belongsTo(ProductSku::class);
    }

    /**
     * Calculate current stock (borrowed - sold)
     */
    public function getCurrentStockAttribute(): int
    {
        return $this->borrowed_quantity - $this->sold_quantity;
    }

    /**
     * Check if borrowed product has SKU variations.
     */
    public function hasSku(): bool
    {
        return !is_null($this->sku_id);
    }

    /**
     * Get the effective product name (includes SKU variant if available).
     */
    public function getEffectiveNameAttribute(): string
    {
        if ($this->hasSku()) {
            $variantName = $this->sku?->variant_name ?? $this->sku?->sku_code;
            return $variantName ? "{$this->product->name} - {$variantName}" : $this->product->name;
        }

        return $this->product->name;
    }

    /**
     * Get the effective price (SKU price if available, otherwise product price).
     */
    public function getEffectivePriceAttribute(): float
    {
        if ($this->hasSku()) {
            return $this->sku->price ?? 0;
        }

        return $this->product->sell_price ?? 0;
    }

    /**
     * Get available stock for checking before borrowing.
     */
    public function getAvailableStockAttribute(): int
    {
        if ($this->hasSku()) {
            return $this->sku->stock ?? 0;
        }

        return $this->product->stock ?? 0;
    }
}
