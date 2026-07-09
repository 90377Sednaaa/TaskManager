<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee']);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin User', 'password' => bcrypt('password')]
        );
        $admin->assignRole($adminRole);

        // Create a few employee users
        $employees = [
            ['name' => 'Alice Employee', 'email' => 'alice@example.com'],
            ['name' => 'Bob Employee', 'email' => 'bob@example.com'],
            ['name' => 'Carla Employee', 'email' => 'carla@example.com'],
            ['name' => 'Lean Adrian Murillo', 'email' => 'leanmurillo0201@gmail.com'],   // new
            ['name' => 'Maria Clara', 'email' => 'maria@example.com'],
        ];

        foreach ($employees as $employee) {
            $user = User::firstOrCreate(
                ['email' => $employee['email']],
                ['name' => $employee['name'], 'password' => bcrypt('password')]
            );
            $user->assignRole($employeeRole);
        }
    }
}
