<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Jobs\MediaDownloadJob;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminMediaController extends Controller
{
    public function index(Request $request)
    {
        $query = Media::with('place:id,name');

        if ($request->filled('status')) {
            $query->where('storage_status', $request->status);
        }

        $media = $query->orderByDesc('updated_at')->paginate($request->limit ?? 20);

        return ApiResponse::success('Media retrieved', [
            'items' => $media->items(),
            'total' => $media->total(),
            'current_page' => $media->currentPage(),
            'last_page' => $media->lastPage(),
            'per_page' => $media->perPage(),
        ]);
    }

    public function stats()
    {
        $counts = Media::query()
            ->select('storage_status', DB::raw('count(*) as count'))
            ->groupBy('storage_status')
            ->pluck('count', 'storage_status');

        return ApiResponse::success('Media stats retrieved', [
            'total' => Media::count(),
            'pending' => $counts['pending'] ?? 0,
            'processing' => $counts['processing'] ?? 0,
            'done' => $counts['done'] ?? 0,
            'failed' => $counts['failed'] ?? 0,
        ]);
    }

    public function retry(int $id)
    {
        $media = Media::findOrFail($id);

        $media->update(['storage_status' => 'processing']);
        MediaDownloadJob::dispatch($media->id)->onQueue('media');

        return ApiResponse::success('Media download queued', $media->fresh(['place:id,name']));
    }
}
