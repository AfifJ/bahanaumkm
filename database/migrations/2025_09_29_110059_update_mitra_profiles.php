<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mitra_profiles', function (Blueprint $table) {
            $table->dropColumn(['city', 'partner_tier', 'commission_rate']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mitra_profiles', function (Blueprint $table) {
            $table->string('city');
            $table->string('partner_tier')->default('standard'); // premium, standard, basic
            $table->decimal('commission_rate', 5, 2)->default(value: 25.00); // default 25%
        });
    }
};
