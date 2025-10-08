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

        $borrowedProducts = BorrowedProduct::with('product')
            ->where('sale_id', $user->id)
            ->where('status', 'borrowed')
            ->orderBy('created_at', 'desc')
            ->get();

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

        $returnedProducts = BorrowedProduct::with('product')
            ->where('sale_id', $user->id)
            ->where('status', 'returned')
            ->orderBy('return_date', 'desc')
            ->get();

        return Inertia::render('sales/products/old', [
            'returnedProducts' => $returnedProducts,
        ]);
    }
}
