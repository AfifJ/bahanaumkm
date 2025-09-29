<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $month = $request->get('month');

        $query = Order::with(['items.product', 'mitra'])
            ->orderBy('created_at', 'desc');

        // Filter by month if provided
        if ($month) {
            $query->whereMonth('created_at', $month);
        }

        $orders = $query->paginate(10);

        // Get available months for transactions
        $availableMonths = Order::select(DB::raw('DISTINCT DATE_FORMAT(created_at, "%Y-%m") as month_year'))
            ->orderBy('month_year', 'desc')
            ->pluck('month_year');

        return Inertia::render('admin/transaction/index', [
            'orders' => $orders,
            'availableMonths' => $availableMonths,
            'month' => $month,
        ]);
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
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['items.product.vendor', 'mitra',]);



        // dd($order);

        return Inertia::render('admin/transaction/show', [
            'order' => $order,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
