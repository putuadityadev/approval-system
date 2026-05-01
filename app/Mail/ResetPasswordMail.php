<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * ResetPasswordMail
 *
 * Mailable class untuk mengirim email reset password.
 *
 * Fungsi class ini:
 * - Mengirim email berisi link reset password ke user
 * - Link berisi token yang valid untuk reset password
 * - Email menggunakan template Blade yang sudah dibuat
 *
 * Cara kerjanya:
 * 1. Terima token dan email dari PasswordResetService
 * 2. Generate URL reset password dengan token
 * 3. Kirim email menggunakan template emails.reset-password
 *
 * Digunakan oleh: PasswordResetService->sendResetLink()
 */
class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Token reset password
     */
    public string $token;

    /**
     * Email user yang request reset password
     */
    public string $email;

    /**
     * URL untuk reset password
     */
    public string $resetUrl;

    /**
     * Create a new message instance.
     *
     * @param string $token — token reset password
     * @param string $email — email user
     */
    public function __construct(string $token, string $email)
    {
        $this->token = $token;
        $this->email = $email;
        
        // Generate URL reset password dengan token dan email
        $this->resetUrl = url('/reset-password/' . $token . '?email=' . urlencode($email));
    }

    /**
     * Get the message envelope.
     *
     * Envelope berisi subject dan from address email.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Password - ' . config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     *
     * Content berisi view template dan data yang dikirim ke view.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reset-password',
            with: [
                'resetUrl' => $this->resetUrl,
                'email' => $this->email,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
