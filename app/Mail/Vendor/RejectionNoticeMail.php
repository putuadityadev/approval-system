<?php

namespace App\Mail\Vendor;

use App\Models\Request;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * RejectionNoticeMail
 *
 * Email notifikasi ke vendor saat surat ditolak oleh approver.
 * Berisi alasan penolakan dan instruksi untuk submit ulang.
 */
class RejectionNoticeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Request $requestModel;
    public User $approver;
    public string $reason;

    public function __construct(Request $requestModel, User $approver, string $reason)
    {
        $this->requestModel = $requestModel;
        $this->approver = $approver;
        $this->reason = $reason;
        $this->onQueue('emails');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Mall Approval] ⚠️ Surat ' . $this->requestModel->getTypeLabel() . ' Anda DITOLAK',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.vendor.rejection-notice',
            with: [
                'requestModel' => $this->requestModel->load(['vendor']),
                'approver' => $this->approver,
                'reason' => $this->reason,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
