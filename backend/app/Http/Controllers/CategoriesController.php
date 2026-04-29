<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoriesController extends Controller
{
    public function index() {
        $categories = Category::all();
        return response()->json([
            'success' => true,
            'message' => 'Categories retreived successfully',
            'data' => $categories,
        ]);
    }

    public function find(int $id) {
        $category = Category::findOrFail($id);
        return response()->json([
            'success' => true,
            'message' => "Category $id retreived successfully",
            'data' => $category,
        ]);
    }
}
