<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Product::class);

        $products = Product::with(['vendor', 'primaryImage', 'images' => function ($query) {
            $query->orderBy('sort_order')->orderBy('id');
        }])
            ->withCount(['images', 'reviews'])
            ->withAvg('reviews', 'rating')
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'can' => [
                'create' => auth()->user()->can('create', Product::class),
                'edit' => auth()->user()->can('update', Product::class),
                'delete' => auth()->user()->can('delete', Product::class),
                'deleteReviews' => auth()->user()->role_id === 1, // Only admin can delete reviews
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Product::class);

        $categories = Category::get();
        $vendors = User::where('role_id', 2)->where('status', 'active')->get();

        return Inertia::render('admin/products/create', [
            'categories' => $categories,
            'vendors' => $vendors
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        $this->authorize('create', Product::class);

        $data = $request->validated();

        DB::transaction(function () use ($request, $data) {
            $product = Product::create($data);

            // Handle multiple image uploads (new system)
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('products', 'public');
                    $isPrimary = $index === 0; // First image is primary
                    $product->addImage($path, $isPrimary, $index);
                }
            }
            // Handle single image upload (backward compatibility)
            elseif ($request->hasFile('image')) {
                $path = $request->file('image')->store('products', 'public');
                $product->addImage($path, true, 0);
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }



    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $this->authorize('view', $product);
        return Inertia::render('admin/products/show', [
            'product' => $product->load(['vendor', 'category', 'images'])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $this->authorize('update', $product);

        $categories = Category::get();
        $vendors = User::where('role_id', 2)->where('status', 'active')->get();

        return Inertia::render('admin/products/edit', [
            'product' => $product->load(['vendor', 'category', 'images']),
            'categories' => $categories,
            'vendors' => $vendors
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);

        $data = $request->validated();

        DB::transaction(function () use ($request, $data, $product) {
            $product->update($data);

            // Handle single image upload (backward compatibility)
            if ($request->hasFile('image')) {
                // Delete existing images
                $product->images()->each(function ($image) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                });

                $path = $request->file('image')->store('products', 'public');
                $product->addImage($path, true, 0);
            }

            // Handle multiple image uploads
            if ($request->hasFile('images')) {
                // Delete existing images
                $product->images()->each(function ($image) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                });

                $sortOrder = 0;
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('products', 'public');
                    $isPrimary = $index === 0 && !$request->hasFile('image'); // First image is primary if no single image
                    $product->addImage($path, $isPrimary, $sortOrder);
                    $sortOrder++;
                }
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Set primary image for product.
     */
    public function setPrimaryImage(Request $request, Product $product, ProductImage $image)
    {
        $this->authorize('update', $product);

        if ($image->product_id !== $product->id) {
            abort(403);
        }

        $image->setAsPrimary();

        return back()->with('success', 'Primary image updated successfully.');
    }

    /**
     * Delete product image.
     */
    public function deleteImage(Product $product, ProductImage $image)
    {
        $this->authorize('update', $product);

        if ($image->product_id !== $product->id) {
            abort(403);
        }

        // Prevent deletion if it's the only image
        if ($product->images()->count() <= 1) {
            return back()->with('error', 'Cannot delete the only image. Add another image first.');
        }

        // Delete file from storage
        Storage::disk('public')->delete($image->image_path);

        // If this was primary, set another image as primary
        if ($image->is_primary) {
            $newPrimary = $product->images()->where('id', '!=', $image->id)->first();
            if ($newPrimary) {
                $newPrimary->setAsPrimary();
            }
        }

        $image->delete();

        return back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $product->delete();
        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Show reviews for a product (admin view).
     */
    public function reviews(Product $product)
    {
        $this->authorize('view', $product);

        $reviews = $product->reviews()
            ->with(['user:id,name', 'order:id,order_code'])
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/products/reviews', [
            'product' => $product->load(['vendor', 'category']),
            'reviews' => $reviews,
            'canDeleteReviews' => auth()->user()->role_id === 1,
        ]);
    }
}
