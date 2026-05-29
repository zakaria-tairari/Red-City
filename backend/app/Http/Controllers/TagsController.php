<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TagsController extends Controller
{
    public function index(Request $request) {
        $cacheKey = 'tags_' . md5(json_encode([
            'version' => Cache::get('tags_cache_version', 1),
            'category' => $request->category,
        ]));

        $tags = Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Tag::query()
                ->withCount('places')
                ->orderByDesc('places_count')
                ->orderBy('name');

            if ($request->filled('category')) {
                $query->where(function ($q) use ($request) {
                    $q->where('category_id', $request->category)
                        ->orWhereNull('category_id');
                });
            }

            return $query->get();
        });

        return ApiResponse::success(
            'Tags retrieved successfully',
            TagResource::collection($tags),
        );
    }
}
