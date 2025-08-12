<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::insert([
            [
                'id' => 1,
                'name' => 'Admin',
                'description' => 'Mengelola akun dan produk di gudang untuk semua role',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'name' => 'Vendor',
                'description' => 'Melihat dan membuat laporan produk yang disetor dan terjual',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'name' => 'Mitra',
                'description' => 'Mengakses transaksi dan menampilkan katalog produk',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 4,
                'name' => 'Sales Lapangan',
                'description' => 'Mengedit dan melihat stok produk',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 5,
                'name' => 'Buyer',
                'description' => 'Melihat, membeli, dan memfavoritkan produk',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

    }
}
