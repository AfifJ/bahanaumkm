<?php

namespace App\Http\Middleware;

use App\Models\MitraProfile;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetHotelFromParameter
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if hotel parameter exists in URL
        if ($request->has('hotel')) {
            $hotelCode = $request->get('hotel');

            // Find mitra by unique code
            $mitra = MitraProfile::where('unique_code', $hotelCode)->first();

            if ($mitra) {
                // Store selected hotel in session
                Session::put('selected_hotel', [
                    'id' => $mitra->id,
                    'hotel_name' => $mitra->hotel_name,
                    'address' => $mitra->address,
                    'city' => $mitra->city,
                    'unique_code' => $mitra->unique_code,
                    'distance_from_warehouse' => $mitra->distance_from_warehouse
                ]);

                // Clear any location dialog preference since user manually selected
                Session::forget('hide_location_dialog');
            }
        }

        return $next($request);
    }
}
