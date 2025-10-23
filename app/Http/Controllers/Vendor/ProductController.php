<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSku;
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
        // Ensure user is authenticated and is a vendor
        if (!auth()->check() || !auth()->user()->isVendor()) {
            abort(403, 'Unauthorized action.');
        }

        try {
            $products = Product::where('vendor_id', auth()->id())
                ->with(['category', 'primaryImage', 'images' => function ($query) {
                    $query->orderBy('sort_order')->orderBy('id');
                }])
                ->latest()
                ->paginate(10);

            // Map products to ensure image data is properly formatted
            $products->getCollection()->transform(function ($product) {
                // Ensure primaryImage is properly formatted
                if ($product->primaryImage) {
                    $product->primaryImage = [
                        'id' => $product->primaryImage->id,
                        'url' => $product->primaryImage->url,
                        'is_primary' => $product->primaryImage->is_primary,
                    ];
                }

                // Ensure images array is properly formatted
                if ($product->images) {
                    $product->images = $product->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'is_primary' => $image->is_primary,
                            'sort_order' => $image->sort_order,
                        ];
                    })->toArray();
                }

                return $product;
            });

            return Inertia::render('vendor/products/index', [
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error loading vendor products: ' . $e->getMessage());

            return Inertia::render('vendor/products/index', [
                'products' => [
                    'data' => [],
                    'links' => [],
                    'current_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                ],
            ]);
        }
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
        }, 'skus' => function ($query) {
            $query->orderBy('sku_code');
        }]);

        // Get transaction statistics
        $transactionStats = OrderItem::where('product_id', $product->id)
            ->with(['order' => function ($query) {
                $query->select('id', 'order_code', 'status', 'created_at');
            }, 'sku'])
            ->get();

        $totalTransactions = $transactionStats->count();
        $totalRevenue = $transactionStats->sum('total_price');
        $totalQuantitySold = $transactionStats->sum('quantity');
        $averageOrderValue = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        // Get SKU-level statistics for products with variations
        $skuStats = collect();
        if ($product->has_variations) {
            $skuStats = OrderItem::where('product_id', $product->id)
                ->whereNotNull('sku_id')
                ->with('sku')
                ->get()
                ->groupBy('sku_id')
                ->map(function ($items) {
                    $sku = $items->first()->sku;
                    return [
                        'sku_id' => $sku->id,
                        'sku_code' => $sku->sku_code,
                        'variation_summary' => $sku->variation_summary,
                        'total_quantity' => $items->sum('quantity'),
                        'total_revenue' => $items->sum('total_price'),
                        'transaction_count' => $items->count(),
                    ];
                })->values();
        }

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
            'skuStats' => $skuStats,
            'reviews' => $reviews,
            'ratingStats' => $ratingStats,
        ]);
    }

    /**
     * Display SKUs for a product
     */
    public function skus(Product $product)
    {
        // Ensure vendor can only view their own products
        if ($product->vendor_id !== auth()->id()) {
            abort(403);
        }

        // Load SKUs with variation options
        $skus = $product->skus()
            ->with('variationOptions.variation')
            ->get()
            ->map(function ($sku) {
                return [
                    'id' => $sku->id,
                    'sku_code' => $sku->sku_code,
                    'price' => $sku->price,
                    'buy_price' => $sku->buy_price,
                    'stock' => $sku->stock,
                    'status' => $sku->status,
                    'variation_summary' => $sku->variation_summary,
                    'variation_options' => $sku->variationOptions->map(function ($option) {
                        return [
                            'variation_name' => $option->variation->name,
                            'option_value' => $option->value,
                            'color_code' => $option->color_code,
                        ];
                    }),
                    'created_at' => $sku->created_at,
                ];
            });

        return Inertia::render('vendor/products/skus', [
            'product' => $product,
            'skus' => $skus,
        ]);
    }

    /**
     * Update SKU price and stock
     */
    public function updateSku(Request $request, Product $product, ProductSku $sku)
    {
        // Ensure vendor can only update their own products
        if ($product->vendor_id !== auth()->id()) {
            abort(403);
        }

        // Ensure SKU belongs to this product
        if ($sku->product_id !== $product->id) {
            abort(404);
        }

        $request->validate([
            'price' => 'required|numeric|min:0',
            'buy_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $sku->update($request->only(['price', 'buy_price', 'stock', 'status']));

        return back()->with('success', 'SKU berhasil diperbarui.');
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
