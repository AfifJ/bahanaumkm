<?php

namespace App\Http\Controllers;

use App\Models\ShippingSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShippingSettingController extends Controller
{
    /**
     * Display the shipping settings.
     */
    public function index()
    {
        $shippingSetting = ShippingSetting::first();

        return Inertia::render('admin/shipping-settings/index', [
            'shippingSetting' => $shippingSetting,
        ]);
    }

    /**
     * Update the shipping settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'price_per_km' => 'required|numeric|min:0',
        ]);

        $shippingSetting = ShippingSetting::first();

        if ($shippingSetting) {
            $shippingSetting->update($validated);
        } else {
            ShippingSetting::create($validated);
        }

        return redirect()->route('admin.shipping-settings.index')
            ->with('success', 'Pengaturan ongkos kirim berhasil diperbarui');
    }
}
