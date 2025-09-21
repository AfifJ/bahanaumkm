<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Catalog routes - accessible to guests and authenticated users
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/catalog/{product}', [CatalogController::class, 'show'])->name('catalog.show');

// Placeholder routes for mobile navigation
Route::get('/transaksi', function () {
    return Inertia::render('transaksi');
})->name('transaksi');

Route::get('/promo', function () {
    return Inertia::render('promo');
})->name('promo');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         // return Inertia::render('dashboard');
//         $user = auth()->user()->load('role');
//         return Inertia::render('home', [
//             'auth' => [
//                 'user' => [
//                     'id' => $user->id,
//                     'name' => $user->name,
//                     'email' => $user->email,
//                     'role' => $user->role ? $user->role->name : null,
//                 ]
//             ]
//         ]);
//     })->name('dashboard');
// });

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/vendor.php';
require __DIR__ . '/guest.php';
