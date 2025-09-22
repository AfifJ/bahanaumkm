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
        // Add slug to products table
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug', 255)->unique()->nullable()->after('name');
        });

        // Add slug to categories table
        Schema::table('categories', function (Blueprint $table) {
            $table->string('slug', 255)->unique()->nullable()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove slug from products table
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        // Remove slug from categories table
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
