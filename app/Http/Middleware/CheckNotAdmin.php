<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckNotAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Jika user adalah admin, redirect ke dashboard admin
        if ($request->user() && $request->user()->role && $request->user()->role->name === 'Admin') {
            return redirect()->route('admin.dashboard');
        }
        
        return $next($request);
    }
}
