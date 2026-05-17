<?php

namespace App\Events;

use App\Models\Request;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * RequestExecuted Event
 *
 * Dispatched saat security verify surat dan upload evidence.
 *
 * Listeners:
 * - SendVendorExecutionConfirmation: Kirim email ke vendor bahwa surat selesai
 */
class RequestExecuted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Request $request;
    public User $security;

    public function __construct(Request $request, User $security)
    {
        $this->request = $request;
        $this->security = $security;
    }
}
