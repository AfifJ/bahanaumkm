<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get vendor user
        $vendor = User::whereHas('role', function($query) {
            $query->where('name', 'Vendor');
        })->first();

        // Get categories
        $foodCategory = Category::where('name', 'Makanan & Minuman')->first();
        $craftCategory = Category::where('name', 'Kerajinan Tangan')->first();
        $fashionCategory = Category::where('name', 'Fashion & Aksesoris')->first();

        $products = [
            [
                'vendor_id' => $vendor->id,
                'category_id' => $foodCategory->id,
                'name' => 'Kopi Arabika Kintamani',
                'buy_price' => 50000,
                'sell_price' => 75000,
                'stock' => 100,
                'description' => 'Kopi arabika khas Bali dengan aroma yang harum dan rasa yang khas',
                'image_url' => null,
                'status' => 'active',
                'is_featured' => true
            ],
            [
                'vendor_id' => $vendor->id,
                'category_id' => $foodCategory->id,
                'name' => 'Madu Hutan Asli',
                'buy_price' => 80000,
                'sell_price' => 120000,
                'stock' => 50,
                'description' => 'Madu hutan alami dari pedalaman Bali, tanpa pengawet',
                'image_url' => null,
                'status' => 'active',
                'is_featured' => true
            ],
            [
                'vendor_id' => $vendor->id,
                'category_id' => $craftCategory->id,
                'name' => 'Ukiran Kayu Tradisional',
                'buy_price' => 150000,
                'sell_price' => 250000,
                'stock' => 25,
                'description' => 'Ukiran kayu tradisional Bali dengan motif yang indah',
                'image_url' => null,
                'status' => 'active',
                'is_featured' => false
            ],
            [
                'vendor_id' => $vendor->id,
                'category_id' => $fashionCategory->id,
                'name' => 'Kain Endek Bali',
                'buy_price' => 200000,
                'sell_price' => 350000,
                'stock' => 30,
                'description' => 'Kain endek tradisional Bali dengan motif yang cantik',
                'image_url' => null,
                'status' => 'active',
                'is_featured' => true
            ],
            [
                'vendor_id' => $vendor->id,
                'category_id' => $foodCategory->id,
                'name' => 'Keripik Pisang Madu',
                'buy_price' => 25000,
                'sell_price' => 40000,
                'stock' => 75,
                'description' => 'Keripik pisang dengan madu, renyah dan manis',
                'image_url' => null,
                'status' => 'active',
                'is_featured' => false
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
