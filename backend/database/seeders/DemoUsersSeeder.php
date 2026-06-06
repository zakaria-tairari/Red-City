<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        $users = [
            [
                'username' => 'Admin',
                'first_name' => 'Zakaria',
                'last_name' => 'Tairari',
                'email' => 'admin@example.com',
                'role' => 'admin',
            ],
            [
                'username' => 'demo_user',
                'first_name' => 'Demo',
                'last_name' => 'User',
                'email' => 'demo@example.com',
                'role' => 'user',
            ],
            [
                'username' => 'layla_travels',
                'first_name' => 'Layla',
                'last_name' => 'Bennani',
                'email' => 'layla@example.com',
                'role' => 'user',
            ],
            [
                'username' => 'youssef_foodie',
                'first_name' => 'Youssef',
                'last_name' => 'El Mansouri',
                'email' => 'youssef@example.com',
                'role' => 'user',
            ],
            [
                'username' => 'amina_explorer',
                'first_name' => 'Amina',
                'last_name' => 'Zahraoui',
                'email' => 'amina@example.com',
                'role' => 'user',
            ],
            [
                'username' => 'nora_weekends',
                'first_name' => 'Nora',
                'last_name' => 'Saidi',
                'email' => 'nora@example.com',
                'role' => 'user',
            ],
            [
                'username' => 'mehdi_local',
                'first_name' => 'Mehdi',
                'last_name' => 'Rami',
                'email' => 'mehdi@example.com',
                'role' => 'user',
            ],
            [
                'username' => 'sara_stays',
                'first_name' => 'Sara',
                'last_name' => 'Idrissi',
                'email' => 'sara@example.com',
                'role' => 'user',
            ],
        ];

        foreach ($users as $user) {
            User::query()->updateOrCreate(
                ['email' => $user['email']],
                [
                    ...$user,
                    'password' => $password,
                    'email_verified_at' => now(),
                ],
            );
        }
    }
}
