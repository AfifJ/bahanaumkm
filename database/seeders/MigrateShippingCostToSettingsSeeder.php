<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;
use App\Models\ShippingSetting;

class MigrateShippingCostToSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the shipping setting from the old table
        $shippingSetting = ShippingSetting::first();

        if ($shippingSetting) {
            // Create or update the setting in the settings table
            Setting::setValue(
                'shipping_price_per_km',
                $shippingSetting->price_per_km,
                'number',
                'Harga ongkos kirim per kilometer'
            );

            $this->command->info('Successfully migrated shipping cost from shipping_settings to settings table');
            $this->command->info("Shipping price per km: {$shippingSetting->price_per_km}");
        } else {
            // Set default value if no shipping setting exists
            Setting::setValue(
                'shipping_price_per_km',
                0,
                'number',
                'Harga ongkos kirim per kilometer'
            );

            $this->command->info('No existing shipping setting found. Set default price per km to 0');
        }
    }
}