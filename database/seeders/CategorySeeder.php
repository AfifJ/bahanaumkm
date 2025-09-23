<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Makanan & Minuman',
                'description' => 'Berbagai jenis makanan dan minuman khas lokal'
            ],
            [
                'name' => 'Kerajinan Tangan',
                'description' => 'Produk kerajinan tangan buatan lokal'
            ],
            [
                'name' => 'Fashion & Aksesoris',
                'description' => 'Pakaian dan aksesoris tradisional dan modern'
            ],
            [
                'name' => 'Kesehatan & Kecantikan',
                'description' => 'Produk kesehatan dan kecantikan alami'
            ],
            [
                'name' => 'Dekorasi Rumah',
                'description' => 'Produk dekorasi rumah dan furniture'
            ],
            [
                'name' => 'Oleh-oleh Khas',
                'description' => 'Oleh-oleh khas daerah dan souvenir'
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
