<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use App\Models\BorrowedProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BorrowedProductController extends Controller
{
    /**
     * TODO:
     * untuk melihat list produk yang sedang dipinjam saat ini
     * Display a listing of the resource.
     */
    public function index()
    {
        $sale = Sales::where('user_id', auth()->id())->firstOrFail();

        $borrowedProducts = BorrowedProduct::with('product')
            ->where('sale_id', $sale->id)
            ->where('status', 'borrowed')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('sales/products/index', [
            'borrowedProducts' => $borrowedProducts,
        ]);
    }

    /**
     * TODO: 
     * form untuk menginput barang produk (dipinjam)
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::where('stock', '>', 0)
            ->orderBy('name')
            ->get();

        return Inertia::render('sales/products/new', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $sale = Sales::where('user_id', auth()->id())->firstOrFail();
        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return back()->withErrors([
                'quantity' => 'Stok tidak mencukupi. Stok tersedia: ' . $product->stock
            ]);
        }

        DB::transaction(function () use ($request, $sale, $product) {
            // Create borrowed product record
            BorrowedProduct::create([
                'sale_id' => $sale->id,
                'product_id' => $product->id,
                'borrowed_quantity' => $request->quantity,
                'sold_quantity' => 0,
                'status' => 'borrowed',
                'borrowed_date' => now(),
            ]);

            // Reduce warehouse stock
            $product->decrement('stock', $request->quantity);
        });

        return redirect()->route('sales.dashboard')->with('success', 'Produk berhasil dipinjam.');
    }

    /**
     * TODO:
     * Show the form for editing the specified resource.
     * untuk mengupdate jumlah stok 
     */
    public function edit(BorrowedProduct $product)
    {
        $sale = Sales::where('user_id', auth()->id())->firstOrFail();

        // Ensure the product belongs to the current sale
        if ($product->sale_id !== $sale->id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('sales/products/edit', [
            'product' => $product->load('product'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $request->validate([
            'borrowed_product_id' => 'required|exists:borrowed_products,id',
            'sold_quantity' => 'required|integer|min:0',
        ]);

        $sale = Sales::where('user_id', auth()->id())->firstOrFail();
        $borrowedProduct = BorrowedProduct::where('id', $request->borrowed_product_id)
            ->where('sale_id', $sale->id)
            ->firstOrFail();

        if ($request->sold_quantity > $borrowedProduct->current_stock) {
            return back()->withErrors([
                'sold_quantity' => 'Jumlah terjual melebihi stok yang tersedia. Stok tersedia: ' . $borrowedProduct->current_stock
            ]);
        }

        $borrowedProduct->update([
            'sold_quantity' => $borrowedProduct->sold_quantity + $request->sold_quantity,
        ]);

        // Update status if all products are sold
        if ($borrowedProduct->current_stock === 0) {
            $borrowedProduct->update([
                'status' => 'returned',
                'return_date' => now(),
            ]);
        }

        return redirect()->route('sales.dashboard')->with('success', 'Stok berhasil diupdate.');
    }

    /**
     * Display a listing of returned products (history).
     */
    public function old()
    {
        $sale = Sales::where('user_id', auth()->id())->firstOrFail();

        $returnedProducts = BorrowedProduct::with('product')
            ->where('sale_id', $sale->id)
            ->where('status', 'returned')
            ->orderBy('return_date', 'desc')
            ->get();

        return Inertia::render('sales/products/old', [
            'returnedProducts' => $returnedProducts,
        ]);
    }
}
