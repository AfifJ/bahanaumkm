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
        Schema::create('partner_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('hotel_name');
            $table->text('address');
            $table->string('city');
            $table->string('phone')->nullable();
            $table->string('unique_code')->unique();
            $table->string('partner_tier')->default('standard'); // premium, standard, basic
            $table->decimal('commission_rate', 5, 2)->default(value: 25.00); // default 25%
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partner_profiles');
    }
};
