<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the sales profile page.
     */
    public function index()
    {
        $user = auth()->user()->only(['name', 'email', 'phone']);
        return Inertia::render('sales/profile/index', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the sales profile.
     */
    public function edit()
    {
        $user = auth()->user()->only(['name', 'email', 'phone']);
        return Inertia::render('sales/profile/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the sales profile in storage.
     */
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $request->user()->id,
            'phone' => 'nullable|string|max:20|regex:/^[0-9+\-\s()]+$/',
        ]);

        $user = $request->user();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->save();

        return redirect()->route('sales.profile.index')->with('success', 'Profil berhasil diperbarui');
    }
}