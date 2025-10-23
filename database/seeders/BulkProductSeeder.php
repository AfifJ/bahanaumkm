<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use App\Models\ProductImage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BulkProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Seeder ini aman untuk dijalankan berkali-kali karena:
     * - Tidak menghapus data existing
     * - Cek duplikasi berdasarkan nama produk
     * - Hanya menambahkan data yang belum ada
     */
    public function run(): void
    {
        // Get vendor users (ambil beberapa vendor untuk variasi)
        $vendors = User::whereHas('role', function($query) {
            $query->where('name', 'Vendor');
        })->get();

        if ($vendors->isEmpty()) {
            $this->command->info('Tidak ada vendor ditemukan. Pastikan UserSeeder sudah dijalankan.');
            return;
        }

        // Get categories
        $categories = Category::all();
        if ($categories->isEmpty()) {
            $this->command->info('Tidak ada kategori ditemukan. Pastikan CategorySeeder sudah dijalankan.');
            return;
        }

        // Data produk bulk yang realistis untuk UMKM dengan gambar
        $bulkProducts = [
            // Makanan & Minuman
            [
                'name' => 'Kopi Robusta Lampung',
                'description' => 'Kopi robusta asli Lampung dengan cita rasa kuat dan aroma khas',
                'buy_price' => 45000,
                'sell_price' => 68000,
                'stock' => 80,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Makanan & Minuman',
                'image_url' => 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Teh Hijau Organik',
                'description' => 'Teh hijau organik dari perkebunan lokal, tanpa pestisida',
                'buy_price' => 35000,
                'sell_price' => 55000,
                'stock' => 60,
                'status' => 'active',
                'is_featured' => false,
                'category_name' => 'Makanan & Minuman',
                'image_url' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Kerupuk Ikan Tenggiri',
                'description' => 'Kerupuk ikan tenggiri homemade, renyah dan gurih',
                'buy_price' => 20000,
                'sell_price' => 35000,
                'stock' => 120,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Makanan & Minuman',
                'image_url' => 'https://images.unsplash.com/photo-1587332278433-46ad66c8a0f3?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Sambal Terasi Pedas',
                'description' => 'Sambal terasi homemade dengan level pedas yang bisa disesuaikan',
                'buy_price' => 15000,
                'sell_price' => 25000,
                'stock' => 90,
                'status' => 'active',
                'is_featured' => false,
                'category_name' => 'Makanan & Minuman',
                'image_url' => 'https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Madu Kelengkeng',
                'description' => 'Madu kelengkeng asli dengan rasa manis alami',
                'buy_price' => 75000,
                'sell_price' => 110000,
                'stock' => 40,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Makanan & Minuman',
                'image_url' => 'https://images.unsplash.com/photo-1587049352846-4a222b784a68?w=400&h=300&fit=crop'
            ],

            // Kerajinan Tangan
            [
                'name' => 'Tas Rajut Handmade',
                'description' => 'Tas rajut handmade dengan desain unik dan warna natural',
                'buy_price' => 80000,
                'sell_price' => 150000,
                'stock' => 25,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Kerajinan Tangan',
                'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Gelang Manik-manik',
                'description' => 'Gelang manik-manik handmade dengan kombinasi warna menarik',
                'buy_price' => 15000,
                'sell_price' => 30000,
                'stock' => 50,
                'status' => 'active',
                'is_featured' => false,
                'category_name' => 'Kerajinan Tangan',
                'image_url' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Lilin Aromaterapi',
                'description' => 'Lilin aromaterapi dengan essential oil alami, berbagai aroma tersedia',
                'buy_price' => 25000,
                'sell_price' => 45000,
                'stock' => 35,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Kerajinan Tangan',
                'image_url' => 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Pot Tanah Liat',
                'description' => 'Pot tanaman dari tanah liat dengan ukuran bervariasi',
                'buy_price' => 30000,
                'sell_price' => 60000,
                'stock' => 20,
                'status' => 'active',
                'is_featured' => false,
                'category_name' => 'Kerajinan Tangan',
                'image_url' => 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop'
            ],

            // Fashion & Aksesoris
            [
                'name' => 'Batik Tulis Premium',
                'description' => 'Kain batik tulis premium dengan motif tradisional yang detail',
                'buy_price' => 250000,
                'sell_price' => 450000,
                'stock' => 15,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Fashion & Aksesoris',
                'image_url' => 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Scarf Sutra Alam',
                'description' => 'Scarf dari bahan sutra alam dengan motif etnik yang elegan',
                'buy_price' => 120000,
                'sell_price' => 220000,
                'stock' => 30,
                'status' => 'active',
                'is_featured' => false,
                'category_name' => 'Fashion & Aksesoris',
                'image_url' => 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Tas Anyaman Rotan',
                'description' => 'Tas anyaman rotan dengan desain modern dan kuat',
                'buy_price' => 90000,
                'sell_price' => 180000,
                'stock' => 18,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Fashion & Aksesoris',
                'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'
            ],

            // Kesehatan & Kecantikan
            [
                'name' => 'Minyak Zaitun Organik',
                'description' => 'Minyak zaitun organik untuk perawatan kulit dan rambut',
                'buy_price' => 65000,
                'sell_price' => 95000,
                'stock' => 45,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Kesehatan & Kecantikan',
                'image_url' => 'https://images.unsplash.com/photo-1603661687440-6b2c36b8c7b3?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Lulur Mandi Tradisional',
                'description' => 'Lulur mandi tradisional dengan rempah-rempah alami',
                'buy_price' => 35000,
                'sell_price' => 60000,
                'stock' => 55,
                'status' => 'active',
                'is_featured' => false,
                'category_name' => 'Kesehatan & Kecantikan',
                'image_url' => 'https://images.unsplash.com/photo-1594736797933-d0b4ec4d7d6a?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Sabun Herbal Alami',
                'description' => 'Sabun herbal dengan bahan alami untuk berbagai jenis kulit',
                'buy_price' => 20000,
                'sell_price' => 35000,
                'stock' => 70,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Kesehatan & Kecantikan',
                'image_url' => 'https://images.unsplash.com/photo-1594736797933-d0b4ec4d7d6a?w=400&h=300&fit=crop'
            ],

            // Dekorasi Rumah
            [
                'name' => 'Lampu Hias Bambu',
                'description' => 'Lampu hias dari bambu dengan desain minimalis dan natural',
                'buy_price' => 120000,
                'sell_price' => 220000,
                'stock' => 12,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Dekorasi Rumah',
                'image_url' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Vas Bunga Keramik',
                'description' => 'Vas bunga keramik handmade dengan motif tradisional',
                'buy_price' => 80000,
                'sell_price' => 150000,
                'stock' => 22,
                'status' => 'active',
                'is_featured' => false,
                'category_name' => 'Dekorasi Rumah',
                'image_url' => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Karpet Rajut Tangan',
                'description' => 'Karpet rajut tangan dengan bahan wol alami dan warna natural',
                'buy_price' => 180000,
                'sell_price' => 320000,
                'stock' => 8,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Dekorasi Rumah',
                'image_url' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
            ],

            // Oleh-oleh Khas
            [
                'name' => 'Oleh-oleh Kue Kering',
                'description' => 'Kue kering khas daerah dengan kemasan menarik untuk oleh-oleh',
                'buy_price' => 30000,
                'sell_price' => 50000,
                'stock' => 65,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Oleh-oleh Khas',
                'image_url' => 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Gantungan Kunci Souvenir',
                'description' => 'Gantungan kunci dengan motif khas daerah, cocok untuk souvenir',
                'buy_price' => 10000,
                'sell_price' => 20000,
                'stock' => 100,
                'status' => 'active',
                'is_featured' => false,
                'category_name' => 'Oleh-oleh Khas',
                'image_url' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
            ],
            [
                'name' => 'Stiker Lokal Kreatif',
                'description' => 'Stiker dengan desain kreatif khas lokal, berbagai motif tersedia',
                'buy_price' => 5000,
                'sell_price' => 15000,
                'stock' => 200,
                'status' => 'active',
                'is_featured' => true,
                'category_name' => 'Oleh-oleh Khas',
                'image_url' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
            ]
        ];

        $createdCount = 0;
        $skippedCount = 0;

        $this->command->info('Memulai proses bulk import produk...');
        $this->command->info('Total data yang akan diproses: ' . count($bulkProducts));

        foreach ($bulkProducts as $productData) {
            // Cek apakah produk dengan nama yang sama sudah ada
            $existingProduct = Product::where('name', $productData['name'])->first();
            
            if ($existingProduct) {
                $this->command->info("Produk '{$productData['name']}' sudah ada, dilewati.");
                $skippedCount++;
                continue;
            }

            // Cari kategori berdasarkan nama
            $category = $categories->firstWhere('name', $productData['category_name']);
            if (!$category) {
                $this->command->warn("Kategori '{$productData['category_name']}' tidak ditemukan untuk produk '{$productData['name']}'");
                $skippedCount++;
                continue;
            }

            // Pilih vendor secara acak dari daftar vendor yang tersedia
            $vendor = $vendors->random();

            // Siapkan data untuk insert
            $productToCreate = [
                'vendor_id' => $vendor->id,
                'category_id' => $category->id,
                'name' => $productData['name'],
                'description' => $productData['description'],
                'buy_price' => $productData['buy_price'],
                'sell_price' => $productData['sell_price'],
                'stock' => $productData['stock'],
                'status' => $productData['status'],
                'is_featured' => $productData['is_featured'],
            ];

            // Create product
            $product = Product::create($productToCreate);

            // Add product image using the new system
            if (isset($productData['image_url'])) {
                $this->addProductImage($product, $productData['image_url']);
            }

            $createdCount++;
            $this->command->info("Produk '{$productData['name']}' berhasil ditambahkan.");
        }

        $this->command->info("Proses bulk import selesai!");
        $this->command->info("Produk berhasil ditambahkan: {$createdCount}");
        $this->command->info("Produk dilewati (sudah ada): {$skippedCount}");
        $this->command->info("Total produk dalam database: " . Product::count());
    }

    /**
     * Add product image using the new system
     */
    private function addProductImage(Product $product, string $imageUrl): void
    {
        try {
            // Generate unique filename
            $filename = 'product_' . $product->id . '_' . Str::random(10) . '.jpg';
            $path = 'products/' . $filename;

            // Create products directory if it doesn't exist
            if (!Storage::disk('public')->exists('products')) {
                Storage::disk('public')->makeDirectory('products');
            }

            // Download and store the image
            $imageContents = Http::get($imageUrl);
            if ($imageContents->successful()) {
                Storage::disk('public')->put($path, $imageContents->body());

                // Create product image record
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);

                $this->command->info("  ✓ Gambar berhasil ditambahkan untuk produk '{$product->name}'");
            } else {
                $this->command->warn("  ⚠ Gagal mengunduh gambar untuk produk '{$product->name}'");
            }
        } catch (\Exception $e) {
            $this->command->error("  ✗ Error menambahkan gambar untuk produk '{$product->name}': " . $e->getMessage());
        }
    }
}
