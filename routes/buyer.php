<?php

use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Buyer\CartController;
use App\Http\Controllers\Buyer\PesananController;
use App\Http\Controllers\Buyer\PaymentController;
use App\Http\Controllers\Buyer\ProfileController;
use App\Http\Controllers\Buyer\WishlistController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Settings\PasswordController;
use Inertia\Inertia;


Route::name('buyer.')->middleware(['auth', 'role:Buyer'])->group(function () {
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

    // Payment routes
    Route::prefix('payment')->name('payment.')->group(function () {
        Route::get('/{order}', [PaymentController::class, 'show'])->name('show');
        Route::post('/{order}', [PaymentController::class, 'uploadProof'])->name('upload');
    });

    Route::middleware(['auth'])->group(function () {

        // Cart page routes
        Route::prefix('cart')->name('cart.')->group(function () {
            Route::get('/', [CartController::class, 'index'])->name('index');
            Route::get('/checkout', [CartController::class, 'checkout'])->name('checkout');
            Route::post('/checkout', [CartController::class, 'checkout'])->name('checkout.submit');
            Route::patch('/{cart}', [CartController::class, 'update'])->name('update');
            Route::delete('/{cart}', [CartController::class, 'destroy'])->name('destroy');
            Route::delete('/', [CartController::class, 'clear'])->name('clear');
        });

        // Cart API routes
        Route::prefix('api/cart')->name('cart.api.')->group(function () {
            Route::get('/', [OrderController::class, 'getCart'])->name('index');
            Route::post('/add', [OrderController::class, 'addToCart'])->name('add');
            Route::patch('/{cart}', [OrderController::class, 'updateCartItem'])->name('update');
            Route::delete('/{cart}', [OrderController::class, 'removeFromCart'])->name('remove');
        });

        Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist');
        Route::post('/wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
        Route::delete('/wishlist/{product}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
        Route::prefix('profile')->name('profile.')->group(function () {
            Route::get('/', [ProfileController::class, 'index'])->name('index');
            Route::get('/edit', [ProfileController::class, 'edit'])->name('edit');
            Route::patch('/update', [ProfileController::class, 'update'])->name('update');
            Route::get('/password', [ProfileController::class, 'editPassword'])->name('password');
            Route::put('/password', [PasswordController::class, 'update'])->name('password.update');
            Route::get('/bantuan', function () {
                return Inertia::render(component: 'buyer/profile/bantuan');
            })->name('bantuan');
            Route::prefix('pesanan')->name('pesanan.')->group(function () {
                Route::get('/', [PesananController::class, 'index'])->name('index');
            });
        });

    });
});
