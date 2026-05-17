<?php

namespace App\Listeners;

use App\Events\RequestApproved;
use App\Mail\Vendor\ApprovalProgressMail;
use App\Mail\Vendor\FinalApprovalMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * SendVendorApprovalProgress
 *
 * Listener yang mengirim email progress approval ke vendor.
 * - Jika intermediate approval → kirim ApprovalProgressMail
 * - Jika final approval (APPROVED) → kirim FinalApprovalMail
 */
class SendVendorApprovalProgress implements ShouldQueue
{
    public string $queue = 'emails';

    public function handle(RequestApproved $event): void
    {
        try {
            $request = $event->request->load(['vendor.user']);
            $vendorEmail = $request->vendor->user->email ?? null;

            if (!$vendorEmail) {
                Log::warning('MAIL_APPROVAL_PROGRESS_NO_EMAIL', [
                    'request_id' => $request->id,
                ]);
                return;
            }

            if ($event->isFinalApproval()) {
                // Final approval → kirim FinalApprovalMail
                Mail::to($vendorEmail)->send(new FinalApprovalMail($request));

                Log::info('MAIL_FINAL_APPROVAL_SENT', [
                    'request_id' => $request->id,
                    'vendor_email' => $vendorEmail,
                ]);
            } else {
                // Intermediate approval → kirim ApprovalProgressMail
                Mail::to($vendorEmail)->send(
                    new ApprovalProgressMail(
                        $request,
                        $event->approver,
                        $event->fromStatus,
                        $event->toStatus
                    )
                );

                Log::info('MAIL_APPROVAL_PROGRESS_SENT', [
                    'request_id' => $request->id,
                    'vendor_email' => $vendorEmail,
                    'from_status' => $event->fromStatus,
                    'to_status' => $event->toStatus,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('MAIL_APPROVAL_PROGRESS_FAILED', [
                'request_id' => $event->request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
