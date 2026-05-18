<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PlacesController extends Controller
{
    public function index(Request $request) {
        $cacheKey = 'places_' . md5(json_encode([
            'category' => $request->category,
            'search' => $request->search,
        ]));

        $places = Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Place::with('category', 'media', 'tags');

            if ($request->filled('category')) {
                $query->where('category_id', $request->category);
            }
    
            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('summary', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
                });
            }

            return $query->get()->toArray();
        });

        return ApiResponse::success('Places retreived successfully', $places);
    }

    public function show(int $id) {
        $cacheKey = 'place_' . $id;

        $place = Cache::remember($cacheKey, 3600, function () use ($id) {
            return Place::with('category', 'media', 'tags')->findOrFail($id)->toArray();
        });

        return ApiResponse::success("Place $id retreived successfully", $place);
    }
}
