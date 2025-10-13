<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate existing product images to new structure
        DB::table('products')
            ->whereNotNull('image_url')
            ->where('image_url', '!=', '')
            ->orderBy('id')
            ->chunk(100, function ($products) {
                foreach ($products as $product) {
                    // Convert /storage/ path to storage path
                    $imagePath = str_replace('/storage/', '', $product->image_url);

                    // Create new product image record
                    DB::table('product_images')->insert([
                        'product_id' => $product->id,
                        'image_path' => $imagePath,
                        'is_primary' => true,
                        'sort_order' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Delete all migrated product images
        DB::table('product_images')->delete();
    }
};
