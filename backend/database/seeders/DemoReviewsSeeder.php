<?php

namespace Database\Seeders;

use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoReviewsSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()
            ->whereIn('email', [
                'demo@example.com',
                'layla@example.com',
                'youssef@example.com',
                'amina@example.com',
                'nora@example.com',
                'mehdi@example.com',
                'sara@example.com',
                'admin@example.com',
            ])
            ->orderByRaw("CASE WHEN email = 'admin@example.com' THEN 0 ELSE 1 END")
            ->get()
            ->values();

        $places = Place::query()
            ->orderBy('id')
            ->limit(24)
            ->get(['id', 'name']);

        if ($users->count() < 3 || $places->isEmpty()) {
            $this->command?->warn('Demo reviews need at least three demo users and one place.');

            return;
        }

        $comments = [
            5 => [
                'A polished experience from start to finish. The place feels memorable, welcoming, and easy to recommend.',
                'Beautiful atmosphere, thoughtful service, and exactly the kind of stop I would add to a Marrakech itinerary.',
                'Everything felt well organized and authentic. I would happily come back with friends.',
            ],
            4 => [
                'Very good overall, with a few small details that could be smoother during busy hours.',
                'A strong choice if you want something reliable, local, and pleasant without overplanning.',
                'Great location and warm staff. The experience matched the expectations.',
            ],
            3 => [
                'Good experience, though a couple of details felt inconsistent compared with the stronger places nearby.',
                'Worth visiting if you are already in the area, but I would not plan the whole day around it.',
            ],
        ];

        $ratingPattern = [5, 5, 4, 5, 4, 4, 3, 5];
        $affectedPlaceIds = [];

        foreach ($places as $placeIndex => $place) {
            $reviewsForPlace = min($users->count(), 4 + ($placeIndex % 3));

            for ($offset = 0; $offset < $reviewsForPlace; $offset++) {
                $user = $users[($placeIndex + $offset) % $users->count()];
                $rating = $ratingPattern[($placeIndex + $offset) % count($ratingPattern)];
                $commentOptions = $comments[$rating];

                $review = Review::query()
                    ->where('user_id', $user->id)
                    ->where('place_id', $place->id)
                    ->first() ?? new Review;

                $review->user_id = $user->id;
                $review->place_id = $place->id;
                $review->rating = $rating;
                $review->comment = $commentOptions[($placeIndex + $offset) % count($commentOptions)];
                $review->created_at = Carbon::now()->subDays(($placeIndex * 2) + $offset);
                $review->updated_at = $review->created_at;
                $review->save();

                $affectedPlaceIds[] = $place->id;
            }
        }

        Place::query()
            ->whereIn('id', array_unique($affectedPlaceIds))
            ->get()
            ->each(function (Place $place) {
                $place->avg_rating = round((float) $place->reviews()->avg('rating'), 1);
                $place->save();
            });
    }
}
