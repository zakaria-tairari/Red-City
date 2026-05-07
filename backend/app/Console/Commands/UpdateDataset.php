<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

#[Signature('app:update-dataset')]
#[Description('Runs the full ETL pipeline')]
class UpdateDataset extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $projectPath = base_path('../data-engine');
        $python = $projectPath . '/venv/bin/python';

        $process = new Process([
            $python,
            '-m',
            'main'
        ]);

        $process->setWorkingDirectory($projectPath);
        $process->setTimeout(3600);

        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if (!$process->isSuccessful()) {
            Log::error('Python scraper failed', [
                'error' => $process->getErrorOutput()
            ]);
            
            $this->error($process->getErrorOutput());
            return self::FAILURE;
        }

        Artisan::call('app:media-download');

        return self::SUCCESS;
    }
}
