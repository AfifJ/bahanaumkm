<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'name',
        'slug',
        'buy_price',
        'sell_price',
        'base_price',
        'stock',
        'description',
        'status',
        'has_variations',
        'different_prices',
        'use_images'
    ];

    protected $casts = [
        'buy_price' => 'decimal:2',
        'sell_price' => 'decimal:2',
        'base_price' => 'decimal:2',
        'status' => 'string',
        'has_variations' => 'boolean',
        'different_prices' => 'boolean',
        'use_images' => 'boolean'
    ];

    protected $appends = ['average_rating', 'total_reviews'];

    /**
     * Get the category that owns the product.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the vendor that owns the product.
     */
    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class)->latest();
    }

    /**
     * Get the average rating for the product.
     */
    public function averageRating()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    /**
     * Get the total number of reviews for the product.
     */
    public function totalReviews()
    {
        return $this->reviews()->count();
    }

    /**
     * Get the average rating attribute for JSON serialization.
     * Uses pre-computed value from controller if available, falls back to database query.
     */
    public function getAverageRatingAttribute()
    {
        // Return pre-computed value if set by controller
        if (isset($this->attributes['average_rating'])) {
            return (float) $this->attributes['average_rating'];
        }

        // Fallback to database query if not pre-computed
        try {
            return $this->averageRating();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get the total reviews attribute for JSON serialization.
     * Uses pre-computed value from controller if available, falls back to database query.
     */
    public function getTotalReviewsAttribute()
    {
        // Return pre-computed value if set by controller
        if (isset($this->attributes['total_reviews'])) {
            return (int) $this->attributes['total_reviews'];
        }

        // Fallback to database query if not pre-computed
        try {
            return $this->totalReviews();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get rating breakdown for the product.
     * Uses pre-computed value from controller if available, falls back to database query.
     */
    public function ratingBreakdown()
    {
        // Return pre-computed value if set by controller
        if (isset($this->attributes['rating_breakdown'])) {
            return $this->attributes['rating_breakdown'];
        }

        // Fallback to database query if not pre-computed
        try {
            return $this->reviews()
                ->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->orderBy('rating', 'desc')
                ->pluck('count', 'rating')
                ->toArray();
        } catch (\Exception $e) {
            return [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        }
    }

    /**
     * Update the average rating for the product.
     */
    public function updateAverageRating()
    {
        // This method is called automatically when reviews are added/updated/deleted
        // The average rating is calculated on-the-fly when needed
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = static::generateUniqueSlug($product->name);
            }
        });

        static::updating(function ($product) {
            if ($product->isDirty('name') && empty($product->slug)) {
                $product->slug = static::generateUniqueSlug($product->name);
            }
        });
    }

    /**
     * Generate a unique slug for the product.
     */
    protected static function generateUniqueSlug($name)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }

    /**
     * Get the wishlists that contain this product.
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Get the images for the product.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->ordered();
    }

    /**
     * Get the primary image for the product.
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->primary();
    }

    /**
     * Get the image URL attribute.
     */
    public function getImageUrlAttribute(): ?string
    {
        // Get primary image from new relationship
        $primaryImage = $this->relationLoaded('primaryImage') ? $this->primaryImage : null;
        if ($primaryImage) {
            return $primaryImage->url;
        }

        // If no primary image loaded, try to get it from database
        if (!$primaryImage) {
            $primaryImage = $this->primaryImage()->first();
            if ($primaryImage) {
                return $primaryImage->url;
            }
        }

        return null;
    }

    /**
     * Get all image URLs as array.
     */
    public function getImageUrlsAttribute(): array
    {
        if ($this->relationLoaded('images')) {
            return $this->images->pluck('url')->toArray();
        }

        return $this->images()->pluck('url')->toArray();
    }

    /**
     * Add image to product.
     */
    public function addImage(string $imagePath, bool $isPrimary = false, int $sortOrder = null): ProductImage
    {
        $image = $this->images()->create([
            'image_path' => $imagePath,
            'is_primary' => $isPrimary,
            'sort_order' => $sortOrder ?? $this->images()->max('sort_order') + 1,
        ]);

        if ($isPrimary) {
            $image->setAsPrimary();
        }

        return $image;
    }

    /**
     * Set primary image by ID.
     */
    public function setPrimaryImage(int $imageId): void
    {
        $image = $this->images()->findOrFail($imageId);
        $image->setAsPrimary();
    }

    
    /**
     * Get the SKUs for the product.
     */
    public function skus()
    {
        return $this->hasMany(ProductSku::class);
    }

    /**
     * Get the SKUs with variation information for the product.
     * Note: Simplified version - variation information is now stored directly in SKU.
     */
    public function skusWithVariations()
    {
        return $this->skus()->orderBy('sku_code');
    }

    /**
     * Get the active SKUs for the product.
     */
    public function activeSkus()
    {
        return $this->skus()->available();
    }

    /**
     * Get the total stock across all SKUs.
     */
    public function getTotalStockAttribute(): int
    {
        if ($this->has_variations) {
            return $this->activeSkus()->sum('stock');
        }
        return $this->stock;
    }

    /**
     * Get the minimum price across all SKUs.
     */
    public function getMinPriceAttribute(): float
    {
        if ($this->has_variations) {
            $minPrice = $this->activeSkus()->min('price');
            return $minPrice ?? $this->base_price ?? $this->sell_price ?? 0;
        }
        return $this->base_price ?? $this->sell_price ?? 0;
    }

    /**
     * Get the maximum price across all SKUs.
     */
    public function getMaxPriceAttribute(): float
    {
        if ($this->has_variations) {
            $maxPrice = $this->activeSkus()->max('price');
            return $maxPrice ?? $this->base_price ?? $this->sell_price ?? 0;
        }
        return $this->base_price ?? $this->sell_price ?? 0;
    }

    /**
     * Check if product has any available SKUs.
     */
    public function hasAvailableSkus(): bool
    {
        if ($this->has_variations) {
            return $this->activeSkus()->exists();
        }
        return $this->stock > 0 && $this->status === 'active';
    }

    /**
     * Check if product has any stock available (including SKUs).
     */
    public function hasStockAvailable(): bool
    {
        if ($this->has_variations) {
            return $this->activeSkus()->where('stock', '>', 0)->exists();
        }
        return $this->stock > 0;
    }

    /**
     * Get available stock count (including SKUs).
     */
    public function getAvailableStockCount(): int
    {
        if ($this->has_variations) {
            return $this->activeSkus()->sum('stock');
        }
        return $this->stock;
    }

    /**
     * Check if product can be assigned to sales (has sufficient stock).
     */
    public function canBeAssignedToSales(int $quantity = 1): bool
    {
        if ($this->has_variations) {
            // For products with variations, check if any SKU has sufficient stock
            return $this->activeSkus()->where('stock', '>=', $quantity)->exists();
        }
        return $this->stock >= $quantity;
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Check if product has any orders (trigger for edit restrictions).
     */
    public function hasOrders(): bool
    {
        return $this->hasMany(OrderItem::class, 'product_id')->exists();
    }

    /**
     * Get order items for this product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }

    /**
     * Check if a specific SKU has orders.
     */
    public function skuHasOrders(int $skuId): bool
    {
        return $this->orderItems()->where('sku_id', $skuId)->exists();
    }

    /**
     * Get list of attribute names used in variations (parsed from variant_name).
     */
    public function getUsedVariationAttributes(): array
    {
        if (!$this->has_variations) {
            return [];
        }

        $attributes = [];
        $skus = $this->skus()->get();
        
        foreach ($skus as $sku) {
            if ($sku->variant_name) {
                // Parse variant_name format: "Ukuran: L, Warna: Merah"
                $parts = explode(',', $sku->variant_name);
                foreach ($parts as $part) {
                    if (strpos($part, ':') !== false) {
                        [$attrName] = explode(':', $part, 2);
                        $attrName = trim($attrName);
                        if (!in_array($attrName, $attributes)) {
                            $attributes[] = $attrName;
                        }
                    }
                }
            }
        }
        
        return $attributes;
    }

    /**
     * Get list of all variation values used across all SKUs.
     */
    public function getUsedVariationValues(): array
    {
        if (!$this->has_variations) {
            return [];
        }

        $values = [];
        $skus = $this->skus()->get();
        
        foreach ($skus as $sku) {
            if ($sku->variant_name) {
                // Parse variant_name format: "Ukuran: L, Warna: Merah"
                $parts = explode(',', $sku->variant_name);
                foreach ($parts as $part) {
                    if (strpos($part, ':') !== false) {
                        [, $value] = explode(':', $part, 2);
                        $value = trim($value);
                        if (!in_array($value, $values)) {
                            $values[] = $value;
                        }
                    }
                }
            }
        }
        
        return $values;
    }

}
