<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Auth;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the vendor dashboard with statistics.
     */
    public function index(Request $request)
    {
        $vendorId = Auth::id();
        $month = $request->get('month');

        // Query dasar untuk mendapatkan order milik vendor dengan status delivered
        $query = Order::with(['items.product'])
            ->whereHas('items.product', function ($query) use ($vendorId) {
                $query->where('vendor_id', $vendorId);
            })
            ->whereIn('status', ['delivered']);

        // Filter by month jika ada
        if ($month) {
            // Convert Indonesian month to English for parsing
            $indonesianToEnglish = [
                'Januari' => 'January',
                'Februari' => 'February',
                'Maret' => 'March',
                'April' => 'April',
                'Mei' => 'May',
                'Juni' => 'June',
                'Juli' => 'July',
                'Agustus' => 'August',
                'September' => 'September',
                'Oktober' => 'October',
                'November' => 'November',
                'Desember' => 'December'
            ];

            $monthParts = explode(' ', $month);
            $indonesianMonth = $monthParts[0];
            $year = $monthParts[1];
            $englishMonth = $indonesianToEnglish[$indonesianMonth];

            $monthDate = \DateTime::createFromFormat('F Y', $englishMonth . ' ' . $year);
            $startDate = $monthDate->format('Y-m-01');
            $endDate = $monthDate->modify('+1 month')->format('Y-m-01');
            $query->where('orders.created_at', '>=', $startDate)->where('orders.created_at', '<', $endDate);
        } else {
            // Default to current month
            $currentMonth = date('Y-m');
            $startDate = $currentMonth . '-01';
            $endDate = date('Y-m-01', strtotime('+1 month'));
            $query->where('orders.created_at', '>=', $startDate)->where('orders.created_at', '<', $endDate);
        }

        // Get statistics
        $totalTransactions = $query->count();
        $totalRevenue = $query->sum('total_amount');

        // Get total products sold
        $totalProductsSoldQuery = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.vendor_id', $vendorId)
            ->whereIn('orders.status', ['delivered']);

        // Apply month filter if exists
        if ($month) {
            $indonesianToEnglish = [
                'Januari' => 'January', 'Februari' => 'February', 'Maret' => 'March',
                'April' => 'April', 'Mei' => 'May', 'Juni' => 'June', 'Juli' => 'July',
                'Agustus' => 'August', 'September' => 'September', 'Oktober' => 'October',
                'November' => 'November', 'Desember' => 'December'
            ];

            $monthParts = explode(' ', $month);
            $indonesianMonth = $monthParts[0];
            $year = $monthParts[1];
            $englishMonth = $indonesianToEnglish[$indonesianMonth];

            $monthDate = \DateTime::createFromFormat('F Y', $englishMonth . ' ' . $year);
            $startDate = $monthDate->format('Y-m-01');
            $endDate = $monthDate->modify('+1 month')->format('Y-m-01');
            $totalProductsSoldQuery->where('orders.created_at', '>=', $startDate)->where('orders.created_at', '<', $endDate);
        } else {
            $currentMonth = date('Y-m');
            $startDate = $currentMonth . '-01';
            $endDate = date('Y-m-01', strtotime('+1 month'));
            $totalProductsSoldQuery->where('orders.created_at', '>=', $startDate)->where('orders.created_at', '<', $endDate);
        }

        $totalProductsSold = $totalProductsSoldQuery->sum('order_items.quantity');

        // Get recent transactions (last 5)
        $recentTransactions = Order::with(['items.product'])
            ->whereHas('items.product', function ($query) use ($vendorId) {
                $query->where('vendor_id', $vendorId);
            })
            ->whereIn('status', ['delivered'])
            ->when($month, function ($query) use ($month) {
                // Apply same month filter as above
                $indonesianToEnglish = [
                    'Januari' => 'January', 'Februari' => 'February', 'Maret' => 'March',
                    'April' => 'April', 'Mei' => 'May', 'Juni' => 'June', 'Juli' => 'July',
                    'Agustus' => 'August', 'September' => 'September', 'Oktober' => 'October',
                    'November' => 'November', 'Desember' => 'December'
                ];

                $monthParts = explode(' ', $month);
                $indonesianMonth = $monthParts[0];
                $year = $monthParts[1];
                $englishMonth = $indonesianToEnglish[$indonesianMonth];

                $monthDate = \DateTime::createFromFormat('F Y', $englishMonth . ' ' . $year);
                $startDate = $monthDate->format('Y-m-01');
                $endDate = $monthDate->modify('+1 month')->format('Y-m-01');
                $query->where('orders.created_at', '>=', $startDate)->where('orders.created_at', '<', $endDate);
            }, function ($query) {
                // Default to current month
                $currentMonth = date('Y-m');
                $startDate = $currentMonth . '-01';
                $endDate = date('Y-m-01', strtotime('+1 month'));
                $query->where('orders.created_at', '>=', $startDate)->where('orders.created_at', '<', $endDate);
            })
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Prepare available months for filter
        $monthStart = date('Y-m', strtotime(Auth::user()->created_at));
        $currentMonth = date('Y-m');

        $availableMonths = [];
        $startDate = new \DateTime($monthStart);
        $endDate = new \DateTime($currentMonth);
        $endDate->modify('+1 month');

        $interval = \DateInterval::createFromDateString('1 month');
        $period = new \DatePeriod($startDate, $interval, $endDate);

        foreach ($period as $dt) {
            $englishMonth = $dt->format("F");
            $year = $dt->format("Y");

            $indonesianMonths = [
                'January' => 'Januari',
                'February' => 'Februari',
                'March' => 'Maret',
                'April' => 'April',
                'May' => 'Mei',
                'June' => 'Juni',
                'July' => 'Juli',
                'August' => 'Agustus',
                'September' => 'September',
                'October' => 'Oktober',
                'November' => 'November',
                'December' => 'Desember'
            ];

            $availableMonths[] = $indonesianMonths[$englishMonth] . ' ' . $year;
        }
        $availableMonths = array_reverse($availableMonths);

        $user = auth()->user()->load('role');

        return Inertia::render('vendor/dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ? $user->role->name : null,
                ]
            ],
            'statistics' => [
                'totalTransactions' => $totalTransactions,
                'totalRevenue' => $totalRevenue,
                'totalProductsSold' => $totalProductsSold,
            ],
            'recentTransactions' => $recentTransactions,
            'availableMonths' => $availableMonths,
            'month' => $month,
        ]);
    }
}