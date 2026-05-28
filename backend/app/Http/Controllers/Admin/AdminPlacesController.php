<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\PlaceListResource;
use App\Http\Resources\PlaceResource;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminPlacesController extends Controller
{
    public function index(Request $request)
    {
        $query = Place::with('category', 'media', 'tags')
            ->withCount('reviews');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('area', 'like', "%{$search}%")
                    ->orWhere('document_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        $places = $query->orderByDesc('updated_at')
            ->paginate($request->limit ?? 20);

        return ApiResponse::success('Places retrieved', [
            'items' => PlaceListResource::collection($places->items()),
            'total' => $places->total(),
            'current_page' => $places->currentPage(),
            'last_page' => $places->lastPage(),
            'per_page' => $places->perPage(),
        ]);
    }

    public function show(int $id)
    {
        $place = Place::with('category', 'media', 'tags', 'translations')
            ->withCount('reviews')
            ->findOrFail($id);

        return ApiResponse::success('Place retrieved', new PlaceResource($place));
    }

    public function update(Request $request, int $id)
    {
        $place = Place::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'area' => 'nullable|string|max:150',
            'address' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lon' => 'nullable|numeric',
            'summary' => 'nullable|string',
            'description' => 'nullable|string',
            'translations' => 'sometimes|array',
            'translations.*.summary' => 'nullable|string',
            'translations.*.description' => 'nullable|string',
        ]);

        $translations = $data['translations'] ?? null;
        unset($data['translations']);

        $place->update($data);

        if ($translations) {
            foreach ($translations as $language => $fields) {
                $place->translations()->updateOrCreate(
                    ['language' => $language],
                    [
                        'summary' => $fields['summary'] ?? null,
                        'description' => $fields['description'] ?? null,
                    ]
                );
            }
        }

        $this->clearPlaceCache($place->id);

        $place->load('category', 'media', 'tags', 'translations');
        $place->loadCount('reviews');

        return ApiResponse::success('Place updated', new PlaceResource($place));
    }

    public function destroy(int $id)
    {
        $place = Place::findOrFail($id);
        $place->delete();
        $this->clearPlaceCache($id);

        return ApiResponse::success('Place deleted');
    }

    private function clearPlaceCache(int $id): void
    {
        Cache::forget('place_' . $id);
        Cache::forget('place_related_' . $id);
        Cache::forget('featured_places');
    }
}
