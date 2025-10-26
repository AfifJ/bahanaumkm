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

        // Get today's sales (only completed orders)
        $todaySales = Order::where('mitra_id', $mitraProfile->id)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereDate('created_at', today())
            ->with('items.product')
            ->get();

        // Get month's sales (only completed orders)
        $monthSales = Order::where('mitra_id', $mitraProfile->id)
            ->where('status', Order::STATUS_COMPLETED)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->with('items.product')
            ->get();

        // Calculate commissions (only completed orders)
        $todayCommission = $this->calculateCommission($todaySales);
        $monthCommission = $this->calculateCommission($monthSales);
        $totalCommission = $this->calculateCommission(
            Order::where('mitra_id', $mitraProfile->id)
                ->where('status', Order::STATUS_COMPLETED)
                ->with('items.product')
                ->get()
        );

        // Get recent transactions (only completed orders)
        $recentTransactions = Order::where('mitra_id', $mitraProfile->id)
            ->where('status', Order::STATUS_COMPLETED)
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

        // Sales data for chart (last 7 days, only completed orders)
        $salesChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $daySales = Order::where('mitra_id', $mitraProfile->id)
                ->where('status', Order::STATUS_COMPLETED)
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
                'total_orders' => Order::where('mitra_id', $mitraProfile->id)->where('status', Order::STATUS_COMPLETED)->count(),
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
            ->where('status', Order::STATUS_COMPLETED)
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

        // Get detailed order items (only from completed orders)
        $orderItems = OrderItem::whereHas('order', function ($query) use ($mitraProfile) {
            $query->where('mitra_id', $mitraProfile->id)
                  ->where('status', Order::STATUS_COMPLETED);
        })
        ->with(['order', 'product', 'sku'])
        ->latest()
        ->paginate(20)
        ->through(function ($item) {
            // Calculate commission per item using stored buy_price
            $commissionRate = \App\Models\Setting::getValue('mitra_commission', 25) / 100;
            $itemCommission = ($item->unit_price - $item->buy_price) * $commissionRate * $item->quantity;

            // Ensure commission is not negative
            $itemCommission = max(0, $itemCommission);

            // Format product name with variation if exists
            $productName = $item->product->name;
            if ($item->sku_id && $item->sku) {
                $productName .= ' (' . $item->sku->variant_name . ')';
            }

            return [
                'id' => $item->id,
                'product_name' => $productName,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'commission' => $itemCommission,
            ];
        });

        // Summary statistics (only completed orders)
        $totalOrders = Order::where('mitra_id', $mitraProfile->id)
                           ->where('status', Order::STATUS_COMPLETED)
                           ->count();
        $totalRevenue = Order::where('mitra_id', $mitraProfile->id)
                            ->where('status', Order::STATUS_COMPLETED)
                            ->sum('total_amount');
        $totalCommission = $this->calculateCommission(
            Order::where('mitra_id', $mitraProfile->id)
                ->where('status', Order::STATUS_COMPLETED)
                ->with('items.product')
                ->get()
        );

        return Inertia::render('mitra/reports/index', [
            'orderItems' => $orderItems,
            'summary' => [
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
            'phone' => $request->phone,
        ]);

        return back()->with('success', 'Profil berhasil diperbarui.');
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
        // Get mitra commission rate from settings
        $commissionRate = \App\Models\Setting::getValue('mitra_commission', 25) / 100;

        foreach ($order->items as $item) {
            // Use stored buy_price from order_items table
            $itemCommission = ($item->unit_price - $item->buy_price) * $commissionRate * $item->quantity;

            // Ensure commission is not negative
            $itemCommission = max(0, $itemCommission);

            $commission += $itemCommission;
        }

        return $commission;
    }
}