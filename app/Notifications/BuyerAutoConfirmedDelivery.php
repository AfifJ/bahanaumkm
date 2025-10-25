<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class BuyerAutoConfirmedDelivery extends Notification implements ShouldQueue
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
            'title' => 'Pesanan Otomatis Dikonfirmasi',
            'message' => "Order #{$this->order->order_code} otomatis dikonfirmasi terkirim karena lebih dari 24 jam.",
            'order_id' => $this->order->id,
            'order_code' => $this->order->order_code,
            'type' => 'auto_confirmed_delivery',
            'url' => route('buyer.orders.show', $this->order->id),
        ];
    }
}
