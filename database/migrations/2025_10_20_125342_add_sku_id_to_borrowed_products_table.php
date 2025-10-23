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
        Schema::table('borrowed_products', function (Blueprint $table) {
            $table->foreignId('sku_id')->nullable()->after('product_id')->constrained('product_skus')->nullOnDelete();

            // Add index for better performance
            $table->index(['sale_id', 'sku_id']);
            $table->index(['sku_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('borrowed_products', function (Blueprint $table) {
            $table->dropForeign(['sku_id']);
            $table->dropIndex(['sale_id', 'sku_id']);
            $table->dropIndex(['sku_id', 'status']);
            $table->dropColumn('sku_id');
        });
    }
};
