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
        // Rename table from partner_profiles to mitra_profiles
        Schema::rename('partner_profiles', 'mitra_profiles');

        // Update foreign key in orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('partner_id', 'mitra_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert table rename
        Schema::rename('mitra_profiles', 'partner_profiles');

        // Revert foreign key in orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('mitra_id', 'partner_id');
        });
    }
};
