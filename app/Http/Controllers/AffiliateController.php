<?php

namespace App\Http\Controllers;

use App\Models\MitraProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AffiliateController extends Controller
{
    /**
     * Handle affiliate redirect from QR code
     */
    public function redirect($code)
    {
        $mitra = MitraProfile::where('unique_code', $code)->first();

        if (!$mitra) {
            abort(404, 'Mitra tidak ditemukan');
        }

        // Store affiliate session untuk tracking
        session(['affiliate_mitra' => $mitra->id]);
        session(['affiliate_source' => 'qr_code']);

        return Inertia::render('affiliate/redirect', [
            'mitra' => $mitra,
            'redirectUrl' => route('category.index') // Redirect ke katalog
        ]);
    }

    /**
     * Process affiliate visit and redirect to catalog
     */
    public function processVisit($code)
    {
        $mitra = MitraProfile::where('unique_code', $code)->first();

        if (!$mitra) {
            return redirect()->route('category.index');
        }

        // Set session untuk affiliate tracking
        session([
            'affiliate_mitra' => $mitra->id,
            'affiliate_source' => 'qr_code',
            'shipping_address' => $mitra->address . ', ' . $mitra->city
        ]);

        return redirect()->route('category.index')
            ->with('affiliate_info', [
                'mitra_name' => $mitra->hotel_name,
                'shipping_address' => $mitra->address . ', ' . $mitra->city
            ]);
    }
}
