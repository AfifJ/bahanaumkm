<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\Product;
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
            ->with('category')
            ->latest()
            ->paginate(10);

        return Inertia::render('vendor/products/index', [
            'products' => $products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::where('status', 'active')->get();
        
        return Inertia::render('vendor/products/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        $data = $request->validated();
        $data['vendor_id'] = auth()->id();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = Storage::url($path);
        }

        Product::create($data);

        return redirect()->route('vendor.products.index')
            ->with('success', 'Produk berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        // Pastikan vendor hanya bisa mengedit produk miliknya
        if ($product->vendor_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $categories = Category::where('status', 'active')->get();
        
        return Inertia::render('vendor/products/edit', [
            'product' => $product->load('category'),
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        // Pastikan vendor hanya bisa mengupdate produk miliknya
        if ($product->vendor_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $data = $request->validated();

        $oldImagePath = null;

        // Simpan path gambar lama untuk dihapus nanti
        if ($product->image_url) {
            $oldImagePath = str_replace('/storage/', '', $product->image_url);
        }

        if ($request->hasFile('image')) {
            if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }

            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = Storage::url($path);
        }

        $product->update($data);

        return redirect()->route('vendor.products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Pastikan vendor hanya bisa menghapus produk miliknya
        if ($product->vendor_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $product->delete();
        return redirect()->route('vendor.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }
}
