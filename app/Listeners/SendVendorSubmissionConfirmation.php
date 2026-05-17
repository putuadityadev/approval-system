<?php

namespace App\Listeners;

use App\Events\RequestSubmitted;
use App\Mail\Vendor\SubmissionConfirmationMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * SendVendorSubmissionConfirmation
 *
 * Listener yang mengirim email konfirmasi ke vendor setelah submit surat.
 */
class SendVendorSubmissionConfirmation implements ShouldQueue
{
    public string $queue = 'emails';

    public function handle(RequestSubmitted $event): void
    {
        try {
            $request = $event->request->load(['vendor.user']);
            $vendorEmail = $request->vendor->user->email ?? null;

            if (!$vendorEmail) {
                Log::warning('MAIL_SUBMISSION_CONFIRM_NO_EMAIL', [
                    'request_id' => $request->id,
                ]);
                return;
            }

            Mail::to($vendorEmail)->send(new SubmissionConfirmationMail($request));

            Log::info('MAIL_SUBMISSION_CONFIRM_SENT', [
                'request_id' => $request->id,
                'vendor_email' => $vendorEmail,
            ]);

        } catch (\Exception $e) {
            Log::error('MAIL_SUBMISSION_CONFIRM_FAILED', [
                'request_id' => $event->request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
