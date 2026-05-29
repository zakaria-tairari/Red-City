<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Media;
use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function stats()
    {
        $placesCount = Place::count();
        $reviewsCount = Review::count();
        $usersCount = User::count();
        $mediaCount = Media::count();

        $mediaStats = Media::query()
            ->select('storage_status', DB::raw('count(*) as count'))
            ->groupBy('storage_status')
            ->pluck('count', 'storage_status');

        $mediaDone = (int) ($mediaStats['done'] ?? 0);
        $placesWithoutTags = Place::where('tags_generated', false)->count();
        $placesWithoutTranslations = Place::where('translated', false)->count();
        $placesWithoutMedia = Place::doesntHave('media')->count();
        $placesWithRatings = Place::where('avg_rating', '>', 0)->count();
        $averageRating = round((float) Place::where('avg_rating', '>', 0)->avg('avg_rating'), 1);

        $reviewsByDay = Review::query()
            ->where('created_at', '>=', Carbon::now()->subDays(13)->startOfDay())
            ->get(['created_at'])
            ->groupBy(fn ($review) => $review->created_at->format('Y-m-d'))
            ->map->count();

        $reviewTrend = collect(range(13, 0))
            ->map(function ($daysAgo) use ($reviewsByDay) {
                $date = Carbon::now()->subDays($daysAgo);

                return [
                    'date' => $date->format('M j'),
                    'count' => $reviewsByDay[$date->format('Y-m-d')] ?? 0,
                ];
            })
            ->values();

        $ratingDistribution = collect(range(5, 1))
            ->map(fn ($rating) => [
                'rating' => "{$rating} star",
                'count' => Review::where('rating', $rating)->count(),
            ])
            ->values();

        $topCategories = Category::query()
            ->withCount('places')
            ->orderByDesc('places_count')
            ->limit(6)
            ->get(['id', 'name', 'code'])
            ->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'code' => $category->code,
                'places' => $category->places_count,
            ]);

        $topAreas = Place::query()
            ->select('area', DB::raw('count(*) as count'))
            ->whereNotNull('area')
            ->where('area', '!=', '')
            ->groupBy('area')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(fn ($area) => [
                'area' => $area->area,
                'count' => (int) $area->count,
            ]);

        return ApiResponse::success('Admin stats retrieved', [
            'places' => $placesCount,
            'categories' => Category::count(),
            'reviews' => $reviewsCount,
            'users' => $usersCount,
            'admins' => User::where('role', 'admin')->count(),
            'average_rating' => $averageRating,
            'places_with_ratings' => $placesWithRatings,
            'places_without_tags' => $placesWithoutTags,
            'places_without_translations' => $placesWithoutTranslations,
            'places_without_media' => $placesWithoutMedia,
            'health' => [
                'tagged_percent' => $placesCount ? round((($placesCount - $placesWithoutTags) / $placesCount) * 100) : 0,
                'translated_percent' => $placesCount ? round((($placesCount - $placesWithoutTranslations) / $placesCount) * 100) : 0,
                'media_coverage_percent' => $placesCount ? round((($placesCount - $placesWithoutMedia) / $placesCount) * 100) : 0,
                'rated_percent' => $placesCount ? round(($placesWithRatings / $placesCount) * 100) : 0,
                'media_done_percent' => $mediaCount ? round(($mediaDone / $mediaCount) * 100) : 0,
            ],
            'media' => [
                'total' => $mediaCount,
                'pending' => $mediaStats['pending'] ?? 0,
                'processing' => $mediaStats['processing'] ?? 0,
                'done' => $mediaDone,
                'failed' => $mediaStats['failed'] ?? 0,
            ],
            'review_trend' => $reviewTrend,
            'rating_distribution' => $ratingDistribution,
            'top_categories' => $topCategories,
            'top_areas' => $topAreas,
            'recent_reviews' => Review::with('user:id,username,first_name', 'place:id,name')
                ->latest()
                ->limit(5)
                ->get(),
            'recent_places' => Place::with('category:id,name')
                ->latest()
                ->limit(5)
                ->get(['id', 'category_id', 'name', 'area', 'avg_rating', 'created_at']),
        ]);
    }
}
