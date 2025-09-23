<?php

use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\OrderController;
use Inertia\Inertia;

Route::prefix('buyer')->name('buyer.')->middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return 'buyer index';
    })->name('index');

    // Order routes
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/create', [OrderController::class, 'create'])->name('create');
        Route::post('/', [OrderController::class, 'store'])->name('store');
        Route::get('/{order}', [OrderController::class, 'show'])->name('show');
        Route::put('/{order}', [OrderController::class, 'update'])->name('update');
    });

    // Cart routes
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [OrderController::class, 'getCart'])->name('index');
        Route::post('/add', [OrderController::class, 'addToCart'])->name('add');
    });
});
