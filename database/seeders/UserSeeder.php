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
        $vendorRole = Role::where('name', 'Vendor')->first();
        $mitraRole = Role::where('name', 'Mitra')->first();

        // Create admin user
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@bahana.id',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'status' => 'active'
        ]);

        // Create vendor user
        User::create([
            'name' => 'UMKM Local Vendor',
            'email' => 'vendor@bahana.id',
            'password' => Hash::make('password'),
            'role_id' => $vendorRole->id,
            'status' => 'active'
        ]);

        // Create mitra user
        User::create([
            'name' => 'Hotel Partner',
            'email' => 'mitra@bahana.id',
            'password' => Hash::make('password'),
            'role_id' => $mitraRole->id,
            'status' => 'active'
        ]);
    }
}
