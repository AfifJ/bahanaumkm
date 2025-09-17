<?php

use App\Http\Controllers\Admin\ProductController;
use Inertia\Inertia;
Route::prefix('guest')->name('guest.')->middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return 'guest index';
    })->name('index');
});