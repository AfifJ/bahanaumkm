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
        // Add to carts table
        Schema::table('carts', function (Blueprint $table) {
            $table->foreignId('sku_id')->nullable()->after('product_id')->constrained('product_skus')->onDelete('cascade');
            $table->text('variation_summary')->nullable()->after('quantity');
        });

        // Add to order_items table
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('sku_id')->nullable()->after('product_id')->constrained('product_skus')->onDelete('cascade');
            $table->text('variation_summary')->nullable()->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove from carts table
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['sku_id']);
            $table->dropColumn(['sku_id', 'variation_summary']);
        });

        // Remove from order_items table
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['sku_id']);
            $table->dropColumn(['sku_id', 'variation_summary']);
        });
    }
};
