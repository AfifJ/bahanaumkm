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
        // Drop unused variation tables
        Schema::dropIfExists('product_sku_variations');
        Schema::dropIfExists('product_variation_options');
        Schema::dropIfExists('product_variations');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate tables if needed (for rollback)
        Schema::create('product_variations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('name', 100);
            $table->string('type', 50); // size, color, material, etc.
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_variation_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variation_id')->constrained('product_variations')->onDelete('cascade');
            $table->string('value', 100); // S, M, L, XL, Red, Blue, etc.
            $table->string('color_code', 7)->nullable(); // For color variations
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_sku_variations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sku_id')->constrained('product_skus')->onDelete('cascade');
            $table->foreignId('variation_option_id')->constrained('product_variation_options')->onDelete('cascade');
            $table->timestamps();
        });
    }
};
