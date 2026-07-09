<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::create(['name' => 'admin']);
        $employeeRole = Role::create(['name' => 'employee']);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole($adminRole);

        // Create a few employee users
        $employees = [
            ['name' => 'Alice Employee', 'email' => 'alice@example.com'],
            ['name' => 'Bob Employee', 'email' => 'bob@example.com'],
            ['name' => 'Carla Employee', 'email' => 'carla@example.com'],
        ];

        foreach ($employees as $employee) {
            $user = User::create(array_merge($employee, ['password' => bcrypt('password')]));
            $user->assignRole($employeeRole);
        }
    }
}
