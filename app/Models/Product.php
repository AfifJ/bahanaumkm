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
        'stock',
        'description',
        'image_url',
        'status'
    ];

    protected $casts = [
        'buy_price' => 'decimal:2',
        'sell_price' => 'decimal:2',
        'status' => 'string'
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
     * Get the image URL attribute (backward compatibility).
     */
    public function getImageUrlAttribute(): ?string
    {
        // First try to get primary image from new relationship
        $primaryImage = $this->relationLoaded('primaryImage') ? $this->primaryImage : null;
        if ($primaryImage) {
            return $primaryImage->url;
        }

        // Fallback to legacy image_url field
        return $this->attributes['image_url'] ?? null;
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
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

}
