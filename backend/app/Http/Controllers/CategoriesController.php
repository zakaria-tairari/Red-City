<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoriesController extends Controller
{
    public function index() {
        $categories = Cache::remember('categories', 3600, function () {
            return Category::with('places')->get()->toArray();
        });

        return ApiResponse::success('Categories retreived successfully', $categories);
    }

    public function show(int $id) {
        $cacheKey = 'category_' . $id;

        $category = Cache::remember($cacheKey, 3600, function () use ($id) {
            return Category::with('places')->findOrFail($id)->toArray();
        });

        return ApiResponse::success("Category $id retreived successfully", $category);
    }
}
