<?php

use App\Http\Controllers\Admin\ProductController;
use Inertia\Inertia;
Route::prefix('buyer')->name('buyer.')->middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return 'buyer index';
    })->name('index');
});