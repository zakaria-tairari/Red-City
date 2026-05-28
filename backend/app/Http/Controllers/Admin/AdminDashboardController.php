<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Media;
use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function stats()
    {
        $mediaStats = Media::query()
            ->select('storage_status', DB::raw('count(*) as count'))
            ->groupBy('storage_status')
            ->pluck('count', 'storage_status');

        return ApiResponse::success('Admin stats retrieved', [
            'places' => Place::count(),
            'categories' => Category::count(),
            'reviews' => Review::count(),
            'users' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'places_without_tags' => Place::where('tags_generated', false)->count(),
            'places_without_translations' => Place::where('translated', false)->count(),
            'media' => [
                'total' => Media::count(),
                'pending' => $mediaStats['pending'] ?? 0,
                'processing' => $mediaStats['processing'] ?? 0,
                'done' => $mediaStats['done'] ?? 0,
                'failed' => $mediaStats['failed'] ?? 0,
            ],
            'recent_reviews' => Review::with('user:id,username,first_name', 'place:id,name')
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }
}
