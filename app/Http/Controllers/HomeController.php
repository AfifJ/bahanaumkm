<?php

namespace App\Http\Controllers;

use App\Models\Carousel;
use App\Models\Product;
use App\Models\Category;
use App\Models\MitraProfile;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Display the home page with featured products and banners
     */
    public function index()
    {
        // Get active carousels
        $carousels = Carousel::forHome()->get();

        // Get featured products
        $featuredProducts = Product::with(['category', 'vendor', 'primaryImage'])
            ->withCount('images')
            ->where('is_featured', true)
            ->where('status', 'active')
            ->where('stock', '>', 0)
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        // Get latest products
        $latestProducts = Product::with(['category', 'vendor', 'primaryImage'])
            ->withCount('images')
            ->where('status', 'active')
            ->where('stock', '>', 0)
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        // Get popular categories (categories with most products)
        $popularCategories = Category::withCount('products')
            ->orderBy('products_count', 'desc')
            ->limit(6)
            ->get();

        // Get all mitra/hotels for location selection
        $mitra = MitraProfile::get();

        return Inertia::render('home', [
            'carousels' => $carousels,
            'featuredProducts' => $featuredProducts,
            'latestProducts' => $latestProducts,
            'popularCategories' => $popularCategories,
            'mitra' => $mitra,
        ]);
    }
}
