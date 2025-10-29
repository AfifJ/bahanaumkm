<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Get statistics for dashboard
        $stats = [
            'totalRevenue' => Order::where('status', 'delivered')->sum('total_amount'),
            'totalOrders' => Order::count(),
            'totalProducts' => Product::count(),
            'activeProducts' => Product::where('status', 'active')->where('stock', '>', 0)->count(),
            'totalUsers' => User::count(),
            'newUsersToday' => User::whereDate('created_at', \Carbon\Carbon::today())->count(),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'pendingValidations' => Order::where('status', 'validation')->count(),
        ];

        // Get order status distribution
        $orderStatuses = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            });

        // Get sales data for the last 6 months
        $salesData = Order::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->where('status', 'delivered')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Get recent orders
        $recentOrders = Order::with(['items.product', 'mitra'])
            ->latest()
            ->take(5)
            ->get();

        // Get low stock products
        $lowStockProducts = Product::where('stock', '<=', 5)
            ->where('stock', '>', 0)
            ->where('status', 'active')
            ->take(5)
            ->get();

        // Get top selling categories
        $topCategories = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->where('orders.status', 'delivered')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('total_sold', 'desc')
            ->take(5)
            ->get();

        // Get user distribution by role
        $userDistribution = User::join('roles', 'users.role_id', '=', 'roles.id')
            ->select('roles.name as role', DB::raw('COUNT(*) as count'))
            ->groupBy('roles.id', 'roles.name')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->role => $item->count];
            });

        // Get authenticated user data
        $user = auth()->user()->load('role');

        return inertia('admin/dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ? $user->role->name : null,
                ]
            ],
            'stats' => $stats,
            'orderStatuses' => $orderStatuses,
            'salesData' => $salesData,
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
            'topCategories' => $topCategories,
            'userDistribution' => $userDistribution,
        ]);
    }
}
