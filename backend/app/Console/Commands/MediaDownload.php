<?php

namespace App\Console\Commands;

use App\Jobs\MediaDownloadJob;
use App\Models\Media;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

#[Signature('app:media-download')]
#[Description('Downloands the scraped media in the local storage')]
class MediaDownload extends Command
{
    public function handle()
    {
        Log::info('Starting media download...');

        $count = 0;
        Media::where('storage_status', 'pending')
            ->chunk(100, function ($media) use (&$count) {
                foreach ($media as $item) {

                    $updated = Media::where('id', $item->id)
                        ->where('storage_status', 'pending')
                        ->update([
                            'storage_status' => 'processing'
                        ]);

                    if ($updated) {
                        MediaDownloadJob::dispatch($item->id)
                            ->onQueue('media');

                        $count++;
                    }
                }
            });

        Log::info('Media jobs dispatched', [
            'count' => $count
        ]);
    }
}
