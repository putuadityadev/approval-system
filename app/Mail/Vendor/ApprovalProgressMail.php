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
 * ApprovalProgressMail
 *
 * Email notifikasi ke vendor setiap kali approver meng-approve surat
 * di level manapun (Dept, Ops, Finance).
 * Berisi progress bar approval dan info siapa yang approve.
 *
 * Catatan: Email ini TIDAK dikirim saat final approval (GM approve → APPROVED),
 * karena skenario itu ditangani oleh FinalApprovalMail.
 */
class ApprovalProgressMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Request $requestModel;
    public User $approver;
    public string $fromStatus;
    public string $toStatus;

    public function __construct(
        Request $requestModel,
        User $approver,
        string $fromStatus,
        string $toStatus
    ) {
        $this->requestModel = $requestModel;
        $this->approver = $approver;
        $this->fromStatus = $fromStatus;
        $this->toStatus = $toStatus;
        $this->onQueue('emails');
    }

    public function envelope(): Envelope
    {
        $roleLabel = $this->approver->getRoleDisplayName();

        return new Envelope(
            subject: '[Mall Approval] Surat ' . $this->requestModel->getTypeLabel() . ' Disetujui oleh ' . $roleLabel,
        );
    }

    public function content(): Content
    {
        // Hitung progress percentage
        $progressMap = [
            'PENDING_OPS' => 25,
            'PENDING_FINANCE' => 50,
            'PENDING_GM' => 75,
            'APPROVED' => 100,
        ];

        $progressPercent = $progressMap[$this->toStatus] ?? 0;
        $currentStep = match($this->toStatus) {
            'PENDING_OPS' => 1,
            'PENDING_FINANCE' => 2,
            'PENDING_GM' => 3,
            'APPROVED' => 4,
            default => 0,
        };

        return new Content(
            view: 'emails.vendor.approval-progress',
            with: [
                'requestModel' => $this->requestModel->load(['vendor']),
                'approver' => $this->approver,
                'fromStatus' => $this->fromStatus,
                'toStatus' => $this->toStatus,
                'progressPercent' => $progressPercent,
                'currentStep' => $currentStep,
                'totalSteps' => 4,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
