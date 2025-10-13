<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
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
     * Get subtotal price for this cart item.
     */
    public function getSubtotalAttribute()
    {
        return $this->quantity * ($this->product->sell_price ?? 0);
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

        if ($this->product->stock < $this->quantity) {
            return false;
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

        if ($this->product && $this->product->stock >= $newQuantity) {
            $this->update(['quantity' => $newQuantity]);
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