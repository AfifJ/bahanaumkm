<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the auto-confirmation command to run every hour
Schedule::command('orders:check-auto-confirmation')
    ->hourly()
    ->description('Check and auto-confirm delivered orders after 24 hours');
