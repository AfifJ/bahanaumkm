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

        // Get date range from request (default to last 30 days)
        $startDate = request()->get('start_date', now()->subDays(30)->startOfDay());
        $endDate = request()->get('end_date', now()->endOfDay());

        // Get orders for this sales person
        $orders = \App\Models\Order::where('sale_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with(['items.product', 'buyer'])
            ->get();

        // Calculate sales metrics
        $totalRevenue = $orders->sum('total_amount');
        $totalCommission = $orders->sum(function ($order) {
            return $order->total_amount * 0.1; // 10% commission
        });
        $totalOrders = $orders->count();
        $totalItems = $orders->sum(function ($order) {
            return $order->items->sum('quantity');
        });

        // Get daily sales data for chart
        $dailySales = $orders
            ->groupBy(function ($order) {
                return $order->created_at->format('Y-m-d');
            })
            ->map(function ($dayOrders) {
                return [
                    'date' => $dayOrders->first()->created_at->format('Y-m-d'),
                    'revenue' => $dayOrders->sum('total_amount'),
                    'orders' => $dayOrders->count(),
                    'commission' => $dayOrders->sum(function ($order) {
                        return $order->total_amount * 0.1;
                    }),
                ];
            })
            ->values()
            ->sortBy('date');

        // Get top products
        $topProducts = $orders
            ->flatMap(function ($order) {
                return $order->items;
            })
            ->groupBy('product.name')
            ->map(function ($items, $productName) {
                return [
                    'name' => $productName,
                    'quantity' => $items->sum('quantity'),
                    'revenue' => $items->sum('total_price'),
                ];
            })
            ->sortByDesc('revenue')
            ->take(10)
            ->values();

        // Get monthly trends
        $monthlyTrends = $orders
            ->groupBy(function ($order) {
                return $order->created_at->format('Y-m');
            })
            ->map(function ($monthOrders) {
                return [
                    'month' => $monthOrders->first()->created_at->format('M Y'),
                    'revenue' => $monthOrders->sum('total_amount'),
                    'orders' => $monthOrders->count(),
                ];
            })
            ->sortBy('month')
            ->values();

        // Get borrowed products for inventory reports
        $borrowedProducts = BorrowedProduct::with('product')
            ->where('sale_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $inventoryStats = [
            'total_borrowed' => $borrowedProducts->sum('borrowed_quantity'),
            'total_sold' => $borrowedProducts->sum('sold_quantity'),
            'current_stock' => $borrowedProducts->sum('borrowed_quantity') - $borrowedProducts->sum('sold_quantity'),
            'active_products' => $borrowedProducts->where('status', 'borrowed')->count(),
        ];

        return Inertia::render('sales/reports', [
            'summary' => [
                'totalRevenue' => $totalRevenue,
                'totalCommission' => $totalCommission,
                'totalOrders' => $totalOrders,
                'totalItems' => $totalItems,
                'averageOrderValue' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
                'commissionRate' => 10, // 10%
            ],
            'dailySales' => $dailySales,
            'topProducts' => $topProducts,
            'monthlyTrends' => $monthlyTrends,
            'borrowedProducts' => $borrowedProducts,
            'inventoryStats' => $inventoryStats,
            'filters' => [
                'startDate' => $startDate->format('Y-m-d'),
                'endDate' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    public function exportReports(Request $request)
    {
        $user = auth()->user();

        // Get date range from request
        $startDate = $request->get('start_date', now()->subDays(30)->startOfDay());
        $endDate = $request->get('end_date', now()->endOfDay());
        $format = $request->get('format', 'csv'); // csv or excel

        // Get orders data
        $orders = \App\Models\Order::where('sale_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with(['items.product', 'buyer'])
            ->get();

        // Prepare data for export
        $exportData = [];
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $exportData[] = [
                    'Order ID' => 'TRX-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                    'Tanggal' => $order->created_at->format('Y-m-d H:i:s'),
                    'Produk' => $item->product->name,
                    'Quantity' => $item->quantity,
                    'Harga Satuan' => $item->unit_price,
                    'Total Harga' => $item->total_price,
                    'Komisi (10%)' => $item->total_price * 0.1,
                    'Pembeli' => $order->buyer->name ?? 'Guest',
                    'Status' => $order->status,
                ];
            }
        }

        // Create filename
        $filename = 'sales_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d');

        if ($format === 'csv') {
            return $this->exportCSV($exportData, $filename);
        } elseif ($format === 'excel') {
            return $this->exportExcel($exportData, $filename);
        }

        return redirect()->back()->with('error', 'Format export tidak valid');
    }

    private function exportCSV($data, $filename)
    {
        $headers = array_keys($data[0] ?? []);

        $callback = function() use ($data, $headers) {
            $file = fopen('php://output', 'w');

            // Add UTF-8 BOM for proper Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Add headers
            fputcsv($file, $headers);

            // Add data
            foreach ($data as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.csv"',
        ]);
    }

    private function exportExcel($data, $filename)
    {
        // For Excel export, you would typically use a library like Laravel Excel
        // For now, we'll return CSV as a fallback
        return $this->exportCSV($data, $filename);
    }

    public function transactions()
    {
        return Inertia::render('sales/transactions/index');
    }
}
