<?php

use App\Http\Controllers\Vendor\ProductController;
use App\Http\Controllers\Vendor\ProfileController;
use App\Http\Controllers\Vendor\ReportController;
use App\Http\Controllers\Vendor\TransactionController;
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

    // Profile Routes
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('profile/avatar', [ProfileController::class, 'removeAvatar'])->name('profile.avatar.remove');

    // Product Routes
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::get('products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('products/{product}/skus', [ProductController::class, 'skus'])->name('products.skus');
    Route::put('products/{product}/skus/{sku}', [ProductController::class, 'updateSku'])->name('products.skus.update');

    Route::prefix('transaction')->name('transaction.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        // Route::get('/{order}', [TransactionController::class, 'show'])->name('show');
    });

    Route::prefix('report')->name('report.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        // Route::get('/{order}', [TransactionController::class, 'show'])->name('show');
    });

});
