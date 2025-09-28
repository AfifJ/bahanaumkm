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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('partner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('shipping_address');
            $table->decimal('total_amount', 12, 2);
            $table->decimal('partner_commission', 12, 2)->default(0);
            $table->string('status')->default('pending'); // pending, paid, processing, shipped, delivered, cancelled
            $table->string('affiliate_source')->nullable(); // qr_code, direct_link, etc
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
