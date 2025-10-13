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
        ]);

        $user->update($validated);

        return back()->with('success', 'Profil berhasil diperbarui!');
    }

    /**
     * Update the vendor avatar.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'], // Max 2MB
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->avatar_url) {
            // Extract filename from path
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
        $user->update([
            'avatar_url' => Storage::url($path),
        ]);

        return back()->with('success', 'Foto profil berhasil diperbarui!');
    }

    /**
     * Remove the vendor avatar.
     */
    public function removeAvatar()
    {
        $user = Auth::user();

        if ($user->avatar_url) {
            // Delete file from storage
            $oldPath = parse_url($user->avatar_url, PHP_URL_PATH);
            if ($oldPath) {
                $oldFilename = basename($oldPath);
                Storage::disk('public')->delete('avatars/' . $oldFilename);
            }

            // Remove avatar_url from database
            $user->update(['avatar_url' => null]);
        }

        return back()->with('success', 'Foto profil berhasil dihapus!');
    }
}