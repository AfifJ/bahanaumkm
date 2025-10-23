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
        Schema::create('product_skus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('sku_code')->unique(); // kode unik SKU
            $table->decimal('price', 10, 2); // harga per SKU
            $table->decimal('buy_price', 10, 2)->nullable(); // harga beli per SKU
            $table->integer('stock')->default(0); // stok per SKU
            $table->string('image')->nullable(); // gambar opsional per SKU
            $table->string('status')->default('active'); // active, inactive
            $table->decimal('weight', 8, 2)->nullable(); // berat per SKU
            $table->timestamps();

            $table->index(['product_id', 'status']);
            $table->index('sku_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_skus');
    }
};
