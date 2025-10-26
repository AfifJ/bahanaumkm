<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('buy_price', 12, 2)->after('unit_price')->nullable();
        });

        // Backfill existing data with buy_price from products/skus
        \DB::statement('
            UPDATE order_items oi
            SET buy_price = CASE
                WHEN oi.sku_id IS NOT NULL THEN (SELECT buy_price FROM product_skus WHERE id = oi.sku_id)
                ELSE (SELECT buy_price FROM products WHERE id = oi.product_id)
            END
            WHERE oi.buy_price IS NULL
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('buy_price');
        });
    }
};