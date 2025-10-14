<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
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

        $products = Product::latest()->get();
        return Inertia::render('products/index', [
            'products' => $products,
            'can' => [
                'create' => auth()->user()->can('create', Product::class),
                'edit' => auth()->user()->can('update', Product::class),
                'delete' => auth()->user()->can('delete', Product::class),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Product::class);
        return Inertia::render('products/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        $this->authorize('create', Product::class);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = Storage::url($path);
        }

        Product::create($data);

        return redirect()->route('admin.products.index')
            ->with('success', 'Produk berhasil dibuat.');
    }



    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $this->authorize('view', $product);
        return Inertia::render('products/show', compact('product'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $this->authorize('update', $product);
        return Inertia::render('products/edit', compact('product'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);

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
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $product->delete();
        return redirect()->route('admin.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }
}
