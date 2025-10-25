<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AdminBuyerConfirmedDelivery extends Notification implements ShouldQueue
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
            'title' => 'Pesanan Dikonfirmasi Sampai',
            'message' => "Buyer telah mengkonfirmasi order #{$this->order->order_code} sudah sampai.",
            'order_id' => $this->order->id,
            'order_code' => $this->order->order_code,
            'type' => 'buyer_confirmed_delivery',
            'url' => route('admin.orders.show', $this->order->id),
        ];
    }
}
