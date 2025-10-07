<?php

use App\Http\Controllers\Sales\DashboardController;
use App\Http\Controllers\Sales\ProfileController;
use App\Http\Controllers\Sales\BorrowedProductController;
use App\Http\Controllers\Sales\TransactionController;
use Illuminate\Support\Facades\Route;

// Profile routes - accessible without sales profile check
Route::middleware(['auth'])->group(function () {
    Route::get('/sales/profile/create', [ProfileController::class, 'create'])->name('sales.profile.create');
    Route::post('/sales/profile', [ProfileController::class, 'store'])->name('sales.profile.store');
});

Route::middleware(['auth', 'check-sale'])->group(function () {
    Route::redirect('/sales', '/sales/dashboard');
    Route::get('/sales/dashboard', [DashboardController::class, 'index'])->name('sales.dashboard');

    // Profile
    Route::prefix('sales/profile')->name('sales.profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('index');
    });

    // Products Management
    Route::get('/sales/products', [BorrowedProductController::class, 'index'])->name('sales.products.index');
    Route::get('/sales/products/old', [BorrowedProductController::class, 'old'])->name('sales.products.old');
    Route::get('/sales/products/new', [BorrowedProductController::class, 'create'])->name('sales.products.create');
    Route::post('/sales/products', [BorrowedProductController::class, 'store'])->name('sales.products.store');
    Route::get('/sales/products/{product}/edit', [BorrowedProductController::class, 'edit'])->name('sales.products.edit');

    // Transactions
    Route::get('/sales/transactions', [TransactionController::class, 'index'])->name('sales.transactions');
    Route::get('/sales/transactions/{transaction}', [TransactionController::class, 'show'])->name('sales.transactions.show')->where('transaction', '[0-9]+');
    Route::get('/sales/transactions/new', [TransactionController::class, 'create'])->name('sales.transactions.create');
    Route::post('/sales/transactions', [TransactionController::class, 'store'])->name('sales.transactions.store');
    Route::get('/sales/transactions/new/products', [TransactionController::class, 'selectProducts'])->name('sales.transactions.products');

    // Reports
    Route::get('/sales/reports', [DashboardController::class, 'reports'])->name('sales.reports');
});
