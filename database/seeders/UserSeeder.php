<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get roles
        $adminRole = Role::where('name', 'Admin')->first();
        User::create([
            'name' => 'Administrator',
            'email' => 'bahana@admin.com',
            'password' => Hash::make('bahana@admin.com'),
            'role_id' => $adminRole->id,
            'status' => 'active'
        ]);
    }
}
