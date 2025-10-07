<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the sales profile page.
     */
    public function index()
    {
        return Inertia::render('sales/profile/index', [
            'user' => auth()->user(),
        ]);
    }

    /**
     * Show the form for creating a new sales profile.
     */
    public function create()
    {
        // Check if user already has a sales profile
        $existingProfile = Sales::where('user_id', auth()->id())->first();
        
        if ($existingProfile) {
            return redirect()->route('sales.dashboard');
        }

        return Inertia::render('sales/profile/create');
    }

    /**
     * Store a newly created sales profile.
     */
    public function store(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|max:20',
        ]);

        // Check if user already has a sales profile
        $existingProfile = Sales::where('user_id', auth()->id())->first();
        
        if ($existingProfile) {
            return redirect()->route('sales.dashboard');
        }

        // Create new sales profile
        Sales::create([
            'user_id' => auth()->id(),
            'phone' => $request->phone,
            'status' => 'active',
        ]);

        return redirect()->route('sales.dashboard')
            ->with('success', 'Profile sales berhasil dibuat!');
    }
}
