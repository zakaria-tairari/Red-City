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
    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Starting media download...');

        $media = Media::whereNull('app_url')->get();

        foreach ($media as $item) {
            MediaDownloadJob::dispatch($item->id);
        }

        Log::info("Jobs dispatched: " . $media->count());
    }
}
