<?php

namespace App\Listeners;

use App\Events\RequestCancelled;
use App\Mail\Approver\RequestCancelledMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * NotifyApproverOnCancel
 *
 * Listener yang mengirim email ke approver saat vendor cancel surat.
 * Mengirim ke approver yang sesuai dengan status surat sebelum cancel.
 */
class NotifyApproverOnCancel implements ShouldQueue
{
    public string $queue = 'emails';

    public function handle(RequestCancelled $event): void
    {
        try {
            $request = $event->request;

            // Tentukan approver role berdasarkan status sebelum cancel
            $roleMap = [
                'SUBMITTED' => 'approver_dept',
                'PENDING_OPS' => 'approver_ops',
                'PENDING_FINANCE' => 'approver_finance',
                'PENDING_GM' => 'approver_gm',
            ];

            $approverRole = $roleMap[$event->previousStatus] ?? null;

            if (!$approverRole) {
                Log::info('MAIL_CANCEL_NOTIFY_SKIP', [
                    'request_id' => $request->id,
                    'previous_status' => $event->previousStatus,
                    'reason' => 'No matching approver role for previous status',
                ]);
                return;
            }

            $approvers = User::where('role', $approverRole)
                ->where('is_active', true)
                ->get();

            if ($approvers->isEmpty()) {
                return;
            }

            foreach ($approvers as $approver) {
                Mail::to($approver->email)->send(
                    new RequestCancelledMail($request, $event->reason)
                );
            }

            Log::info('MAIL_CANCEL_NOTIFY_SENT', [
                'request_id' => $request->id,
                'approver_role' => $approverRole,
                'count' => $approvers->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('MAIL_CANCEL_NOTIFY_FAILED', [
                'request_id' => $event->request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
