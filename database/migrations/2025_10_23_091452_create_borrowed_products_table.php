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
        Schema::create('borrowed_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sku_id')->nullable()->constrained('product_skus')->cascadeOnDelete();
            $table->integer('borrowed_quantity')->default(0);
            $table->integer('sold_quantity')->default(0);
            $table->enum('status', ['borrowed', 'returned'])->default('borrowed');
            $table->date('borrowed_date');
            $table->date('return_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrowed_products');
    }
};
