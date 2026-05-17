<?php

namespace App\Mail\Approver;

use App\Models\Request;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * RequestCancelledMail
 *
 * Email notifikasi ke approver saat vendor membatalkan surat
 * yang sedang berada di queue approval mereka.
 */
class RequestCancelledMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Request $requestModel;
    public string $reason;

    public function __construct(Request $requestModel, string $reason)
    {
        $this->requestModel = $requestModel;
        $this->reason = $reason;
        $this->onQueue('emails');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Mall Approval] Surat Dibatalkan oleh Vendor',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.approver.request-cancelled',
            with: [
                'requestModel' => $this->requestModel->load(['vendor']),
                'reason' => $this->reason,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
