<?php

namespace App\Listeners;

use App\Events\RequestSubmitted;
use App\Mail\Approver\NewPendingRequestMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * NotifyApproverNewPending
 *
 * Listener yang mengirim email ke approver yang relevan
 * saat ada surat baru masuk ke queue mereka.
 *
 * Digunakan untuk:
 * - Saat vendor submit → notify approver_dept
 * - Saat approver approve → notify approver level berikutnya (handled by NotifyNextApprover)
 */
class NotifyApproverNewPending implements ShouldQueue
{
    public string $queue = 'emails';

    public function handle(RequestSubmitted $event): void
    {
        try {
            $request = $event->request;

            // Saat submit, notify approver_dept
            $approverRole = 'approver_dept';

            $approvers = User::where('role', $approverRole)
                ->where('is_active', true)
                ->get();

            if ($approvers->isEmpty()) {
                Log::warning('MAIL_NOTIFY_APPROVER_NO_APPROVERS', [
                    'request_id' => $request->id,
                    'approver_role' => $approverRole,
                ]);
                return;
            }

            foreach ($approvers as $approver) {
                Mail::to($approver->email)->send(
                    new NewPendingRequestMail($request, $approverRole)
                );
            }

            Log::info('MAIL_NOTIFY_APPROVER_SENT', [
                'request_id' => $request->id,
                'approver_role' => $approverRole,
                'count' => $approvers->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('MAIL_NOTIFY_APPROVER_FAILED', [
                'request_id' => $event->request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
