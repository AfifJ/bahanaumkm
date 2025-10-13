<?php

use App\Http\Controllers\MitraController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:Mitra'])->group(function () {
    Route::prefix('mitra')->name('mitra.')->group(function () {
        Route::get('/dashboard', [MitraController::class, 'dashboard'])->name('dashboard');
        Route::get('/transactions', [MitraController::class, 'transactions'])->name('transactions');
        Route::get('/reports', [MitraController::class, 'reports'])->name('reports');
        Route::get('/profile', [MitraController::class, 'profile'])->name('profile');
        Route::put('/profile', [MitraController::class, 'updateProfile'])->name('profile.update');
    });
});