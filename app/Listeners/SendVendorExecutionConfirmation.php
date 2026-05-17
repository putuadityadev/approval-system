<?php

namespace App\Listeners;

use App\Events\RequestExecuted;
use App\Mail\Vendor\ExecutionConfirmationMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * SendVendorExecutionConfirmation
 *
 * Listener yang mengirim email ke vendor saat surat selesai dieksekusi.
 */
class SendVendorExecutionConfirmation implements ShouldQueue
{
    public string $queue = 'emails';

    public function handle(RequestExecuted $event): void
    {
        try {
            $request = $event->request->load(['vendor.user']);
            $vendorEmail = $request->vendor->user->email ?? null;

            if (!$vendorEmail) {
                Log::warning('MAIL_EXECUTION_CONFIRM_NO_EMAIL', [
                    'request_id' => $request->id,
                ]);
                return;
            }

            Mail::to($vendorEmail)->send(new ExecutionConfirmationMail($request));

            Log::info('MAIL_EXECUTION_CONFIRM_SENT', [
                'request_id' => $request->id,
                'vendor_email' => $vendorEmail,
            ]);

        } catch (\Exception $e) {
            Log::error('MAIL_EXECUTION_CONFIRM_FAILED', [
                'request_id' => $event->request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
