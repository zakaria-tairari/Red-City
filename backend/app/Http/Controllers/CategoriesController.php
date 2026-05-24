<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoriesController extends Controller
{
    public function index() {
        $categories = Cache::remember('categories', 3600, function () {
            $query = Category::with('places')->get();
            return $query;
        });

        return ApiResponse::success(
            "Categories retreived successfully", 
            CategoryResource::collection($categories),
        );
    }

    public function show(int $id) {
        $cacheKey = 'category_' . $id;

        $category = Cache::remember($cacheKey, 3600, function () use ($id) {
            $query = Category::with('places')->findOrFail($id);
            return $query;
        });

        return ApiResponse::success(
            "Category $id retreived successfully", 
            new CategoryResource($category),
        );
    }
}
