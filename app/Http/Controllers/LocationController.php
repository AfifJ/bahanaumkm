<?php

namespace App\Http\Controllers;

use App\Models\MitraProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class LocationController extends Controller
{
    /**
     * Select and store location in session
     */
    public function selectLocation(Request $request)
    {
        $request->validate([
            'location_id' => 'required|exists:mitra_profiles,id',
            'dont_show_again' => 'boolean'
        ]);

        $location = MitraProfile::findOrFail($request->location_id);

        // Store selected hotel in session
        Session::put('selected_hotel', [
            'id' => $location->id,
            'hotel_name' => $location->hotel_name,
            'address' => $location->address,
            'city' => $location->city,
            'unique_code' => $location->unique_code,
            'distance_from_warehouse' => $location->distance_from_warehouse
        ]);

        // Store user preference if they don't want to see dialog again
        if ($request->boolean('dont_show_again')) {
            Session::put('hide_location_dialog', true);
        } else {
            Session::forget('hide_location_dialog');
        }

        // Return Inertia redirect
        return redirect()->back()->with('success', 'Lokasi berhasil disimpan');
    }

    /**
     * Clear selected location from session
     */
    public function clearLocation()
    {
        Session::forget('selected_hotel');
        Session::forget('hide_location_dialog');

        return response()->json([
            'success' => true,
            'message' => 'Lokasi berhasil dihapus'
        ]);
    }

    /**
     * Get current selected location
     */
    public function getCurrentLocation()
    {
        $location = Session::get('selected_hotel');

        return response()->json([
            'location' => $location,
            'has_location' => !empty($location)
        ]);
    }
}
