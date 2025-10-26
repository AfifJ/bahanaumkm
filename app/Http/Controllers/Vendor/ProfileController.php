<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Show the form for editing the vendor profile.
     */
    public function edit()
    {
        $user = Auth::user();

        return Inertia::render('vendor/profile/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
            ],
        ]);
    }

    /**
     * Update the vendor profile.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'], // Max 2MB
        ]);

        // Handle avatar removal
        if ($request->has('remove_avatar')) {
            if ($user->avatar_url) {
                // Delete old avatar file
                $oldPath = parse_url($user->avatar_url, PHP_URL_PATH);
                if ($oldPath) {
                    $oldFilename = basename($oldPath);
                    Storage::disk('public')->delete('avatars/' . $oldFilename);
                }

                // Remove avatar_url from database
                $user->update(['avatar_url' => null]);
            }
        }

        // Handle avatar upload
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            // Delete old avatar if exists
            if ($user->avatar_url) {
                $oldPath = parse_url($user->avatar_url, PHP_URL_PATH);
                if ($oldPath) {
                    $oldFilename = basename($oldPath);
                    Storage::disk('public')->delete('avatars/' . $oldFilename);
                }
            }

            // Store new avatar
            $avatar = $request->file('avatar');
            $filename = time() . '_' . $avatar->getClientOriginalName();
            $path = $avatar->storeAs('avatars', $filename, 'public');

            // Update user avatar_url
            $validated['avatar_url'] = Storage::url($path);
        }

        // Remove avatar from validated data since it's handled separately
        unset($validated['avatar']);

        $user->update($validated);

        return back()->with('success', 'Profil berhasil diperbarui!');
    }

    }