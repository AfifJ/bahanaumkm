<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'sku_id',
        'quantity',
        'unit_price',
        'total_price',
        'variation_summary'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2'
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function sku(): BelongsTo
    {
        return $this->belongsTo(ProductSku::class);
    }

    /**
     * Get formatted unit price.
     */
    public function getFormattedUnitPriceAttribute()
    {
        return 'Rp ' . number_format($this->unit_price, 0, ',', '.');
    }

    /**
     * Get formatted total price.
     */
    public function getFormattedTotalPriceAttribute()
    {
        return 'Rp ' . number_format($this->total_price, 0, ',', '.');
    }

    /**
     * Get variation details from SKU.
     */
    public function getVariationDetailsAttribute()
    {
        if (!$this->sku_id || !$this->sku) {
            return null;
        }

        return $this->sku->variationOptions->map(function ($option) {
            return [
                'variation_name' => $option->variation->name,
                'option_value' => $option->value,
                'color_code' => $option->color_code,
            ];
        });
    }

    /**
     * Get product name with variation summary.
     */
    public function getDisplayNameAttribute()
    {
        $name = $this->product?->name ?? 'Product Unknown';

        if ($this->variation_summary) {
            $name .= ' (' . $this->variation_summary . ')';
        }

        return $name;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($orderItem) {
            $orderItem->total_price = $orderItem->quantity * $orderItem->unit_price;

            // Auto-generate variation summary if SKU is provided
            if ($orderItem->sku_id && !$orderItem->variation_summary) {
                $orderItem->variation_summary = $orderItem->getVariationSummaryFromSku();
            }
        });

        static::updating(function ($orderItem) {
            $orderItem->total_price = $orderItem->quantity * $orderItem->unit_price;
        });
    }

    /**
     * Get variation summary from SKU.
     */
    private function getVariationSummaryFromSku()
    {
        if (!$this->sku_id) {
            return null;
        }

        $sku = ProductSku::find($this->sku_id);
        if (!$sku) {
            return null;
        }

        return $sku->variation_summary;
    }
}
