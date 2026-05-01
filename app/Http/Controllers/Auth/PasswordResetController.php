<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\Auth\PasswordResetService;
use App\Services\Auth\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PasswordResetController
 *
 * Fungsi file ini:
 * - Mengelola semua request terkait password reset (forgot password dan reset password)
 * - Bertanggung jawab untuk render halaman forgot password dan reset password dengan Inertia
 * - Delegasi logika bisnis ke PasswordResetService (controller tetap tipis)
 * - Mencatat aktivitas password reset ke audit trail
 *
 * Cara kerja:
 * 1. Menerima request dari user (forgot password atau reset password)
 * 2. Validasi input menggunakan Form Request
 * 3. Delegasikan logika bisnis ke PasswordResetService
 * 4. Log aktivitas password reset ke AuditLogService
 * 5. Redirect user atau tampilkan halaman yang sesuai dengan flash message
 *
 * Digunakan oleh: Routes di web.php (guest routes untuk password reset)
 */
class PasswordResetController extends Controller
{
    /**
     * Constructor
     *
     * Inject dependencies yang dibutuhkan controller ini.
     * PasswordResetService untuk logika password reset, AuditLogService untuk logging.
     */
    public function __construct(
        protected PasswordResetService $passwordResetService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * showForgotPassword
     *
     * Apa yang dilakukan fungsi ini:
     * Menampilkan halaman forgot password menggunakan Inertia.
     *
     * Cara kerjanya:
     * 1. Render komponen React 'Auth/ForgotPassword' melalui Inertia
     * 2. Inertia akan otomatis passing errors dan status dari session
     *
     * @return Response — Inertia response untuk render halaman forgot password
     */
    public function showForgotPassword(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * sendResetLink
     *
     * Apa yang dilakukan fungsi ini:
     * Memproses permintaan reset password dan mengirim email berisi link reset.
     *
     * Cara kerjanya:
     * 1. Terima dan validasi input dari ForgotPasswordRequest (email)
     * 2. Panggil PasswordResetService->sendResetLink() untuk generate token dan kirim email
     * 3. Jika berhasil: return ke halaman forgot password dengan status sukses
     * 4. Jika gagal: return error ke frontend
     *
     * @param ForgotPasswordRequest $request — request yang sudah divalidasi
     * @return RedirectResponse — redirect kembali dengan status atau error
     */
    public function sendResetLink(ForgotPasswordRequest $request): RedirectResponse
    {
        try {
            // Panggil service untuk generate token dan kirim email
            $this->passwordResetService->sendResetLink($request->email);

            // Return dengan status sukses
            return back()->with('status', 'Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.');
        } catch (\Exception $e) {
            // Jika ada error (misal: email tidak ditemukan), return error
            return back()->withErrors([
                'email' => $e->getMessage(),
            ])->onlyInput('email');
        }
    }

    /**
     * showResetPassword
     *
     * Apa yang dilakukan fungsi ini:
     * Menampilkan halaman reset password dengan token yang diterima dari email.
     *
     * Cara kerjanya:
     * 1. Terima token dari URL parameter
     * 2. Terima email dari query string
     * 3. Render komponen React 'Auth/ResetPassword' dengan token dan email sebagai props
     * 4. Inertia akan passing data ini ke komponen React
     *
     * @param string $token — token reset password dari URL
     * @return Response — Inertia response untuk render halaman reset password
     */
    public function showResetPassword(string $token): Response
    {
        // Ambil email dari query string (dikirim dari link email)
        $email = request()->query('email');

        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $email,
        ]);
    }

    /**
     * resetPassword
     *
     * Apa yang dilakukan fungsi ini:
     * Memproses reset password dengan token yang valid dan update password user.
     *
     * Cara kerjanya:
     * 1. Terima dan validasi input dari ResetPasswordRequest (token, email, password, password_confirmation)
     * 2. Panggil PasswordResetService->resetPassword() untuk validasi token dan update password
     * 3. Jika berhasil: log aktivitas password reset, redirect ke login dengan pesan sukses
     * 4. Jika gagal: return error ke frontend (token invalid/expired)
     *
     * @param ResetPasswordRequest $request — request yang sudah divalidasi
     * @return RedirectResponse — redirect ke login atau kembali dengan error
     */
    public function resetPassword(ResetPasswordRequest $request): RedirectResponse
    {
        try {
            // Panggil service untuk validasi token dan update password
            $this->passwordResetService->resetPassword($request->validated());

            // Ambil user yang baru reset password untuk logging
            $user = \App\Models\User::where('email', $request->email)->first();

            // Log aktivitas password reset ke audit trail
            if ($user) {
                $this->auditLogService->logPasswordReset($user);
            }

            // Redirect ke login dengan pesan sukses
            return redirect()->route('login')->with('success', 'Password berhasil direset. Silakan login dengan password baru Anda.');
        } catch (\Exception $e) {
            // Jika ada error (token invalid/expired), return error
            return back()->withErrors([
                'email' => $e->getMessage(),
            ])->withInput($request->only('email'));
        }
    }
}
