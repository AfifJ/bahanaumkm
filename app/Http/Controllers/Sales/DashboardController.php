<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BorrowedProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $borrowedProducts = BorrowedProduct::with('product')
            ->where('sale_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $salesStats = [
            'total_borrowed' => $borrowedProducts->sum('borrowed_quantity'),
            'total_sold' => $borrowedProducts->sum('sold_quantity'),
            'current_stock' => $borrowedProducts->sum('borrowed_quantity') - $borrowedProducts->sum('sold_quantity'),
            'active_products' => $borrowedProducts->where('status', 'borrowed')->count(),
        ];

        return Inertia::render('sales/dashboard', [
            'borrowedProducts' => $borrowedProducts,
            'salesStats' => $salesStats,
        ]);
    }

    public function reports()
    {
        $user = auth()->user();

        $borrowedProducts = BorrowedProduct::with('product')
            ->where('sale_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('sales/reports', [
            'borrowedProducts' => $borrowedProducts,
        ]);
    }

    public function transactions()
    {
        return Inertia::render('sales/transactions/index');
    }
}
