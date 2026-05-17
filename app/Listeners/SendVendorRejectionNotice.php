<?php

namespace App\Listeners;

use App\Events\RequestRejected;
use App\Mail\Vendor\RejectionNoticeMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * SendVendorRejectionNotice
 *
 * Listener yang mengirim email penolakan ke vendor.
 */
class SendVendorRejectionNotice implements ShouldQueue
{
    public string $queue = 'emails';

    public function handle(RequestRejected $event): void
    {
        try {
            $request = $event->request->load(['vendor.user']);
            $vendorEmail = $request->vendor->user->email ?? null;

            if (!$vendorEmail) {
                Log::warning('MAIL_REJECTION_NOTICE_NO_EMAIL', [
                    'request_id' => $request->id,
                ]);
                return;
            }

            Mail::to($vendorEmail)->send(
                new RejectionNoticeMail($request, $event->approver, $event->reason)
            );

            Log::info('MAIL_REJECTION_NOTICE_SENT', [
                'request_id' => $request->id,
                'vendor_email' => $vendorEmail,
                'rejected_by' => $event->approver->getRoleDisplayName(),
            ]);

        } catch (\Exception $e) {
            Log::error('MAIL_REJECTION_NOTICE_FAILED', [
                'request_id' => $event->request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
