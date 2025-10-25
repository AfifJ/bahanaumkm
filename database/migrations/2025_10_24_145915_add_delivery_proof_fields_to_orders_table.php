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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_proof')->nullable()->after('payment_proof');
            $table->timestamp('delivery_proof_uploaded_at')->nullable()->after('delivery_proof');
            $table->timestamp('delivered_confirmed_at')->nullable()->after('delivered_at');
            $table->timestamp('auto_delivered_at')->nullable()->after('delivered_confirmed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_proof',
                'delivery_proof_uploaded_at', 
                'delivered_confirmed_at',
                'auto_delivered_at'
            ]);
        });
    }
};
