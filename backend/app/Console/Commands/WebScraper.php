<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

#[Signature('app:web-scraper')]
#[Description('Runs the scraping pipeline')]
class WebScraper extends Command
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
            $this->error($process->getErrorOutput());
            return;
        }
    }
}
