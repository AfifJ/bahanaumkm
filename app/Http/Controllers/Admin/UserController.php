<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
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
        
        return Inertia::render('admin/users/create', [
            'role' => $role
        ]);
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

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role_id' => $role->id,
            'status' => 'active'
        ]);

        return redirect()->route('admin.users.index', ['role' => $roleName])
            ->with('success', 'User berhasil dibuat');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit($roleName, User $user)
    {
        $role = Role::where('name', $roleName)->firstOrFail();
        
        return Inertia::render('admin/users/edit', [
            'user' => $user->load('role'),
            'role' => $role
        ]);
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

        return redirect()->route('admin.users.index', ['role' => $roleName])
            ->with('success', 'User berhasil diperbarui');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($roleName, User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index', ['role' => $roleName])
            ->with('success', 'User berhasil dihapus');
    }
}
