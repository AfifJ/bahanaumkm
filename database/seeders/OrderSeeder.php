<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get buyer and vendor users
        $buyer = User::where('role_id', 5)->first(); // Buyer role
        $vendor = User::where('role_id', 3)->first(); // Vendor role

        if (!$buyer || !$vendor) {
            $this->command->info('Buyer or vendor users not found. Please run UserSeeder first.');
            return;
        }

        // Get some products
        $products = Product::where('vendor_id', $vendor->id)->take(3)->get();

        if ($products->isEmpty()) {
            $this->command->info('No products found for vendor. Please run ProductSeeder first.');
            return;
        }

        // Create sample orders
        $orders = [
            [
                'status' => 'pending',
                'items' => [
                    ['product_id' => $products[0]->id, 'quantity' => 2],
                ]
            ],
            [
                'status' => 'paid',
                'items' => [
                    ['product_id' => $products[1]->id, 'quantity' => 1],
                    ['product_id' => $products[2]->id, 'quantity' => 3],
                ]
            ],
            [
                'status' => 'delivered',
                'items' => [
                    ['product_id' => $products[0]->id, 'quantity' => 1],
                ]
            ],
            [
                'status' => 'cancelled',
                'items' => [
                    ['product_id' => $products[1]->id, 'quantity' => 2],
                ]
            ],
        ];

        foreach ($orders as $orderData) {
            $totalAmount = 0;
            $items = [];

            // Calculate total amount
            foreach ($orderData['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                $unitPrice = $product->sell_price;
                $itemTotal = $unitPrice * $itemData['quantity'];
                $totalAmount += $itemTotal;

                $items[] = [
                    'product_id' => $product->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                ];
            }

            // Calculate commission (10%)
            $commission = $totalAmount * 0.10;

            // Create order
            $order = Order::create([
                'buyer_id' => $buyer->id,
                'partner_id' => $vendor->id,
                'total_amount' => $totalAmount,
                'partner_commission' => $commission,
                'status' => $orderData['status'],
            ]);

            // Create order items
            foreach ($items as $item) {
                $order->items()->create($item);
            }

            $this->command->info("Created order #{$order->order_code} with status: {$order->status}");
        }

        $this->command->info('Order seeder completed successfully!');
    }
}
