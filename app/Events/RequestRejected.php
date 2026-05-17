<?php

namespace App\Events;

use App\Models\Request;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * RequestRejected Event
 *
 * Dispatched saat approver menolak surat.
 *
 * Listeners:
 * - SendVendorRejectionNotice: Kirim email penolakan ke vendor
 */
class RequestRejected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Request $request;
    public User $approver;
    public string $fromStatus;
    public string $reason;

    public function __construct(
        Request $request,
        User $approver,
        string $fromStatus,
        string $reason
    ) {
        $this->request = $request;
        $this->approver = $approver;
        $this->fromStatus = $fromStatus;
        $this->reason = $reason;
    }
}
