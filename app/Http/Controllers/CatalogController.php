<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
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
        $query = Product::with(['category', 'vendor'])
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
        $query = Product::with(['category', 'vendor'])
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

        $product->load(['category', 'vendor']);

        // Get related products from same category
        $relatedProducts = Product::with(['category', 'vendor'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->where('stock', '>', 0)
            ->limit(4)
            ->get();

        // Determine layout based on user role
        $layout = $this->getCatalogLayout();

        return Inertia::render('product/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
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
