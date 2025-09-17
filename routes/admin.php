<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use Inertia\Inertia;
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:Admin'])->group(function () {
    Route::get('/', function () {
        return 'admin index';
    })->name('index');

    Route::get('dashboard', function () {
        // return Inertia::render('dashboard');
        $user = auth()->user()->load('role');
        return Inertia::render('admin/dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ? $user->role->name : null,
                ]
            ]
        ]);
    })->name('dashboard');

    Route::resource('products', ProductController::class)
        ->middleware(['auth', 'verified'])
        ->name('index', 'products.index');

    Route::resource('categories', CategoryController::class)
        ->middleware(['auth', 'verified'])
        ->name('index', 'categories.index');


    Route::get('/users', function () {
        return "admin users";
    })->name('users');
});
