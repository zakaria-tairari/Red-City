<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;

class PlacesController extends Controller
{
    public function index() {
        $places = Place::all();
        return response()->json([
            'success' => true,
            'message' => 'Places retreived successfully',
            'data' => $places,
        ]);
    }

    public function find(int $id) {
        $place = Place::findOrFail($id);
        return response()->json([
            'success' => true,
            'message' => "Place $id retreived successfully",
            'data' => $place,
        ]);
    }
}
