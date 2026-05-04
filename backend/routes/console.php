<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:run-scraper')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->onSuccess(function () {
        Artisan::call('app:run-media-download');
    })
    ->onFailure(function () {
        logger()->error('Scraper failed (check Python logs)');
    });
