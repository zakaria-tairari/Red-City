<?php

namespace App\Jobs;

use App\Models\Media;
use Exception;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaDownloadJob implements ShouldQueue, ShouldBeUnique
{
    use Queueable;

    public $tries = 3;
    public $backoff = [10, 30, 60];
    public $uniqueFor = 3600;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $mediaId)
    {
        //
    }

    public function uniqid() {
        return $this->mediaId;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        try {
            $item = Media::find($this->mediaId);

            if (!$item || $item->storage_status == 'done') {
                return;
            }

            $dir = "places/{$item->place_id}";
            Storage::disk('public')->makeDirectory($dir);

            $filename = Str::uuid() . '.' . $item->ext;
            $relativePath = "{$dir}/{$filename}";
            $fullPath = Storage::disk('public')->path($relativePath);

            $response = Http::timeout(20)
                ->sink($fullPath)
                ->get($item->original_url);

            if ($response->failed()) {
                Log::error('Media download failed', [
                    'media_id' => $item->id,
                    'status' => $response->status(),
                    'url' => $item->original_url
                ]);
                return;
            }

            $item->update([
                'app_url' => $relativePath,
                'storage_status' => 'done'
            ]);

            Log::info('Media download successful', [
                'media_id' => $item->id,
                'path' => $relativePath
            ]);
        }
        catch (Exception $e) {
            Log::error('Media download exception', [
                'media_id' => $this->mediaId,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}
