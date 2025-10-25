<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AdminOrderOutForDelivery extends Notification implements ShouldQueue
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
            'title' => 'Pesanan Sedang Diantar',
            'message' => "Order #{$this->order->order_code} sedang dalam perjalanan ke {$this->order->mitra->hotel_name}",
            'order_id' => $this->order->id,
            'order_code' => $this->order->order_code,
            'type' => 'order_out_for_delivery',
            'url' => route('admin.orders.show', $this->order->id),
        ];
    }
}
