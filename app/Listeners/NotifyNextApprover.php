<?php

namespace App\Listeners;

use App\Events\RequestApproved;
use App\Mail\Approver\NewPendingRequestMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * NotifyNextApprover
 *
 * Listener yang mengirim email ke approver level berikutnya
 * setelah approver saat ini approve surat.
 *
 * Mapping:
 * - PENDING_OPS → notify approver_ops
 * - PENDING_FINANCE → notify approver_finance
 * - PENDING_GM → notify approver_gm
 * - APPROVED → skip (ditangani oleh NotifySecurityOnApproval)
 */
class NotifyNextApprover implements ShouldQueue
{
    public string $queue = 'emails';

    public function handle(RequestApproved $event): void
    {
        try {
            // Jika sudah fully approved, skip (security di-handle listener lain)
            if ($event->isFinalApproval()) {
                return;
            }

            $request = $event->request;

            // Tentukan approver role berikutnya berdasarkan new status
            $nextRoleMap = [
                'PENDING_OPS' => 'approver_ops',
                'PENDING_FINANCE' => 'approver_finance',
                'PENDING_GM' => 'approver_gm',
            ];

            $nextRole = $nextRoleMap[$event->toStatus] ?? null;

            if (!$nextRole) {
                Log::warning('MAIL_NOTIFY_NEXT_APPROVER_NO_ROLE', [
                    'request_id' => $request->id,
                    'to_status' => $event->toStatus,
                ]);
                return;
            }

            $approvers = User::where('role', $nextRole)
                ->where('is_active', true)
                ->get();

            if ($approvers->isEmpty()) {
                Log::warning('MAIL_NOTIFY_NEXT_APPROVER_NO_APPROVERS', [
                    'request_id' => $request->id,
                    'next_role' => $nextRole,
                ]);
                return;
            }

            foreach ($approvers as $approver) {
                Mail::to($approver->email)->send(
                    new NewPendingRequestMail($request, $nextRole)
                );
            }

            Log::info('MAIL_NOTIFY_NEXT_APPROVER_SENT', [
                'request_id' => $request->id,
                'next_role' => $nextRole,
                'count' => $approvers->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('MAIL_NOTIFY_NEXT_APPROVER_FAILED', [
                'request_id' => $event->request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
