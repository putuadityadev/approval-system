<?php

namespace App\Events;

use App\Models\Request;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * RequestApproved Event
 *
 * Dispatched setiap kali approver approve surat (di level manapun).
 *
 * Listeners:
 * - SendVendorApprovalProgress: Kirim email progress ke vendor
 * - SendVendorFinalApproval: Kirim email final approval ke vendor (jika APPROVED)
 * - NotifyNextApprover: Kirim email ke approver level berikutnya
 * - NotifySecurityOnApproval: Kirim email ke security (jika fully APPROVED)
 */
class RequestApproved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Request $request;
    public User $approver;
    public string $fromStatus;
    public string $toStatus;
    public ?string $notes;

    public function __construct(
        Request $request,
        User $approver,
        string $fromStatus,
        string $toStatus,
        ?string $notes = null
    ) {
        $this->request = $request;
        $this->approver = $approver;
        $this->fromStatus = $fromStatus;
        $this->toStatus = $toStatus;
        $this->notes = $notes;
    }

    /**
     * Check apakah ini final approval (GM approve → APPROVED)
     */
    public function isFinalApproval(): bool
    {
        return $this->toStatus === 'APPROVED';
    }
}
