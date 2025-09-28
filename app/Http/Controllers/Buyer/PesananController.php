<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PesananController extends Controller
{
    public function index()
    {
        $orders = Order::with(['items.product', 'mitra'])
            ->where('buyer_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('buyer/profile/pesanan/index', [
            'orders' => $orders,
        ]);
    }

}
