<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\BorrowedProduct;
use Inertia\Inertia;

class BorrowedProductController extends Controller
{
    /**
     * Display the borrowed products currently assigned to the sales user.
     */
    public function index()
    {
        $user = auth()->user();

        $borrowedProducts = BorrowedProduct::with([
            'product.primaryImage',
            'product.category',
            'sku'
        ])
            ->where('sale_id', $user->id)
            ->where('status', 'borrowed')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($borrowedProduct) {
                return [
                    'id' => $borrowedProduct->id,
                    'borrowed_quantity' => $borrowedProduct->borrowed_quantity,
                    'sold_quantity' => $borrowedProduct->sold_quantity,
                    'current_stock' => $borrowedProduct->current_stock,
                    'status' => $borrowedProduct->status,
                    'borrowed_date' => $borrowedProduct->borrowed_date,
                    'return_date' => $borrowedProduct->return_date,
                    'product' => [
                        'id' => $borrowedProduct->product->id,
                        'name' => $borrowedProduct->product->name,
                        'category' => $borrowedProduct->product->category->name ?? 'Uncategorized',
                        'image_url' => $borrowedProduct->product->primaryImage->url ?? $borrowedProduct->product->image_url ?? null,
                        'sell_price' => $borrowedProduct->product->sell_price,
                        'has_variations' => $borrowedProduct->product->has_variations,
                    ],
                    'sku' => $borrowedProduct->sku ? [
                        'id' => $borrowedProduct->sku->id,
                        'sku_code' => $borrowedProduct->sku->sku_code,
                        'variant_name' => $borrowedProduct->sku->variant_name,
                        'price' => $borrowedProduct->sku->price,
                    ] : null,
                ];
            });

        return Inertia::render('sales/products/index', [
            'borrowedProducts' => $borrowedProducts,
        ]);
    }

    /**
     * Display a listing of returned products (history).
     */
    public function old()
    {
        $user = auth()->user();

        $returnedProducts = BorrowedProduct::with([
            'product.primaryImage',
            'product.category',
            'sku'
        ])
            ->where('sale_id', $user->id)
            ->where('status', 'returned')
            ->orderBy('return_date', 'desc')
            ->get()
            ->map(function ($borrowedProduct) {
                return [
                    'id' => $borrowedProduct->id,
                    'borrowed_quantity' => $borrowedProduct->borrowed_quantity,
                    'sold_quantity' => $borrowedProduct->sold_quantity,
                    'current_stock' => $borrowedProduct->current_stock,
                    'status' => $borrowedProduct->status,
                    'borrowed_date' => $borrowedProduct->borrowed_date,
                    'return_date' => $borrowedProduct->return_date,
                    'product' => [
                        'id' => $borrowedProduct->product->id,
                        'name' => $borrowedProduct->product->name,
                        'category' => $borrowedProduct->product->category->name ?? 'Uncategorized',
                        'image_url' => $borrowedProduct->product->primaryImage->url ?? $borrowedProduct->product->image_url ?? null,
                        'sell_price' => $borrowedProduct->product->sell_price,
                        'has_variations' => $borrowedProduct->product->has_variations,
                    ],
                    'sku' => $borrowedProduct->sku ? [
                        'id' => $borrowedProduct->sku->id,
                        'sku_code' => $borrowedProduct->sku->sku_code,
                        'variant_name' => $borrowedProduct->sku->variant_name,
                        'price' => $borrowedProduct->sku->price,
                    ] : null,
                ];
            });

        return Inertia::render('sales/products/old', [
            'returnedProducts' => $returnedProducts,
        ]);
    }
}
