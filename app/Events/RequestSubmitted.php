<?php

namespace App\Events;

use App\Models\Request;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * RequestSubmitted Event
 *
 * Dispatched saat vendor berhasil submit surat (SIK/SIKMB).
 *
 * Listeners:
 * - SendVendorSubmissionConfirmation: Kirim email konfirmasi ke vendor
 * - NotifyApproverNewPending: Kirim email ke approver_dept bahwa ada surat baru
 */
class RequestSubmitted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }
}
