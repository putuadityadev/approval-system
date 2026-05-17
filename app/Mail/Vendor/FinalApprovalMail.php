<?php

namespace App\Mail\Vendor;

use App\Models\Request;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * FinalApprovalMail
 *
 * Email notifikasi ke vendor saat surat disetujui penuh (GM approve → APPROVED).
 * Berisi QR code dan instruksi untuk tunjukkan ke security.
 */
class FinalApprovalMail extends Mailable implements ShouldQueue
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
            subject: '[Mall Approval] 🎉 Surat ' . $this->requestModel->getTypeLabel() . ' Anda DISETUJUI PENUH',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.vendor.final-approval',
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
