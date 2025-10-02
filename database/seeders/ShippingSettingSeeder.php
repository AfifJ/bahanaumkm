<?php

namespace Database\Seeders;

use App\Models\ShippingSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShippingSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default shipping setting if not exists
        ShippingSetting::firstOrCreate(
            [],
            ['price_per_km' => 5000] // Default price per KM
        );
    }
}
