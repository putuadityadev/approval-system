<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\AuditLogService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * EmailVerificationController
 *
 * Fungsi file ini:
 * - Mengelola semua request terkait email verification (notice, verify, resend)
 * - Bertanggung jawab untuk render halaman verification notice dengan Inertia
 * - Memvalidasi signed URL untuk verifikasi email
 * - Mengirim ulang email verifikasi jika user belum menerima
 * - Mencatat aktivitas email verification ke audit trail
 *
 * Cara kerja:
 * 1. Menerima request dari user (notice, verify, atau resend)
 * 2. Untuk verify: validasi signed URL dan update email_verified_at
 * 3. Untuk resend: kirim ulang email verifikasi dengan signed URL baru
 * 4. Log aktivitas email verification ke AuditLogService
 * 5. Redirect user atau tampilkan halaman yang sesuai dengan flash message
 *
 * Digunakan oleh: Routes di web.php (authenticated routes untuk email verification)
 *
 * Note: Controller ini opsional untuk MVP. Jika email verification tidak diaktifkan,
 * email_verified_at akan diset otomatis saat registrasi.
 */
class EmailVerificationController extends Controller
{
    /**
     * Constructor
     *
     * Inject dependencies yang dibutuhkan controller ini.
     * AuditLogService untuk logging aktivitas email verification.
     */
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * notice
     *
     * Apa yang dilakukan fungsi ini:
     * Menampilkan halaman verification notice yang memberitahu user untuk cek email.
     *
     * Cara kerjanya:
     * 1. Check apakah user sudah verified (jika sudah, redirect ke dashboard)
     * 2. Jika belum verified, render komponen React 'Auth/VerifyEmail' melalui Inertia
     * 3. Halaman ini akan menampilkan pesan dan tombol "Resend Verification Email"
     *
     * @return Response|RedirectResponse — Inertia response atau redirect ke dashboard
     */
    public function notice(): Response|RedirectResponse
    {
        // Jika user sudah verified, redirect ke dashboard sesuai role
        if (auth()->user()->hasVerifiedEmail()) {
            if (auth()->user()->isAdmin()) {
                return redirect()->route('admin.dashboard');
            }
            return redirect()->route('requester.dashboard');
        }

        // Render halaman verification notice
        return Inertia::render('Auth/VerifyEmail');
    }

    /**
     * verify
     *
     * Apa yang dilakukan fungsi ini:
     * Memproses verifikasi email dengan validasi signed URL dari link email.
     *
     * Cara kerjanya:
     * 1. Laravel otomatis validasi signed URL melalui EmailVerificationRequest
     * 2. Check apakah email sudah verified sebelumnya
     * 3. Jika belum verified: mark email as verified, trigger event Verified
     * 4. Log aktivitas email verification ke audit trail
     * 5. Redirect ke dashboard dengan flash message sukses
     *
     * @param EmailVerificationRequest $request — request dengan signed URL validation
     * @return RedirectResponse — redirect ke dashboard
     */
    public function verify(EmailVerificationRequest $request): RedirectResponse
    {
        // Ambil user dari request (sudah authenticated)
        $user = $request->user();

        // Check apakah email sudah verified sebelumnya
        if ($user->hasVerifiedEmail()) {
            // Jika sudah verified, redirect ke dashboard tanpa proses lagi
            if ($user->isAdmin()) {
                return redirect()->route('admin.dashboard');
            }
            return redirect()->route('requester.dashboard');
        }

        // Mark email as verified (update email_verified_at)
        if ($user->markEmailAsVerified()) {
            // Trigger event Verified untuk listener lain jika ada
            event(new Verified($user));

            // Log aktivitas email verification ke audit trail
            $this->auditLogService->logEmailVerification($user);
        }

        // Redirect ke dashboard dengan pesan sukses
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard')->with('success', 'Email berhasil diverifikasi. Selamat datang!');
        }

        return redirect()->route('requester.dashboard')->with('success', 'Email berhasil diverifikasi. Selamat datang!');
    }

    /**
     * resend
     *
     * Apa yang dilakukan fungsi ini:
     * Mengirim ulang email verifikasi jika user belum menerima atau email hilang.
     *
     * Cara kerjanya:
     * 1. Check apakah email sudah verified (jika sudah, redirect ke dashboard)
     * 2. Jika belum verified: kirim ulang email verifikasi dengan signed URL baru
     * 3. Laravel akan otomatis generate signed URL dan kirim email
     * 4. Return ke halaman verification notice dengan status sukses
     *
     * @param Request $request — HTTP request
     * @return RedirectResponse — redirect kembali dengan status
     */
    public function resend(Request $request): RedirectResponse
    {
        // Ambil user dari request (sudah authenticated)
        $user = $request->user();

        // Check apakah email sudah verified
        if ($user->hasVerifiedEmail()) {
            // Jika sudah verified, redirect ke dashboard
            if ($user->isAdmin()) {
                return redirect()->route('admin.dashboard');
            }
            return redirect()->route('requester.dashboard');
        }

        // Kirim ulang email verifikasi
        $user->sendEmailVerificationNotification();

        // Return ke halaman verification notice dengan status sukses
        return back()->with('status', 'Link verifikasi telah dikirim ulang ke email Anda. Silakan cek inbox atau folder spam.');
    }
}
