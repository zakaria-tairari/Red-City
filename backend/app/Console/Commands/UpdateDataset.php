<?php

namespace App\Console\Commands;

use App\Models\Place;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;


#[Signature('app:update-dataset')]
#[Description('Runs the full ETL pipeline')]
class UpdateDataset extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $this->info("Triggering data-engine pipeline...");

            $response = Http::timeout(3600)
                ->post(config('app.data_engine_url') . '/run-pipeline');

            if (!$response->successful()) {
                throw new \Exception($response->body());
            }

            $this->info("ETL pipeline completed successfully");

            Artisan::call('app:media-download');

            $this->info("Media download completed");

            Place::query()->searchable();

            return self::SUCCESS;

        } catch (\Exception $e) {
            Log::error('Pipeline failed', [
                'error' => $e->getMessage()
            ]);

            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
