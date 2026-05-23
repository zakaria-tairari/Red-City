<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\PlaceListResource;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PlacesController extends Controller
{
    public function index(Request $request) {
        $cacheKey = 'places_' . md5(json_encode([
            'category' => $request->category,
            'q' => $request->q,
            'sortBy' => $request->sortBy,
            'limit' => $request->limit,
            'page' => $request->page,
        ]));

        $places = Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Place::with('category', 'media', 'tags')
                ->withCount('reviews');

            if ($request->filled('category')) {
                $query->where('category_id', $request->category);
            }

            if ($request->filled('q')) {
                $query->where('name', 'LIKE', "%{$request->q}%");
            }

            if ($request->filled('sortBy')) {
                switch ($request->sortBy) {
                    //TODO: case 'rating'
                    
                    case 'reviews':
                        $query->orderByDesc('reviews_count');
                        break;

                    case 'name':
                        $query->orderBy('name');
                        break;

                    default:
                        $query->latest();
                        break;
                }
            }

            return serialize($query->paginate($request->limit ?? 12));
        });

        $places = unserialize($places);

        return ApiResponse::success(
            'Places retrieved successfully',
            [
                'items' => PlaceListResource::collection($places->items()),
                'total' => $places->total(),
                'current_page' => $places->currentPage(),
                'last_page' => $places->lastPage(),
                'per_page' => $places->perPage(),
            ]
        );
    }

    public function all(Request $request) {
        $cacheKey = 'places_' . md5(json_encode([
            'category' => $request->category,
            'q' => $request->q,
            'sortBy' => $request->sortBy,
            'limit' => $request->limit,
        ]));

        $places = Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Place::with('category', 'media', 'tags')
                ->withCount('reviews');

            if ($request->filled('category')) {
                $query->where('category_id', $request->category);
            }

            if ($request->filled('q')) {
                $query->where('name', 'LIKE', "%{$request->q}%");
            }

            if ($request->filled('sortBy')) {
                switch ($request->sortBy) {
                    //TODO: case 'rating'
                    
                    case 'reviews':
                        $query->orderByDesc('reviews_count');
                        break;

                    case 'name':
                        $query->orderBy('name');
                        break;

                    default:
                        $query->latest();
                        break;
                }
            }

            return serialize($query->get());
        });

        $places = unserialize($places);

        return ApiResponse::success(
            'Places retrieved successfully',
            PlaceListResource::collection($places),
        );
    }

    public function show(int $id) {
        $cacheKey = 'place_' . $id;

        $place = Cache::remember($cacheKey, 3600, function () use ($id) {
            $query = Place::with('category', 'media', 'tags')->findOrFail($id);
            return serialize($query);
        });

        return ApiResponse::success(
            "Place $id retreived successfully", 
            new PlaceListResource(unserialize($place)),
        );
    }

    public function featured() {
        $places = Cache::remember('featured_places', 3600, function () {
            $query = 
            Place::with('category', 'media', 'tags')
                ->limit(5);

            return serialize($query->get());
        });

        return ApiResponse::success(
            'Places retreived successfully', 
            PlaceListResource::collection(unserialize($places)),
        );
    }
}
