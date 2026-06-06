<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\PlaceListResource;
use App\Http\Resources\PlaceResource;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminPlacesController extends Controller
{
    public function index(Request $request)
    {
        $query = Place::with('category', 'media', 'tags')
            ->withCount([
                'reviews',
                'media',
                'media as failed_media_count' => fn ($q) => $q->where('storage_status', 'failed'),
            ]);

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

        if ($request->filled('quality')) {
            match ($request->quality) {
                'missing_tags' => $query->where('tags_generated', false),
                'missing_translations' => $query->where('translated', false),
                'missing_media' => $query->doesntHave('media'),
                'failed_media' => $query->whereHas('media', fn ($q) => $q->where('storage_status', 'failed')),
                default => null,
            };
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

    public function store(Request $request)
    {
        $data = $this->validatedPlaceData($request);
        $translations = $data['translations'] ?? null;
        $media = $data['media'] ?? [];
        unset($data['translations'], $data['media']);

        $data['document_id'] = $data['document_id'] ?? $this->makeDocumentId($data['name']);

        $place = Place::create($data);
        $this->syncTranslations($place, $translations);
        $this->syncMedia($place, $media);
        $this->clearPlaceCache($place->id);

        $place->load('category', 'media', 'tags', 'translations');
        $place->loadCount('reviews');

        return ApiResponse::success('Place created', new PlaceResource($place), 201);
    }

    public function update(Request $request, int $id)
    {
        $place = Place::findOrFail($id);

        $data = $this->validatedPlaceData($request, $place->id);

        $translations = $data['translations'] ?? null;
        $media = $data['media'] ?? null;
        unset($data['translations'], $data['media']);

        $place->update($data);
        $this->syncTranslations($place, $translations);

        if (is_array($media)) {
            $this->syncMedia($place, $media);
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

    private function validatedPlaceData(Request $request, ?int $placeId = null): array
    {
        $documentRule = 'sometimes|string|max:255|unique:places,document_id';
        if ($placeId) {
            $documentRule .= ','.$placeId;
        }

        return $request->validate([
            'document_id' => $documentRule,
            'name' => ($placeId ? 'sometimes' : 'required').'|required|string|max:255',
            'category_id' => ($placeId ? 'sometimes' : 'required').'|required|exists:categories,id',
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
            'media' => 'sometimes|array',
            'media.*.id' => 'nullable|integer|exists:media,id',
            'media.*.type' => 'required_with:media|in:image,video',
            'media.*.original_url' => 'nullable|string|max:2048',
            'media.*.app_url' => 'nullable|string|max:2048',
            'media.*.file' => 'nullable|file|mimes:jpg,jpeg,png,webp,gif,mp4,webm,mov|max:51200',
            'media.*.position' => 'nullable|integer|min:0',
            'media.*.storage_status' => 'nullable|in:pending,processing,done,failed',
        ]);
    }

    private function syncTranslations(Place $place, ?array $translations): void
    {
        if (! $translations) {
            return;
        }

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

    private function syncMedia(Place $place, array $mediaItems): void
    {
        $keptIds = [];

        foreach (array_values($mediaItems) as $index => $item) {
            $uploadedPath = null;

            if (isset($item['file'])) {
                $uploadedPath = $item['file']->store("places/{$place->id}", 'public');
            }

            $values = [
                'type' => $item['type'] ?? 'image',
                'original_url' => $item['original_url'] ?? ($uploadedPath ? Storage::disk('public')->url($uploadedPath) : null),
                'position' => $item['position'] ?? $index,
                'storage_status' => $uploadedPath ? 'done' : ($item['storage_status'] ?? 'pending'),
            ];

            if ($uploadedPath) {
                $values['app_url'] = $uploadedPath;
                $values['ext'] = $item['file']->getClientOriginalExtension();
                $values['mime'] = $item['file']->getMimeType();
            } elseif (array_key_exists('app_url', $item)) {
                $values['app_url'] = $item['app_url'];
            }

            $media = $place->media()->updateOrCreate(
                ['id' => $item['id'] ?? null],
                $values
            );

            $keptIds[] = $media->id;
        }

        $place->media()
            ->when(count($keptIds) > 0, fn ($query) => $query->whereNotIn('id', $keptIds))
            ->delete();
    }

    private function makeDocumentId(string $name): string
    {
        $base = Str::slug($name) ?: 'place';
        $documentId = $base;
        $suffix = 2;

        while (Place::where('document_id', $documentId)->exists()) {
            $documentId = $base.'-'.$suffix;
            $suffix++;
        }

        return $documentId;
    }

    private function clearPlaceCache(int $id): void
    {
        Cache::forget('place_'.$id);
        Cache::forget('place_related_'.$id);
        Cache::forget('featured_places');
        Cache::forever('places_cache_version', (int) Cache::get('places_cache_version', 1) + 1);
        Cache::forever('tags_cache_version', (int) Cache::get('tags_cache_version', 1) + 1);
    }
}
