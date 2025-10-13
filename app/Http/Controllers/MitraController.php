<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MitraProfile;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MitraController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        $mitraProfile = $user->mitraProfile;

        if (!$mitraProfile) {
            return redirect()->route('mitra.profile')
                ->with('error', 'Please complete your profile first.');
        }

        // Get today's sales
        $todaySales = Order::where('mitra_id', $mitraProfile->id)
            ->whereDate('created_at', today())
            ->with('items.product')
            ->get();

        // Get month's sales
        $monthSales = Order::where('mitra_id', $mitraProfile->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->with('items.product')
            ->get();

        // Calculate commissions
        $todayCommission = $this->calculateCommission($todaySales);
        $monthCommission = $this->calculateCommission($monthSales);
        $totalCommission = $this->calculateCommission(
            Order::where('mitra_id', $mitraProfile->id)->with('items.product')->get()
        );

        // Get recent transactions
        $recentTransactions = Order::where('mitra_id', $mitraProfile->id)
            ->with(['items.product'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_code' => $order->order_code,
                    'customer_name' => 'Customer ' . substr($order->order_code, -6),
                    'total_amount' => $order->total_amount,
                    'commission' => $this->calculateOrderCommission($order),
                    'status' => $order->status,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Sales data for chart (last 7 days)
        $salesChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $daySales = Order::where('mitra_id', $mitraProfile->id)
                ->whereDate('created_at', $date)
                ->with('items.product')
                ->get();

            $salesChart[] = [
                'date' => $date,
                'sales' => $daySales->sum('total_amount'),
                'commission' => $this->calculateCommission($daySales),
            ];
        }

        return Inertia::render('mitra/dashboard', [
            'mitraProfile' => $mitraProfile,
            'stats' => [
                'today_sales' => $todaySales->sum('total_amount'),
                'today_commission' => $todayCommission,
                'month_sales' => $monthSales->sum('total_amount'),
                'month_commission' => $monthCommission,
                'total_commission' => $totalCommission,
                'total_orders' => Order::where('mitra_id', $mitraProfile->id)->count(),
            ],
            'recentTransactions' => $recentTransactions,
            'salesChart' => $salesChart,
        ]);
    }

    public function transactions()
    {
        $user = Auth::user();
        $mitraProfile = $user->mitraProfile;

        if (!$mitraProfile) {
            return redirect()->route('mitra.profile')
                ->with('error', 'Please complete your profile first.');
        }

        $transactions = Order::where('mitra_id', $mitraProfile->id)
            ->with(['items.product'])
            ->latest()
            ->paginate(15)
            ->through(function ($order) {
                return [
                    'id' => $order->id,
                    'order_code' => $order->order_code,
                    'customer_name' => 'Customer ' . substr($order->order_code, -6),
                    'total_amount' => $order->total_amount,
                    'commission' => $this->calculateOrderCommission($order),
                    'status' => $order->status,
                    'items_count' => $order->items->count(),
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('mitra/transactions/index', [
            'transactions' => $transactions,
        ]);
    }

    public function reports()
    {
        $user = Auth::user();
        $mitraProfile = $user->mitraProfile;

        if (!$mitraProfile) {
            return redirect()->route('mitra.profile')
                ->with('error', 'Please complete your profile first.');
        }

        // Get detailed order items with commission breakdown
        $orderItems = OrderItem::whereHas('order', function ($query) use ($mitraProfile) {
            $query->where('mitra_id', $mitraProfile->id);
        })
        ->with(['order', 'product'])
        ->latest()
        ->paginate(20)
        ->through(function ($item) {
            $commission = ($item->unit_price - $item->buy_price) * 0.25 * $item->quantity;

            return [
                'id' => $item->id,
                'order_code' => $item->order->order_code,
                'product_name' => $item->product->name,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'buy_price' => $item->buy_price,
                'margin' => $item->unit_price - $item->buy_price,
                'commission' => $commission,
                'created_at' => $item->created_at->format('Y-m-d H:i:s'),
            ];
        });

        // Summary statistics
        $totalOrders = Order::where('mitra_id', $mitraProfile->id)->count();
        $totalRevenue = Order::where('mitra_id', $mitraProfile->id)->sum('total_amount');
        $totalCommission = $this->calculateCommission(
            Order::where('mitra_id', $mitraProfile->id)->with('items.product')->get()
        );

        return Inertia::render('mitra/reports/index', [
            'orderItems' => $orderItems,
            'summary' => [
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'total_commission' => $totalCommission,
            ],
        ]);
    }

    public function profile()
    {
        $user = Auth::user();
        $mitraProfile = $user->mitraProfile;

        if (!$mitraProfile) {
            $mitraProfile = MitraProfile::create([
                'user_id' => $user->id,
                'hotel_name' => '',
                'address' => '',
                'city' => '',
                'phone' => $user->phone ?? '',
                'unique_code' => 'MITRA-' . strtoupper(substr(uniqid(), -6)),
            ]);
        }

        return Inertia::render('mitra/profile/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'mitraProfile' => $mitraProfile,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'hotel_name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
        ]);

        $user = Auth::user();

        $user->update([
            'phone' => $request->phone,
        ]);

        $mitraProfile = $user->mitraProfile;
        $mitraProfile->update([
            'hotel_name' => $request->hotel_name,
            'address' => $request->address,
            'city' => $request->city,
            'phone' => $request->phone,
        ]);

        return back()->with('success', 'Profile updated successfully.');
    }

    private function calculateCommission($orders)
    {
        $totalCommission = 0;

        foreach ($orders as $order) {
            $totalCommission += $this->calculateOrderCommission($order);
        }

        return $totalCommission;
    }

    private function calculateOrderCommission($order)
    {
        $commission = 0;

        foreach ($order->items as $item) {
            $commission += ($item->unit_price - $item->buy_price) * 0.25 * $item->quantity;
        }

        return $commission;
    }
}