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
 * NewPendingRequestMail
 *
 * Email notifikasi ke approver saat ada surat baru yang pending di queue mereka.
 * Dikirim ke semua approver aktif dengan role yang sesuai.
 */
class NewPendingRequestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Request $requestModel;
    public string $approverRole;

    public function __construct(Request $requestModel, string $approverRole)
    {
        $this->requestModel = $requestModel;
        $this->approverRole = $approverRole;
        $this->onQueue('emails');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Mall Approval] Surat Baru Menunggu Approval Anda',
        );
    }

    public function content(): Content
    {
        $roleLabels = [
            'approver_dept' => 'Departemen',
            'approver_ops' => 'Operasional',
            'approver_finance' => 'Finance',
            'approver_gm' => 'GM Operation',
        ];

        return new Content(
            view: 'emails.approver.new-pending-request',
            with: [
                'requestModel' => $this->requestModel->load(['vendor', 'sikmDetail', 'sikDetail']),
                'approverRoleLabel' => $roleLabels[$this->approverRole] ?? $this->approverRole,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
