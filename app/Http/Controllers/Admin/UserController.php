<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MitraProfile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users by role.
     */
    public function index(Request $request, $roleName)
    {
        $role = Role::where('name', $roleName)->firstOrFail();

        $users = User::with('role')
            ->where('role_id', $role->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'role' => $role,
            'roleName' => $roleName
        ]);
    }

    /**
     * Show the form for creating a new user for specific role.
     */
    public function create($roleName)
    {
        $role = Role::where('name', $roleName)->firstOrFail();

        $data = ['role' => $role];

        // Jika role adalah Mitra, tambahkan data tambahan
        if ($roleName === 'Mitra') {
            $data['mitraUsers'] = User::whereHas('role', function($query) {
                $query->where('name', 'Mitra');
            })->whereDoesntHave('mitraProfile')->get();
        }

        return Inertia::render('admin/users/create', $data);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request, $roleName)
    {
        $role = Role::where('name', $roleName)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role_id' => $role->id,
            'status' => 'active'
        ]);

        // Jika role adalah Mitra, buat juga profil mitra
        if ($roleName === 'Mitra') {
            $mitraData = $request->validate([
                'hotel_name' => 'required|string|max:255',
                'address' => 'required|string',
                'distance_from_warehouse' => 'required|numeric|min:0',
                // 'city' => 'required|string|max:100',
                'phone' => 'nullable|string|max:20',
                // 'partner_tier' => 'required|in:premium,standard,basic',
                // 'commission_rate' => 'required|numeric|min:0|max:100'
            ]);

            // Distance is already converted to meters by frontend, no conversion needed

            $mitraData['user_id'] = $user->id;
            $mitraData['unique_code'] = 'MITRA-' . Str::upper(Str::random(8));

            MitraProfile::create($mitraData);
        }

        return redirect()->route('admin.users.index', ['role' => $roleName])
            ->with('success', 'User berhasil dibuat');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit($roleName, User $user)
    {
        $role = Role::where('name', $roleName)->firstOrFail();

        $data = [
            'user' => $user->load('role'),
            'role' => $role
        ];

        // Jika role adalah Mitra, tambahkan data profil mitra
        if ($roleName === 'Mitra') {
            $data['mitraProfile'] = MitraProfile::where('user_id', $user->id)->first();
        }

        return Inertia::render('admin/users/edit', $data);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, $roleName, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'status' => 'required|in:active,inactive',
        ]);

        $user->update($validated);

        // Jika role adalah Mitra, update juga profil mitra
        if ($roleName === 'Mitra') {
            $mitraProfile = MitraProfile::where('user_id', $user->id)->first();

            if ($mitraProfile) {
                $mitraData = $request->validate([
                    'hotel_name' => 'required|string|max:255',
                    'address' => 'required|string',
                    'distance_from_warehouse' => 'required|numeric|min:0',
                    // 'city' => 'required|string|max:100',
                    'phone' => 'nullable|string|max:20',
                    // 'partner_tier' => 'required|in:premium,standard,basic',
                    // 'commission_rate' => 'required|numeric|min:0|max:100'
                ]);

                // Distance is already converted to meters by frontend, no conversion needed

                $mitraProfile->update($mitraData);
            }
        }

        return redirect()->route('admin.users.index', ['role' => $roleName])
            ->with('success', 'User berhasil diperbarui');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($roleName, User $user)
    {
        // Prevent admin from deleting themselves
        if ($roleName === 'Admin' && auth()->id() === $user->id) {
            return redirect()->route('admin.users.index', ['role' => $roleName])
                ->with('error', 'Anda tidak dapat menghapus akun Anda sendiri');
        }

        // Jika role adalah Mitra, hapus juga profil mitra
        if ($roleName === 'Mitra') {
            MitraProfile::where('user_id', $user->id)->delete();
        }

        $user->delete();

        return redirect()->route('admin.users.index', ['role' => $roleName])
            ->with('success', 'User berhasil dihapus');
    }
}
