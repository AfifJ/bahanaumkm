<?php

namespace App\Http\Middleware;

use App\Models\Sales;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Check if user has sales role
        if (!auth()->user()->isSales()) {
            return redirect('/')->with('error', 'Akses hanya untuk sales lapangan');
        }

        // Check if user has sales profile
        $hasSalesProfile = Sales::where('user_id', auth()->id())->exists();

        if (!$hasSalesProfile) {
            return redirect()->route('sales.profile.create');
        }

        return $next($request);
    }
}
