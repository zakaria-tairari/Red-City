<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\PlaceListResource;
use App\Http\Resources\PlaceResource;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PlacesController extends Controller
{
    public function index(Request $request) {
        $cacheKey = 'places_' . md5(json_encode([
            'category' => $request->category,
            'query' => $request->query,
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

            if ($request->filled('query')) {
                $query->where('name', 'LIKE', "%{$request->query}%");
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

            return $query->paginate($request->limit ?? 12);
        });

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
            'query' => $request->query,
            'sortBy' => $request->sortBy,
            'limit' => $request->limit,
        ]));

        $places = Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Place::with('category', 'media', 'tags')
                ->withCount('reviews');

            if ($request->filled('category')) {
                $query->where('category_id', $request->category);
            }

            if ($request->filled('query')) {
                $query->where('name', 'LIKE', "%{$request->query}%");
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

            $limit = $request->limit ?? 12;

            return $query->limit($limit)->get();
        });

        return ApiResponse::success(
            'Places retrieved successfully',
            PlaceListResource::collection($places),
        );
    }

    public function show(int $id) {
        $cacheKey = 'place_' . $id;

        $place = Cache::remember($cacheKey, 3600, function () use ($id) {
            $query = Place::with('category', 'media', 'tags', 'translations')->findOrFail($id);
            return $query;
        });

        return ApiResponse::success(
            "Place $id retreived successfully", 
            new PlaceResource($place),
        );
    }

    public function featured() {
        $places = Cache::remember('featured_places', 3600, function () {
            $query = Place::with('category', 'media', 'tags')->limit(5);

            return $query->get();
        });

        return ApiResponse::success(
            'Places retreived successfully', 
            PlaceListResource::collection($places),
        );
    }

    public function related(int $id) {
        $cacheKey = 'place_related_' . $id;

        $places = Cache::remember($cacheKey, 3600, function () use ($id) {

            $place = Place::with('tags')->findOrFail($id);
            $tagIds = $place->tags->pluck('id');

            $rankedIds = Place::query()
                ->where('places.id', '!=', $id)
                ->whereHas('tags', function ($q) use ($tagIds) {
                    $q->whereIn('tags.id', $tagIds);
                })
                ->join('place_tag', 'places.id', '=', 'place_tag.place_id')
                ->whereIn('place_tag.tag_id', $tagIds)
                ->select('places.id')
                ->selectRaw('SUM(place_tag.score) as relevance_score')
                ->groupBy('places.id')
                ->orderByDesc('relevance_score')
                ->limit(10)
                ->pluck('places.id');

            return Place::with('category', 'media', 'tags')
                ->whereIn('id', $rankedIds)
                ->get();
        });

        return ApiResponse::success(
            'Related places retrieved successfully',
            PlaceListResource::collection($places),
        );
    }
}
