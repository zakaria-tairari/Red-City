<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;

class PlacesController extends Controller
{
    public function index(Request $request) {
        $query = Place::query();

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('summary', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $places = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Places retreived successfully',
            'data' => $places,
        ]);
    }

    public function getById(int $id) {
        $place = Place::findOrFail($id);
        return response()->json([
            'success' => true,
            'message' => "Place $id retreived successfully",
            'data' => $place,
        ]);
    }
}
