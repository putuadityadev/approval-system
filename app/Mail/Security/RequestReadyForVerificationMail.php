<?php

namespace App\Mail\Security;

use App\Models\Request;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * RequestReadyForVerificationMail
 *
 * Email notifikasi ke security saat surat sudah fully approved
 * dan siap untuk verifikasi lapangan.
 */
class RequestReadyForVerificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Request $requestModel;

    public function __construct(Request $requestModel)
    {
        $this->requestModel = $requestModel;
        $this->onQueue('emails');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Mall Approval] Surat Approved Siap Diverifikasi',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.security.request-ready',
            with: [
                'requestModel' => $this->requestModel->load(['vendor', 'sikmDetail', 'sikDetail']),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
