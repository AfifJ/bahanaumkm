<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carousel extends Model
{
    protected $fillable = [
        'title',
        'image_url',
        'link_url',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Scope untuk mengambil carousel yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk mengurutkan berdasarkan sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'asc');
    }

    /**
     * Scope untuk mengambil carousel yang akan ditampilkan di home
     */
    public function scopeForHome($query)
    {
        return $query->active()->ordered();
    }
}