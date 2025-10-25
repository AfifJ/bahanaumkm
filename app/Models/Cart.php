<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'sku_id',
        'quantity',
        'variation_summary',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    /**
     * Get the user that owns the cart item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product that belongs to the cart item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the SKU that belongs to the cart item.
     */
    public function sku(): BelongsTo
    {
        return $this->belongsTo(ProductSku::class);
    }

    /**
     * Scope to get cart items for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get cart items with product data.
     */
    public function scopeWithProduct($query)
    {
        return $query->with('product');
    }

    /**
     * Scope to get cart items with SKU data.
     */
    public function scopeWithSku($query)
    {
        return $query->with('sku');
    }

    /**
     * Get subtotal price for this cart item.
     */
    public function getSubtotalAttribute()
    {
        // Use SKU price if available, otherwise use product price
        $price = 0;

        if ($this->sku_id && $this->sku) {
            $price = $this->sku->price;
        } elseif ($this->product) {
            $price = $this->product->sell_price ?? 0;
        }

        return $this->quantity * $price;
    }

    /**
     * Get unit price for this cart item.
     */
    public function getUnitPriceAttribute()
    {
        // Use SKU price if available, otherwise use product price
        if ($this->sku_id && $this->sku) {
            return $this->sku->price;
        } elseif ($this->product) {
            return $this->product->sell_price ?? 0;
        }

        return 0;
    }

    /**
     * Check if the cart item is valid (product exists and has enough stock).
     */
    public function isValid()
    {
        if (!$this->product) {
            return false;
        }

        if ($this->product->status !== 'active') {
            return false;
        }

        // Check stock based on SKU or product
        if ($this->sku_id && $this->sku) {
            // Use SKU stock
            if (!$this->sku->isInStock() || $this->sku->stock < $this->quantity) {
                return false;
            }
        } else {
            // Use product stock
            if ($this->product->stock < $this->quantity) {
                return false;
            }
        }

        return true;
    }

    /**
     * Update quantity if valid.
     */
    public function updateQuantity($newQuantity)
    {
        if ($newQuantity <= 0) {
            return $this->delete();
        }

        // Check stock based on SKU or product
        $availableStock = 0;

        if ($this->sku_id && $this->sku) {
            // Use SKU stock
            $availableStock = $this->sku->stock;
        } elseif ($this->product) {
            // Use product stock
            $availableStock = $this->product->stock;
        }

        if ($availableStock >= $newQuantity) {
            $this->update(['quantity' => $newQuantity]);
            $this->touch(); // Update updated_at timestamp
            return true;
        }

        return false;
    }

    /**
     * Get formatted subtotal.
     */
    public function getFormattedSubtotal()
    {
        return number_format($this->subtotal, 0, ',', '.');
    }
}