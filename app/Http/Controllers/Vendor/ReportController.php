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

        // Get product-level reports
        $productReports = $query
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                'products.buy_price',
                'products.has_variations',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.unit_price * order_items.quantity) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.buy_price', 'products.has_variations')
            ->get();

        // Get SKU-level reports for products with variations
        $skuReports = collect();
        if ($productReports->where('has_variations', true)->isNotEmpty()) {
            $skuReports = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->leftJoin('product_skus', 'order_items.sku_id', '=', 'product_skus.id')
                ->where('products.vendor_id', $vendorId)
                ->where('products.has_variations', true)
                ->whereIn('orders.status', ['paid', 'validation'])
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

                    $monthDate = DateTime::createFromFormat('F Y', $englishMonth . ' ' . $year);
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
                ->select(
                    'products.id as product_id',
                    'products.name as product_name',
                    'product_skus.id as sku_id',
                    'product_skus.sku_code',
                    'product_skus.price as sku_price',
                    'order_items.variation_summary',
                    DB::raw('SUM(order_items.quantity) as total_quantity'),
                    DB::raw('SUM(order_items.unit_price * order_items.quantity) as total_revenue')
                )
                ->groupBy(
                    'products.id', 'products.name', 'product_skus.id', 'product_skus.sku_code',
                    'product_skus.price', 'order_items.variation_summary'
                )
                ->get()
                ->groupBy('product_id');
        }


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
            'skuReports' => $skuReports,
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
