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
        Schema::dropIfExists('shipping_settings');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('shipping_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('price_per_km', 10, 2)->default(0);
            $table->timestamps();
        });
    }
};