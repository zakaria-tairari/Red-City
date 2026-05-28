<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Place;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewsController extends Controller
{
    public function index(int $placeId)
    {
        $reviews = Review::with('user')->where('place_id', $placeId)->latest()->get();
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

        $review = new Review();
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

        return ApiResponse::success('Review submitted successfully', $review);
    }

    public function userReviews(Request $request)
    {
        $user = $request->user();
        $reviews = Review::with('place.media')->where('user_id', $user->id)->latest()->get();
        return ApiResponse::success('User reviews retrieved successfully', $reviews);
    }
}
