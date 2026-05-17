<?php

namespace App\Events;

use App\Models\Request;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * RequestCancelled Event
 *
 * Dispatched saat vendor membatalkan surat.
 *
 * Listeners:
 * - NotifyApproverOnCancel: Kirim email ke approver yang sedang handle
 */
class RequestCancelled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Request $request;
    public string $previousStatus;
    public string $reason;

    public function __construct(
        Request $request,
        string $previousStatus,
        string $reason
    ) {
        $this->request = $request;
        $this->previousStatus = $previousStatus;
        $this->reason = $reason;
    }
}
