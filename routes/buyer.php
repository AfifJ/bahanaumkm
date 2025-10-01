<?php

use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Buyer\PesananController;
use App\Http\Controllers\Buyer\ProfileController;
use App\Http\Controllers\Buyer\WishlistController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use Inertia\Inertia;


Route::name('buyer.')->group(function () {
    Route::get('/transaksi', function () {
        return Inertia::render('transaksi');
    })->name('transaksi');

    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/create', [OrderController::class, 'create'])->name('create');
        Route::post('/', [OrderController::class, 'store'])->name('store');
        Route::get('/{order}', [OrderController::class, 'show'])->name('show');
        Route::put('/{order}', [OrderController::class, 'update'])->name('update');
    });

    Route::middleware(['auth'])->group(function () {

        // Cart routes
        Route::prefix('cart')->name('cart.')->group(function () {
            Route::get('/', [OrderController::class, 'getCart'])->name('index');
            Route::post('/add', [OrderController::class, 'addToCart'])->name('add');
        });

        Route::prefix('profile')->name('profile.')->group(function () {
            Route::get('/', [ProfileController::class, 'index'])->name('index');
            Route::get('/edit', [ProfileController::class, 'edit'])->name('edit');
            Route::get('/password', [ProfileController::class, 'editPassword'])->name('password');
            Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist');
            Route::get('/bantuan', function () {
                return Inertia::render(component: 'buyer/profile/bantuan');
            })->name('bantuan');
            Route::prefix('pesanan')->name('pesanan.')->group(function () {
                Route::get('/', [PesananController::class, 'index'])->name('index');
            });
        });

    });
});
