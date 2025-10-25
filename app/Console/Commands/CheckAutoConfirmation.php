<?php

namespace App\Console\Commands;

use App\Jobs\AutoConfirmDeliveredOrder;
use Illuminate\Console\Command;

class CheckAutoConfirmation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:check-auto-confirmation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and auto-confirm delivered orders after 24 hours';

    /**
     * Execute console command.
     */
    public function handle()
    {
        $this->info('Checking for orders that need auto-confirmation...');

        // Dispatch job untuk auto-confirmation
        AutoConfirmDeliveredOrder::dispatch();

        $this->info('Auto-confirmation check completed!');
    }
}
