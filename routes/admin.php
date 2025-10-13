<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CarouselController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SalesProductController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ShippingSettingController;
use Inertia\Inertia;
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:Admin'])->group(function () {
    Route::get('/', function () {
        return 'admin index';
    })->name('index');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Carousel Management Routes
    Route::resource('carousels', CarouselController::class)
        ->middleware(['auth', 'verified']);
    Route::post('carousels/{carousel}/toggle-status', [CarouselController::class, 'toggleStatus'])->name('carousels.toggle-status');
    Route::post('carousels/update-order', [CarouselController::class, 'updateOrder'])->name('carousels.update-order');

    Route::resource('products', ProductController::class)
        ->middleware(['auth', 'verified']);

    // Product Image Management Routes
    Route::prefix('products/{product}')->name('products.')->group(function () {
        Route::put('/images/{image}/primary', [ProductController::class, 'setPrimaryImage'])->name('images.setPrimary');
        Route::delete('/images/{image}', [ProductController::class, 'deleteImage'])->name('images.delete');
        Route::get('/reviews', [ProductController::class, 'reviews'])->name('reviews');
    });

    Route::resource('categories', CategoryController::class)
        ->middleware(['auth', 'verified']);

    Route::get('/users', function () {
        return redirect()->route('admin.users.index', ['role' => 'Admin']);
    })->name('users');

    // User Management Routes
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/{role}', [UserController::class, 'index'])->name('index');
        Route::get('/{role}/create', [UserController::class, 'create'])->name('create');
        Route::post('/{role}', [UserController::class, 'store'])->name('store');
        Route::get('/{role}/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::put('/{role}/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{role}/{user}', [UserController::class, 'destroy'])->name('destroy');
    });

    Route::get('/transaction', function () {


    })->name('transaction');

    Route::prefix('transaction')->name('transaction.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::get('/{order}', [TransactionController::class, 'show'])->name('show');
        Route::put('/{order}', [TransactionController::class, 'update'])->name('update');
        Route::post('/bulk-update', [TransactionController::class, 'bulkUpdate'])->name('bulk.update');
    });

    // Sales Product Management Routes
    Route::prefix('sales-products')->name('sales-products.')->group(function () {
        Route::get('/', [SalesProductController::class, 'index'])->name('index');
        Route::get('/create', [SalesProductController::class, 'create'])->name('create');
        Route::post('/', [SalesProductController::class, 'store'])->name('store');
        Route::get('/{borrowedProduct}', [SalesProductController::class, 'show'])->name('show');
        Route::get('/{borrowedProduct}/edit', [SalesProductController::class, 'edit'])->name('edit');
        Route::put('/{borrowedProduct}', [SalesProductController::class, 'update'])->name('update');
        Route::put('/{borrowedProduct}/return', [SalesProductController::class, 'return'])->name('return');
        Route::post('/{borrowedProduct}/return-product', [SalesProductController::class, 'returnProduct'])->name('return-product');
        Route::delete('/{borrowedProduct}', [SalesProductController::class, 'destroy'])->name('destroy');
        Route::get('/sales/{user}', [SalesProductController::class, 'salesProducts'])->name('sales');
    });

    // Settings Routes
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingController::class, 'index'])->name('index');
        Route::put('/', [SettingController::class, 'update'])->name('update');
        Route::post('/', [SettingController::class, 'update'])->name('update.post'); // Support for file uploads with _method: 'PUT'
    });

    // Shipping Settings Routes
    Route::prefix('shipping-settings')->name('shipping-settings.')->group(function () {
        Route::get('/', [ShippingSettingController::class, 'index'])->name('index');
        Route::put('/', [ShippingSettingController::class, 'update'])->name('update');
    });
});
