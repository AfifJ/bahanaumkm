<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /**
     * Display settings page.
     */
    public function index()
    {
        $settings = Setting::all()->keyBy('key');

        // Ensure default settings exist
        $this->ensureDefaultSettings();

        // Get current QRIS image value
        $qrisImage = Setting::getValue('qris_image', 'qris/qris-code.png');

        // Get shipping price per km
        $shippingPricePerKm = Setting::getShippingPricePerKm();

        // Debug: Log the values being sent to frontend
        \Log::info('Admin Settings Index - Values:', [
            'admin_commission' => Setting::getValue('admin_commission', 10),
            'sales_commission' => Setting::getValue('sales_commission', 5),
            'shipping_price_per_km' => $shippingPricePerKm,
            'qris_image' => $qrisImage,
            'qris_image_url' => $qrisImage ? "/storage/{$qrisImage}" : null,
            'settings_count' => $settings->count(),
            'qris_file_exists' => file_exists(storage_path("app/public/{$qrisImage}"))
        ]);

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
            'adminCommission' => Setting::getValue('admin_commission', 10),
            'salesCommission' => Setting::getValue('sales_commission', 5),
            'shippingPricePerKm' => $shippingPricePerKm,
            'qrisImage' => $qrisImage,
        ]);
    }

    /**
     * Ensure default settings exist in database
     */
    private function ensureDefaultSettings()
    {
        $defaultSettings = [
            'admin_commission' => [
                'value' => '10',
                'description' => 'Komisi Admin (%)',
                'type' => 'number'
            ],
            'sales_commission' => [
                'value' => '5',
                'description' => 'Komisi Sales (%)',
                'type' => 'number'
            ],
            'shipping_price_per_km' => [
                'value' => '5000',
                'description' => 'Harga ongkos kirim per kilometer',
                'type' => 'number'
            ],
            'qris_image' => [
                'value' => 'qris/qris-code.png',
                'description' => 'QRIS Payment Image',
                'type' => 'image'
            ]
        ];

        foreach ($defaultSettings as $key => $config) {
            $setting = Setting::where('key', $key)->first();
            if (!$setting) {
                \Log::info("Creating default setting: {$key}");
                Setting::create([
                    'key' => $key,
                    'value' => $config['value'],
                    'description' => $config['description'],
                    'type' => $config['type']
                ]);
            }
        }
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        \Log::info('Settings Update Request:', [
            'has_commissions' => $request->has(['admin_commission', 'sales_commission']),
            'has_shipping_price' => $request->has('shipping_price_per_km'),
            'has_qris_file' => $request->hasFile('qris_image'),
            'request_data' => $request->all()
        ]);

        $updatedTypes = [];

        try {
            // Update commissions if provided
            if ($request->has(['admin_commission', 'sales_commission'])) {
                $this->updateCommissions($request);
                $updatedTypes[] = 'komisi';
            }

            // Update shipping price per km if provided
            if ($request->has('shipping_price_per_km')) {
                $this->updateShippingPrice($request);
                $updatedTypes[] = 'ongkir';
            }

            // Update QRIS image if provided
            if ($request->hasFile('qris_image')) {
                $this->updateQrisImage($request);
                $updatedTypes[] = 'QRIS';
            }

            // Create success message based on what was updated
            $successMessage = 'Pengaturan berhasil diperbarui';
            if (!empty($updatedTypes)) {
                $successMessage .= ': ' . implode(' dan ', $updatedTypes);
            }

            return back()->with('success', "{$successMessage}.");

        } catch (\Exception $e) {
            \Log::error('Settings Update Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Gagal memperbarui pengaturan: ' . $e->getMessage());
        }
    }

    /**
     * Update commission settings
     */
    private function updateCommissions(Request $request)
    {
        $request->validate([
            'admin_commission' => 'required|numeric|min:0|max:100',
            'sales_commission' => 'required|numeric|min:0|max:100',
        ]);

        \Log::info('Updating Commissions:', [
            'admin_commission' => $request->admin_commission,
            'sales_commission' => $request->sales_commission
        ]);

        // Update admin commission
        Setting::setValue('admin_commission', $request->admin_commission, 'number', 'Komisi Admin (%)');

        // Update sales commission
        Setting::setValue('sales_commission', $request->sales_commission, 'number', 'Komisi Sales (%)');

        \Log::info('Commissions updated successfully');
    }

    /**
     * Update QRIS image
     */
    private function updateQrisImage(Request $request)
    {
        $request->validate([
            'qris_image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $file = $request->file('qris_image');

        \Log::info('Updating QRIS Image (Category Pattern):', [
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType()
        ]);

        // Store file in qris directory using same pattern as categories
        $path = $file->store('qris', 'public');

        \Log::info('QRIS File Stored (Category Pattern):', [
            'path' => $path,
            'public_path' => public_path("storage/{$path}"),
            'storage_url' => "/storage/{$path}"
        ]);

        // Update setting
        Setting::setValue('qris_image', $path, 'image', 'QRIS Payment Image');

        \Log::info('QRIS Setting Updated (Category Pattern):', [
            'new_path' => $path,
            'full_url' => "/storage/{$path}"
        ]);
    }

    /**
     * Update shipping price per km
     */
    private function updateShippingPrice(Request $request)
    {
        $request->validate([
            'shipping_price_per_km' => 'required|numeric|min:0',
        ]);

        \Log::info('Updating Shipping Price:', [
            'shipping_price_per_km' => $request->shipping_price_per_km
        ]);

        // Update shipping price per km using the helper method
        Setting::setShippingPricePerKm($request->shipping_price_per_km);

        \Log::info('Shipping price updated successfully');
    }
}