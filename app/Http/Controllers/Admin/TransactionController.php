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
        $search = $request->get('search');

        // $query = Order::with(['items.product', 'mitra'])
        $query = Order::with(['items.product', 'mitra', 'buyer'])
            ->orderBy('created_at', 'desc');

        // Search by order code (search across all months)
        if ($search) {
            $query->where('order_code', 'like', '%' . $search . '%');
        } else {
            // Only apply month filter if not searching
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
                $query->where('created_at', '>=', $startDate)->where('created_at', '<', $endDate);
            } else {
                // Default to current month
                $currentMonth = date('Y-m');
                $startDate = $currentMonth . '-01';
                $endDate = date('Y-m-01', strtotime('+1 month'));
                $query->where('created_at', '>=', $startDate)->where('created_at', '<', $endDate);
            }
        }

        $orders = $query->paginate(10);

        // Generate available months similar to vendor controller
        $monthStart = date('Y-m', strtotime('-6 months')); // Last 6 months
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

        return Inertia::render('admin/transaction/index', [
            'orders' => $orders,
            'availableMonths' => $availableMonths,
            'month' => $month,
            'search' => $search,
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
        $order->load(['items.product.vendor', 'mitra', 'buyer']);



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
    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,validation,paid,processed,shipped,delivered,cancelled',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        // Define allowed status transitions
        $allowedTransitions = [
            'pending' => ['validation', 'cancelled'],
            'validation' => ['paid', 'cancelled'],
            'paid' => ['processed', 'cancelled'],
            'processed' => ['shipped', 'cancelled'],
            'shipped' => ['delivered'],
            'delivered' => [],
            'cancelled' => [],
        ];

        // Check if the transition is allowed
        if (!in_array($newStatus, $allowedTransitions[$oldStatus])) {
            return back()->with('error', 'Tidak dapat mengubah status dari ' . $oldStatus . ' ke ' . $newStatus);
        }

        // Handle cancellation - restore stock
        if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
            $order->load('items.product');

            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->quantity);
                }
            }
        }

        // Update order status
        $updateData = ['status' => $newStatus];

        // Set timestamps when status changes
        if ($newStatus === 'paid' && $oldStatus !== 'paid') {
            $updateData['paid_at'] = now();
        }
        if ($newStatus === 'processed' && $oldStatus !== 'processed') {
            $updateData['processed_at'] = now();
        }
        if ($newStatus === 'shipped' && $oldStatus !== 'shipped') {
            $updateData['shipped_at'] = now();
        }
        if ($newStatus === 'delivered' && $oldStatus !== 'delivered') {
            $updateData['delivered_at'] = now();
        }

        $order->update($updateData);

        return back()->with('success', 'Status pesanan berhasil diubah dari ' . $oldStatus . ' ke ' . $newStatus);
    }

    /**
     * Bulk update multiple transactions.
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array',
            'order_ids.*' => 'exists:orders,id',
            'action' => 'required|in:approve,reject',
        ]);

        $orderIds = $request->order_ids;
        $action = $request->action;
        $updatedCount = 0;

        DB::transaction(function () use ($orderIds, $action, &$updatedCount) {
            $orders = Order::whereIn('id', $orderIds)->get();

            foreach ($orders as $order) {
                if ($action === 'approve' && $order->status === 'validation') {
                    $order->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);
                    $updatedCount++;
                } elseif ($action === 'reject' && in_array($order->status, ['pending', 'validation'])) {
                    $order->update([
                        'status' => 'rejected',
                    ]);
                    $updatedCount++;
                }
            }
        });

        $message = $action === 'approve'
            ? "Berhasil memvalidasi {$updatedCount} transaksi"
            : "Berhasil menolak {$updatedCount} transaksi";

        return back()->with('success', $message);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
