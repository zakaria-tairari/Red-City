<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\PlaceListResource;
use Illuminate\Http\Request;

class FavoritesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $favorites = $user->favoritePlaces()
            ->with(['category', 'media', 'tags'])
            ->withCount('reviews')
            ->orderByDesc('avg_rating')
            ->get();

        return ApiResponse::success(
            'Favorites retrieved successfully',
            PlaceListResource::collection($favorites),
        );
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        $user = $request->user();
        $placeId = $request->place_id;

        $favorites = $user->favoritePlaces();

        $changes = $favorites->toggle($placeId);
        $isFav = count($changes['attached']) > 0;

        return ApiResponse::success('Favorite toggled successfully', ['is_favorite' => $isFav]);
    }
}
