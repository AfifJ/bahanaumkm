<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default settings
        $settings = [
            [
                'key' => 'admin_commission',
                'value' => '10',
                'description' => 'Komisi Admin (%)',
                'type' => 'number',
            ],
            [
                'key' => 'sales_commission',
                'value' => '5',
                'description' => 'Komisi Sales (%)',
                'type' => 'number',
            ],
            [
                'key' => 'qris_image',
                'value' => 'qris/qris-code.png',
                'description' => 'QRIS Payment Image',
                'type' => 'image',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'description' => $setting['description'],
                    'type' => $setting['type'],
                ]
            );
        }
    }
}