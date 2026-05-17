<?php

namespace App\Listeners;

use App\Events\RequestApproved;
use App\Mail\Security\RequestReadyForVerificationMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * NotifySecurityOnApproval
 *
 * Listener yang mengirim email ke semua security aktif
 * saat surat fully approved (GM approve → APPROVED).
 */
class NotifySecurityOnApproval implements ShouldQueue
{
    public string $queue = 'emails';

    public function handle(RequestApproved $event): void
    {
        try {
            // Hanya kirim jika final approval
            if (!$event->isFinalApproval()) {
                return;
            }

            $request = $event->request;

            $securities = User::where('role', 'security')
                ->where('is_active', true)
                ->get();

            if ($securities->isEmpty()) {
                Log::warning('MAIL_NOTIFY_SECURITY_NO_USERS', [
                    'request_id' => $request->id,
                ]);
                return;
            }

            foreach ($securities as $security) {
                Mail::to($security->email)->send(
                    new RequestReadyForVerificationMail($request)
                );
            }

            Log::info('MAIL_NOTIFY_SECURITY_SENT', [
                'request_id' => $request->id,
                'count' => $securities->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('MAIL_NOTIFY_SECURITY_FAILED', [
                'request_id' => $event->request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
