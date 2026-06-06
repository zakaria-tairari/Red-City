<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Place;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ReviewsController extends Controller
{
    public function index(int $placeId)
    {
        $reviews = Review::with('user')
            ->where('place_id', $placeId)
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->orderByRaw("CASE WHEN users.role = 'admin' THEN 0 ELSE 1 END")
            ->orderBy('reviews.created_at', 'desc')
            ->select('reviews.*')
            ->get();

        return ApiResponse::success('Reviews retrieved successfully', $reviews);
    }

    public function store(Request $request, int $placeId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        $place = Place::findOrFail($placeId);

        if (Review::where('user_id', $user->id)->where('place_id', $placeId)->exists()) {
            return ApiResponse::error('You have already reviewed this place.', 400);
        }

        $review = new Review;
        $review->user_id = $user->id;
        $review->place_id = $placeId;
        $review->rating = $request->rating;
        $review->comment = $request->comment;
        $review->save();

        // Update place average rating
        $avgRating = Review::where('place_id', $placeId)->avg('rating');
        $place->avg_rating = round($avgRating, 1);
        $place->save();

        $review->load('user');
        Cache::flush();

        return ApiResponse::success('Review submitted successfully', $review);
    }

    public function update(Request $request, int $reviewId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $review = Review::findOrFail($reviewId);

        if ($review->user_id !== $request->user()->id) {
            return ApiResponse::error('You can only edit your own reviews.', 403);
        }

        $review->rating = $request->rating;
        $review->comment = $request->comment;
        $review->save();

        // Update place average rating
        $avgRating = Review::where('place_id', $review->place_id)->avg('rating');
        $place = Place::find($review->place_id);
        if ($place) {
            $place->avg_rating = round($avgRating, 1);
            $place->save();
        }

        $review->load('user');
        Cache::flush();

        return ApiResponse::success('Review updated successfully', $review);
    }

    public function destroy(Request $request, int $reviewId)
    {
        $review = Review::findOrFail($reviewId);

        if ($review->user_id !== $request->user()->id) {
            return ApiResponse::error('You can only delete your own reviews.', 403);
        }

        $placeId = $review->place_id;
        $review->delete();

        // Update place average rating
        $place = Place::find($placeId);
        if ($place) {
            $avgRating = Review::where('place_id', $placeId)->avg('rating') ?? 0;
            $place->avg_rating = round($avgRating, 1);
            $place->save();
        }

        Cache::flush();

        return ApiResponse::success('Review deleted successfully');
    }

    public function userReviews(Request $request)
    {
        $user = $request->user();
        $reviews = Review::with('place.media')->where('user_id', $user->id)->latest()->get();

        return ApiResponse::success('User reviews retrieved successfully', $reviews);
    }
}
