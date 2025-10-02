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
            // First, drop existing foreign key constraint that references users table
            $table->dropForeign('orders_partner_id_foreign');
            
            // Set mitra_id to NULL for orders that don't have corresponding mitra_profiles
            \DB::table('orders')
                ->whereNotIn('mitra_id', function($query) {
                    $query->select('id')->from('mitra_profiles');
                })
                ->update(['mitra_id' => null]);
            
            // Add new foreign key constraint that references mitra_profiles table
            $table->foreign('mitra_id')->references('id')->on('mitra_profiles')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key constraint that references mitra_profiles table
            $table->dropForeign(['mitra_id']);
            
            // Restore foreign key constraint that references users table
            $table->foreign('mitra_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};
