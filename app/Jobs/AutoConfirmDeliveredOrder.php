<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\User;
use App\Notifications\BuyerAutoConfirmedDelivery;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class AutoConfirmDeliveredOrder implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Running auto-confirm delivered orders job');

        // Cari order yang sudah 24 jam sejak delivery proof diupload
        // tapi belum ada konfirmasi dari buyer
        $deliveredOrders = Order::where('status', 'delivered')
            ->whereNotNull('delivery_proof')
            ->whereNull('delivered_confirmed_at')
            ->where('delivery_proof_uploaded_at', '<=', now()->subDay())
            ->with(['buyer'])
            ->get();

        foreach ($deliveredOrders as $order) {
            try {
                // Update order status
                $order->update([
                    'status' => 'delivered',
                    'delivered_at' => now(),
                    'delivered_confirmed_at' => now(),
                    'auto_delivered_at' => now(),
                ]);

                // Kirim notifikasi ke buyer
                if ($order->buyer) {
                    $order->buyer->notify(new BuyerAutoConfirmedDelivery($order));
                }

                Log::info("Order #{$order->order_code} auto-confirmed as delivered", [
                    'order_id' => $order->id,
                    'buyer_id' => $order->buyer_id,
                    'auto_confirmed_at' => now(),
                ]);

            } catch (\Exception $e) {
                Log::error("Failed to auto-confirm order #{$order->order_code}", [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info("Auto-confirm job completed. Processed {$deliveredOrders->count()} orders.");
    }
}
