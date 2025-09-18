<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    /**
     * Display catalog of products for guests and buyers
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'vendor'])
            ->where('status', 'active')
            ->where('stock', '>', 0);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Category filter
        if ($request->has('category') && $request->category && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        // Price range filter
        if ($request->has('min_price') && $request->min_price) {
            $query->where('sell_price', '>=', $request->min_price);
        }
        if ($request->has('max_price') && $request->max_price) {
            $query->where('sell_price', '<=', $request->max_price);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $validSorts = ['name', 'sell_price', 'created_at'];
        if (in_array($sortBy, $validSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $products = $query->paginate(12)->withQueryString();

        $categories = Category::all();

        return Inertia::render('catalog/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'min_price', 'max_price', 'sort_by', 'sort_order'])
        ]);
    }

    /**
     * Show individual product details
     */
    public function show(Product $product)
    {
        if ($product->status !== 'active' || $product->stock <= 0) {
            abort(404);
        }

        $product->load(['category', 'vendor']);

        // Get related products from same category
        $relatedProducts = Product::with(['category', 'vendor'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->where('stock', '>', 0)
            ->limit(4)
            ->get();

        return Inertia::render('catalog/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ]);
    }
}
