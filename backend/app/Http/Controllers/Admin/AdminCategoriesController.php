<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminCategoriesController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('places')->orderBy('name')->get();

        return ApiResponse::success(
            'Categories retrieved',
            CategoryResource::collection($categories)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:categories,code',
        ]);

        $category = Category::create($data);
        $this->bumpCategoryCache();

        return ApiResponse::success('Category created', new CategoryResource($category), 201);
    }

    public function update(Request $request, int $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:100|unique:categories,code,' . $id,
        ]);

        $category->update($data);
        $this->bumpCategoryCache();

        return ApiResponse::success('Category updated', new CategoryResource($category->loadCount('places')));
    }

    public function destroy(int $id)
    {
        $category = Category::findOrFail($id);

        if ($category->places()->exists()) {
            return ApiResponse::error('Cannot delete a category that has places assigned.', 422);
        }

        $category->delete();
        $this->bumpCategoryCache();

        return ApiResponse::success('Category deleted');
    }

    private function bumpCategoryCache(): void
    {
        Cache::forever('categories_cache_version', (int) Cache::get('categories_cache_version', 1) + 1);
        Cache::forever('places_cache_version', (int) Cache::get('places_cache_version', 1) + 1);
        Cache::forever('tags_cache_version', (int) Cache::get('tags_cache_version', 1) + 1);
    }
}
