<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController;
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
        ->middleware(['auth', 'verified']);

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

    // Route::prefix('transaction')->name('transaction.')->group(function () {
    //     Route::get('/', [PesananCotroller::class, 'index'])->name('index');
    // });
});
