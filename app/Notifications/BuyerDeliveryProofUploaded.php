<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class BuyerDeliveryProofUploaded extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     */
    public function __construct($order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pesanan Telah Dikirim',
            'message' => "Bukti pengiriman untuk order #{$this->order->order_code} sudah tersedia. Silakan konfirmasi jika barang sudah sampai.",
            'order_id' => $this->order->id,
            'order_code' => $this->order->order_code,
            'type' => 'delivery_proof_uploaded',
            'url' => route('buyer.orders.show', $this->order->id),
        ];
    }
}
