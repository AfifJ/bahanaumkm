<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Storage;

class ProductSku extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_id',
        'sku_code',
        'variant_name',
        'price',
        'buy_price',
        'stock',
        'image',
        'status',
        'weight',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'buy_price' => 'decimal:2',
        'stock' => 'integer',
        'weight' => 'decimal:2',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sku) {
            if (empty($sku->sku_code)) {
                $sku->sku_code = $sku->generateSkuCode();
            }
        });
    }

    /**
     * Get the product that owns the SKU.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

  
    /**
     * Get the cart items for the SKU.
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * Get the order items for the SKU.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the image URL attribute for the SKU.
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return Storage::url($this->image);
        }

        // Fallback to product's primary image
        return $this->product?->primaryImage?->url;
    }

    /**
     * Get the image for the SKU (for compatibility with controller eager loading).
     */
    public function image()
    {
        // Return a fake relationship for compatibility - the actual image URL is handled by getImageUrlAttribute
        return $this;
    }

    /**
     * Generate a unique SKU code.
     */
    public function generateSkuCode(): string
    {
        $productCode = $this->product ? strtoupper(substr($this->product->name, 0, 3)) : 'PRD';
        $randomCode = strtoupper(Str::random(6));
        return $productCode . '-' . $randomCode;
    }

  
    /**
     * Check if SKU is in stock.
     */
    public function isInStock(): bool
    {
        return $this->stock > 0 && $this->status === 'active';
    }

    /**
     * Scope a query to only include active SKUs.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include SKUs in stock.
     */
    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Scope a query to only include active and in-stock SKUs.
     */
    public function scopeAvailable($query)
    {
        return $query->active()->inStock();
    }

    /**
     * Get formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Decrease stock.
     */
    public function decreaseStock(int $quantity): bool
    {
        if ($this->stock >= $quantity) {
            $this->stock -= $quantity;
            $this->save();
            return true;
        }
        return false;
    }

    /**
     * Increase stock.
     */
    public function increaseStock(int $quantity): void
    {
        $this->stock += $quantity;
        $this->save();
    }

    /**
     * Get the variation summary attribute.
     * Uses variant_name or generates from SKU code.
     */
    public function getVariationSummaryAttribute(): string
    {
        // Use variant_name as primary source
        if (isset($this->attributes['variant_name']) && !empty($this->attributes['variant_name'])) {
            return $this->attributes['variant_name'];
        }
        
        // Generate from SKU code as fallback
        return $this->sku_code ?? '';
    }

}
