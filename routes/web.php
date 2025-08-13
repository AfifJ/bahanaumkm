<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        // return Inertia::render('dashboard');
        $user = auth()->user()->load('role');
        return Inertia::render('dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ? $user->role->name : null,
                ]
            ]
        ]);
    })->name('dashboard');
});

Route::get('/admin', function () {
    return 'anda adalah Sales Lapangan';
})->middleware(['auth', 'role:Sales Lapangan']);

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::resource('products', ProductController::class)->middleware(['auth', 'verified']);