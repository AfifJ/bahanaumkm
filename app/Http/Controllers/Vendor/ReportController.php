<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Auth;
use DateInterval;
use DatePeriod;
use DateTime;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $vendorId = Auth::id();
        $month = $request->get('month');

        // Query untuk mendapatkan report penjualan per produk
        $query = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.vendor_id', $vendorId)
            ->whereIn('orders.status', ['paid', 'validation']);

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

            $monthDate = DateTime::createFromFormat('F Y', $englishMonth . ' ' . $year);
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

        $productReports = $query
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                'products.buy_price',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.unit_price * order_items.quantity) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.buy_price')
            ->get();


        $monthStart = date('Y-m', strtotime(Auth::user()->created_at));
        $currentMonth = date('Y-m');

        $availableMonths = [];
        $startDate = new DateTime($monthStart);
        $endDate = new DateTime($currentMonth);
        $endDate->modify('+1 month');

        $interval = DateInterval::createFromDateString('1 month');
        $period = new DatePeriod($startDate, $interval, $endDate);

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

        return Inertia::render('vendor/report/index', [
            'report' => $productReports,
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
    public function show(string $id)
    {
        //
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
