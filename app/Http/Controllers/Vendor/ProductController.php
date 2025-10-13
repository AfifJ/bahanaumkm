<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::where('vendor_id', auth()->id())
            ->with(['category', 'primaryImage', 'images' => function ($query) {
                $query->orderBy('sort_order')->orderBy('id');
            }])
            ->latest()
            ->paginate(10);

        return Inertia::render('vendor/products/index', [
            'products' => $products,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        // Ensure vendor can only view their own products
        if ($product->vendor_id !== auth()->id()) {
            abort(403);
        }

        // Load product with relationships
        $product->load(['category', 'primaryImage', 'images' => function ($query) {
            $query->orderBy('sort_order')->orderBy('id');
        }]);

        // Get transaction statistics
        $transactionStats = OrderItem::where('product_id', $product->id)
            ->with(['order' => function ($query) {
                $query->select('id', 'order_code', 'status', 'created_at');
            }])
            ->get();

        $totalTransactions = $transactionStats->count();
        $totalRevenue = $transactionStats->sum('total_price');
        $totalQuantitySold = $transactionStats->sum('quantity');
        $averageOrderValue = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        // Get reviews with pagination
        $reviews = Review::where('product_id', $product->id)
            ->with(['user:id,name', 'order:id,order_code'])
            ->latest()
            ->paginate(10);

        // Calculate rating statistics
        $ratingStats = [
            'average_rating' => $reviews->avg('rating') ?? 0,
            'total_reviews' => $reviews->total(),
            'rating_breakdown' => Review::where('product_id', $product->id)
                ->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->orderBy('rating', 'desc')
                ->pluck('count', 'rating')
                ->toArray(),
        ];

        return Inertia::render('vendor/products/show', [
            'product' => $product,
            'transactionStats' => [
                'total_transactions' => $totalTransactions,
                'total_revenue' => $totalRevenue,
                'total_quantity_sold' => $totalQuantitySold,
                'average_order_value' => $averageOrderValue,
            ],
            'reviews' => $reviews,
            'ratingStats' => $ratingStats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }
}
