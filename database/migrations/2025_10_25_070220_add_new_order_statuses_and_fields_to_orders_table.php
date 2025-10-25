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
            // New status timestamps
            $table->timestamp('payment_rejected_at')->nullable()->after('auto_delivered_at');
            $table->timestamp('out_for_delivery_at')->nullable()->after('payment_rejected_at');
            $table->timestamp('failed_delivery_at')->nullable()->after('out_for_delivery_at');
            $table->timestamp('returned_at')->nullable()->after('failed_delivery_at');
            $table->timestamp('refunded_at')->nullable()->after('returned_at');

            // Additional fields for new statuses
            $table->text('reject_reason')->nullable()->after('refunded_at');
            $table->text('delivery_notes')->nullable()->after('reject_reason');
            $table->string('tracking_number')->nullable()->after('delivery_notes');
            $table->string('courier_name')->nullable()->after('tracking_number');
            $table->string('courier_phone')->nullable()->after('courier_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_rejected_at',
                'out_for_delivery_at',
                'failed_delivery_at',
                'returned_at',
                'refunded_at',
                'reject_reason',
                'delivery_notes',
                'tracking_number',
                'courier_name',
                'courier_phone'
            ]);
        });
    }
};
