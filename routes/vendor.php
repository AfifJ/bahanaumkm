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
    Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('products', [ProductController::class, 'store'])->name('products.store');
    Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
});
