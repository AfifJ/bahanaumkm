<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Tambahkan pengecekan jika user belum login
        if (!$request->user()) {
            abort(403, 'Aksi tidak diizinkan.');
        }
        
        // Tambahkan pengecekan jika user tidak memiliki role
        if (!$request->user()->role) {
            abort(403, 'Aksi tidak diizinkan.');
        }
        
        if (!in_array($request->user()->role->name, $roles)) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        return $next($request);
    }
}
