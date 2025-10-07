<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use function Termwind\render;

Route::get('/', function () {
    if (auth()->check() && auth()->user()->role_id === 1) {
        return redirect('/admin/dashboard');
    }
    return app(HomeController::class)->index();
})->name('home');

Route::get('/category', [CatalogController::class, 'categoryIndex'])->name('category.index');
Route::get('/category/{category}', [CatalogController::class, 'categoryShow'])->name('category.show');

Route::get('/search', [CatalogController::class, 'search'])->name('search');


Route::get('/product/{product}', [CatalogController::class, 'productShow'])->name('product.show');

Route::get('/promo', function () {
    return Inertia::render('promo');
})->name('promo');

Route::get('/about', function () {
    return Inertia::render(component: 'buyer/profile/tentang-kami');
})->name('about');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/vendor.php';
require __DIR__ . '/buyer.php';
require __DIR__ . '/sales.php';
