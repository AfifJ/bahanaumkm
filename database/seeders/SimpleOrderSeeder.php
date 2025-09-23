<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SimpleOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a buyer user if not exists
        $buyer = User::firstOrCreate(
            ['email' => 'buyer@example.com'],
            [
                'name' => 'Test Buyer',
                'password' => bcrypt('password'),
                'role_id' => 5, // Buyer role
                'status' => 'active'
            ]
        );

        // Create a vendor user if not exists
        $vendor = User::firstOrCreate(
            ['email' => 'vendor@example.com'],
            [
                'name' => 'Test Vendor',
                'password' => bcrypt('password'),
                'role_id' => 3, // Vendor role
                'status' => 'active'
            ]
        );

        // Create sample products if not exists
        $products = [];
        for ($i = 1; $i <= 3; $i++) {
            $products[] = Product::firstOrCreate(
                ['name' => "Sample Product $i"],
                [
                    'vendor_id' => $vendor->id,
                    'buy_price' => 50000 * $i,
                    'sell_price' => 100000 * $i,
                    'stock' => 100,
                    'description' => "Description for sample product $i",
                    'status' => 'active'
                ]
            );
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
                'mitra_id' => $vendor->id,
                'shipping_address' => 'Jl. Contoh No. 123, Jakarta, Indonesia',
                'total_amount' => $totalAmount,
                'partner_commission' => $commission,
                'status' => $orderData['status'],
                'affiliate_source' => 'direct_link',
            ]);

            // Create order items
            foreach ($items as $item) {
                $order->items()->create($item);
            }

            $this->command->info("Created order #{$order->order_code} with status: {$order->status}");
        }

        $this->command->info('Simple Order seeder completed successfully!');
    }
}
