<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    /**
     * Display category index page for guests and buyers
     */
    public function categoryIndex()
    {
        $categories = Category::withCount(['products' => function($query) {
            $query->where('status', 'active')->where('stock', '>', 0);
        }])->get();

        // Determine layout based on user role
        $layout = $this->getCatalogLayout();

        return Inertia::render('category/index', [
            'categories' => $categories,
            'layout' => $layout
        ]);
    }

    /**
     * Show products by category
     */
    public function categoryShow(Category $category, Request $request)
    {
        $query = Product::with(['category', 'vendor', 'primaryImage'])
            ->where('category_id', $category->id)
            ->where('status', 'active')
            ->where('stock', '>', 0);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($request->search) . '%']);
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

        // Determine layout based on user role
        $layout = $this->getCatalogLayout();

        return Inertia::render('category/show', [
            'products' => $products,
            'categories' => $categories,
            'currentCategory' => $category,
            'filters' => $request->only(['search', 'min_price', 'max_price', 'sort_by', 'sort_order']),
            'layout' => $layout
        ]);
    }

    /**
     * Search products
     */
    public function search(Request $request)
    {
        $query = Product::with(['category', 'vendor', 'primaryImage'])
            ->where('status', 'active')
            ->where('stock', '>', 0);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($request->search) . '%']);
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

        // Determine layout based on user role
        $layout = $this->getCatalogLayout();

        return Inertia::render('search/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'min_price', 'max_price', 'sort_by', 'sort_order']),
            'layout' => $layout
        ]);
    }

    /**
     * Show individual product details
     */
    public function productShow(Product $product)
    {
        if ($product->status !== 'active' || $product->stock <= 0) {
            abort(404);
        }

        // Load product with all necessary relationships including rating stats
        $product->load([
            'category',
            'vendor',
            'primaryImage',
            'images' => function ($query) {
                $query->orderBy('sort_order')->orderBy('id');
            }
        ]);

        // Get related products from same category
        $relatedProducts = Product::with(['category', 'vendor', 'primaryImage'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->where('stock', '>', 0)
            ->limit(4)
            ->get();

        // Get reviews for this product with user data
        try {
            $reviews = $product->reviews()
                ->with(['user:id,name'])
                ->latest()
                ->paginate(5);
        } catch (\Exception $e) {
            \Log::error('Error loading reviews: ' . $e->getMessage());
            $reviews = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 5);
        }

        // Pre-compute rating statistics in single query
        $ratingStats = $this->getProductRatingStats($product->id);

        // Check if user can review this product
        $canReview = false;
        $userOrder = null;
        if (auth()->check()) {
            $user = auth()->user();

            // Check if user has a delivered order containing this product
            $userOrder = \App\Models\Order::where('buyer_id', $user->id)
                ->where('status', 'delivered')
                ->whereHas('items', function ($query) use ($product) {
                    $query->where('product_id', $product->id);
                })
                ->first();

            if ($userOrder) {
                // Check if user hasn't already reviewed this product from this order
                $existingReview = Review::where('user_id', $user->id)
                    ->where('product_id', $product->id)
                    ->where('order_id', $userOrder->id)
                    ->first();

                $canReview = !$existingReview;
            }
        }

        // Determine layout based on user role
        $layout = $this->getCatalogLayout();

        // Check if product is in user's wishlist
        $isInWishlist = false;
        if (auth()->check()) {
            $user = auth()->user();
            $isInWishlist = \App\Models\Wishlist::where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->exists();
        }

        // Merge rating stats into product data
        $product->average_rating = $ratingStats['average_rating'];
        $product->total_reviews = $ratingStats['total_reviews'];
        $product->rating_breakdown = $ratingStats['rating_breakdown'];

        return Inertia::render('product/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'reviews' => $reviews,
            'canReview' => $canReview,
            'userOrder' => $userOrder,
            'layout' => $layout,
            'isInWishlist' => $isInWishlist
        ]);
    }

    /**
     * Get product rating statistics in single query
     */
    private function getProductRatingStats($productId)
    {
        try {
            $stats = Review::where('product_id', $productId)
                ->selectRaw('
                    COUNT(*) as total_reviews,
                    AVG(rating) as average_rating,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
                ')
                ->first();

            if (!$stats || $stats->total_reviews == 0) {
                return [
                    'average_rating' => 0,
                    'total_reviews' => 0,
                    'rating_breakdown' => [
                        5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0
                    ]
                ];
            }

            return [
                'average_rating' => round($stats->average_rating, 1),
                'total_reviews' => (int) $stats->total_reviews,
                'rating_breakdown' => [
                    5 => (int) $stats->five_star,
                    4 => (int) $stats->four_star,
                    3 => (int) $stats->three_star,
                    2 => (int) $stats->two_star,
                    1 => (int) $stats->one_star,
                ]
            ];
        } catch (\Exception $e) {
            \Log::error('Error calculating rating stats: ' . $e->getMessage());
            return [
                'average_rating' => 0,
                'total_reviews' => 0,
                'rating_breakdown' => [
                    5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0
                ]
            ];
        }
    }


    /**
     * Show vendor profile with their products
     */
    public function vendorShow(User $vendor, Request $request)
    {
        // Check if user is a vendor
        if ($vendor->role_id !== 2) {
            abort(404);
        }

        $query = Product::with(['category', 'vendor', 'primaryImage', 'images' => function ($query) {
            $query->orderBy('sort_order')->orderBy('id');
        }])
            ->where('vendor_id', $vendor->id)
            ->where('status', 'active')
            ->where('stock', '>', 0);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($request->search) . '%']);
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

        // Get vendor statistics
        $vendorStats = [
            'total_products' => Product::where('vendor_id', $vendor->id)->count(),
            'active_products' => Product::where('vendor_id', $vendor->id)
                ->where('status', 'active')
                ->where('stock', '>', 0)
                ->count(),
        ];

        // Determine layout based on user role
        $layout = $this->getCatalogLayout();

        return Inertia::render('vendor/show', [
            'vendor' => $vendor,
            'products' => $products,
            'categories' => $categories,
            'vendorStats' => $vendorStats,
            'filters' => $request->only(['search', 'category', 'min_price', 'max_price', 'sort_by', 'sort_order']),
            'layout' => $layout
        ]);
    }

    /**
     * Determine the appropriate layout for catalog pages
     * Use guest layout for guests and buyers (role_id = 5)
     * Use app layout for other roles
     */
    private function getCatalogLayout()
    {
        $user = auth()->user();
        
        // If user is not authenticated, use guest layout
        if (!$user) {
            return 'guest';
        }

        // If user is buyer (role_id = 5), use guest layout
        if ($user->role_id === 5) {
            return 'guest';
        }

        // For other roles (admin, vendor, mitra, sales), use app layout with sidebar
        return 'app';
    }
}
