<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Notifications\AdminOrderOutForDelivery;
use App\Notifications\BuyerDeliveryProofUploaded;
use App\Notifications\AdminBuyerConfirmedDelivery;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'status' => 'required|in:pending,validation,paid,processed,out_for_delivery,delivered,payment_rejected,failed_delivery,cancelled,returned,refunded',
            'reject_reason' => 'required_if:status,payment_rejected|string|max:500',
            'delivery_notes' => 'required_if:status,failed_delivery,returned|string|max:500',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        // Define allowed status transitions
        $allowedTransitions = [
            'pending' => ['validation', 'cancelled'],
            'validation' => ['paid', 'payment_rejected', 'cancelled'],
            'paid' => ['processed', 'cancelled'],
            'processed' => ['out_for_delivery', 'cancelled'],
            'out_for_delivery' => ['delivered', 'failed_delivery'],
            'delivered' => ['returned'],
            'payment_rejected' => ['validation', 'cancelled'],
            'failed_delivery' => ['out_for_delivery', 'cancelled'],
            'returned' => ['refunded'],
            'refunded' => [],
            'cancelled' => [],
        ];

        // Check if the transition is allowed
        if (!in_array($newStatus, $allowedTransitions[$oldStatus])) {
            return back()->with('error', 'Tidak dapat mengubah status dari ' . $oldStatus . ' ke ' . $newStatus);
        }

        // Special validation: Cannot change to "delivered" without delivery proof
        if ($newStatus === 'delivered' && $oldStatus === 'out_for_delivery' && !$order->delivery_proof) {
            return back()->with('error', 'Harap upload bukti pengiriman terlebih dahulu sebelum mengubah status menjadi "Telah Sampai"');
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

        // Add reason fields if provided
        if ($request->has('reject_reason')) {
            $updateData['reject_reason'] = $request->reject_reason;
        }
        if ($request->has('delivery_notes')) {
            $updateData['delivery_notes'] = $request->delivery_notes;
        }

        // Set timestamps when status changes
        if ($newStatus === 'paid' && $oldStatus !== 'paid') {
            $updateData['paid_at'] = now();
        }
        if ($newStatus === 'processed' && $oldStatus !== 'processed') {
            $updateData['processed_at'] = now();

            // Auto-notify admin users when order is processed (ready for shipping)
            $adminUsers = User::whereHas('role', function ($query) {
                $query->where('name', 'Admin');
            })->get();

            foreach ($adminUsers as $admin) {
                $admin->notify(new AdminOrderOutForDelivery($order));
            }
        }
                if ($newStatus === 'out_for_delivery' && $oldStatus !== 'out_for_delivery') {
            $updateData['out_for_delivery_at'] = now();
        }
        if ($newStatus === 'delivered' && $oldStatus !== 'delivered') {
            $updateData['delivered_at'] = now();
        }
        if ($newStatus === 'payment_rejected' && $oldStatus !== 'payment_rejected') {
            $updateData['payment_rejected_at'] = now();
        }
        if ($newStatus === 'failed_delivery' && $oldStatus !== 'failed_delivery') {
            $updateData['failed_delivery_at'] = now();
        }
        if ($newStatus === 'returned' && $oldStatus !== 'returned') {
            $updateData['returned_at'] = now();

            // Restore stock when order is returned
            $order->load('items.product');
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->quantity);
                }
            }
        }
        if ($newStatus === 'refunded' && $oldStatus !== 'refunded') {
            $updateData['refunded_at'] = now();
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
     * Upload delivery proof and mark order as delivered
     */
    public function uploadDeliveryProof(Request $request, Order $order)
    {
        $request->validate([
            'delivery_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ]);

        // Only allow upload for out_for_delivery orders (sedang di jalan)
        if ($order->status !== 'out_for_delivery') {
            return back()->with('error', 'Bukti pengiriman hanya bisa diupload untuk order yang sedang dalam perjalanan');
        }

        // Handle file upload
        if ($request->hasFile('delivery_proof')) {
            $file = $request->file('delivery_proof');
            $path = $file->store('delivery-proofs', 'public');

            // Update order with delivery proof only (don't auto-change status)
            $order->update([
                'delivery_proof' => $path,
                'delivery_proof_uploaded_at' => now(),
            ]);

            // Notify buyer that delivery proof is uploaded
            if ($order->buyer) {
                $order->buyer->notify(new BuyerDeliveryProofUploaded($order));
            }

            return back()->with('success', 'Bukti pengiriman berhasil diupload. Sekarang Anda dapat mengubah status menjadi "Telah Sampai".');
        }

        return back()->with('error', 'Gagal mengupload bukti pengiriman');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
