<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

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

        return ApiResponse::success('Category updated', new CategoryResource($category->loadCount('places')));
    }

    public function destroy(int $id)
    {
        $category = Category::findOrFail($id);

        if ($category->places()->exists()) {
            return ApiResponse::error('Cannot delete a category that has places assigned.', 422);
        }

        $category->delete();

        return ApiResponse::success('Category deleted');
    }
}
