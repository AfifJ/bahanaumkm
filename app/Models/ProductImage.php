<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'image_path',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the product that owns the image.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the full URL for the image.
     */
    public function getUrlAttribute(): string
    {
        // DEBUG: Log the image path
        \Log::info("ProductImage::getUrlAttribute() - ID: {$this->id}, Path: '{$this->image_path}'");

        // Ensure we have a valid image path
        if (!$this->image_path) {
            \Log::warning("ProductImage::getUrlAttribute() - Empty image_path for ID: {$this->id}");
            return '';
        }

        try {
            // Generate URL using Storage facade with disk
            $url = Storage::url($this->image_path);
            \Log::info("ProductImage::getUrlAttribute() - Generated URL: '{$url}'");

            // Ensure URL starts with /storage/ for public disk
            if (!str_starts_with($url, 'http')) {
                $url = '/' . ltrim($url, '/');
            }

            \Log::info("ProductImage::getUrlAttribute() - Final URL: '{$url}'");
            return $url;

        } catch (\Exception $e) {
            \Log::error("ProductImage::getUrlAttribute() - Error: " . $e->getMessage());
            return '';
        }
    }

    /**
     * Scope to get primary images only.
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Scope to get images ordered by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Set as primary image (unsets other primary images for the same product).
     */
    public function setAsPrimary()
    {
        // Unset other primary images for this product
        static::where('product_id', $this->product_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        // Set this image as primary
        $this->update(['is_primary' => true]);
    }
}
