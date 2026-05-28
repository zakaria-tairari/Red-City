<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminReviewsController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user:id,username,first_name,last_name,email', 'place:id,name']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('place', fn ($p) => $p->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('user', fn ($u) => $u->where('username', 'like', "%{$search}%"));
            });
        }

        $reviews = $query->latest()->paginate($request->limit ?? 20);

        return ApiResponse::success('Reviews retrieved', [
            'items' => $reviews->items(),
            'total' => $reviews->total(),
            'current_page' => $reviews->currentPage(),
            'last_page' => $reviews->lastPage(),
            'per_page' => $reviews->perPage(),
        ]);
    }

    public function destroy(int $id)
    {
        $review = Review::findOrFail($id);
        $placeId = $review->place_id;
        $review->delete();

        $place = Place::find($placeId);
        if ($place) {
            $avgRating = Review::where('place_id', $placeId)->avg('rating') ?? 0;
            $place->avg_rating = round($avgRating, 1);
            $place->save();
            Cache::forget('place_' . $placeId);
        }

        return ApiResponse::success('Review deleted');
    }
}
