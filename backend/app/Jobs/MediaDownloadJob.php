<?php

namespace App\Jobs;

use App\Models\Media;
use Exception;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\Attributes\UniqueFor;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

#[Tries(5)]
#[Backoff([60, 300, 900])]
#[UniqueFor(3600)]
#[Timeout(240)]
class MediaDownloadJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $mediaId)
    {
        //
    }

    public function uniqueId()
    {
        return $this->mediaId;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        try {
            $item = Media::find($this->mediaId);

            if (! $item || $item->storage_status !== 'processing') {
                return;
            }

            $dir = "places/{$item->place_id}";
            Storage::disk('public')->makeDirectory($dir);

            $filename = Str::uuid().'.'.$item->ext;
            $relativePath = "{$dir}/{$filename}";
            $fullPath = Storage::disk('public')->path($relativePath);

            $response = Http::timeout(20)
                ->sink($fullPath)
                ->get($item->original_url);

            if ($response->failed()) {
                Log::error('Media download failed', [
                    'media_id' => $item->id,
                    'status' => $response->status(),
                    'url' => $item->original_url,
                ]);
                throw new Exception('Media download failed');
            }

            $item->update([
                'app_url' => $relativePath,
                'storage_status' => 'done',
            ]);

            Log::info('Media download successful', [
                'media_id' => $item->id,
                'path' => $relativePath,
            ]);
        } catch (Exception $e) {
            Log::error('Media download attempt failed', [
                'media_id' => $this->mediaId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $e)
    {
        Media::where('id', $this->mediaId)->update([
            'storage_status' => 'failed',
        ]);

        Log::error('Media job permanently failed', [
            'media_id' => $this->mediaId,
            'error' => $e->getMessage(),
        ]);
    }
}
