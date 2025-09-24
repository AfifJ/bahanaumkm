<?php

use App\Http\Controllers\Vendor\ProductController;
use Inertia\Inertia;
Route::prefix('vendor')->name('vendor.')->middleware(['auth', 'role:Vendor'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user()->load('role');
        return Inertia::render('vendor/dashboard', [
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

    // Product Routes
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
});
