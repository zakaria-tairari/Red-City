<?php

namespace Database\Seeders;

use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoFavoritesSeeder extends Seeder
{
    public function run(): void
    {
        $places = Place::query()
            ->orderByDesc('avg_rating')
            ->orderBy('id')
            ->limit(18)
            ->pluck('id')
            ->values();

        if ($places->isEmpty()) {
            $this->command?->warn('No places found. Import or seed places before running demo favorites.');

            return;
        }

        $favoritePlans = [
            'demo@example.com' => [0, 1, 2, 3, 6, 8],
            'layla@example.com' => [1, 4, 5, 7, 10],
            'youssef@example.com' => [0, 2, 4, 9, 12],
            'amina@example.com' => [3, 5, 6, 11, 13],
            'nora@example.com' => [2, 7, 8, 14],
            'mehdi@example.com' => [0, 6, 9, 15, 16],
            'sara@example.com' => [1, 3, 10, 12, 17],
        ];

        foreach ($favoritePlans as $email => $indexes) {
            $user = User::query()->where('email', $email)->first();

            if (! $user) {
                continue;
            }

            $placeIds = collect($indexes)
                ->map(fn (int $index) => $places[$index % $places->count()])
                ->unique()
                ->values()
                ->all();

            $user->favoritePlaces()->syncWithoutDetaching($placeIds);
        }
    }
}
