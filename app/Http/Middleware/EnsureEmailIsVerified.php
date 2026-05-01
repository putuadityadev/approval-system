<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureEmailIsVerified Middleware
 *
 * Fungsi middleware ini:
 * - Memvalidasi apakah email user sudah diverifikasi
 * - Mencegah akses ke route tertentu jika email belum diverifikasi
 * - Redirect ke halaman verification notice jika email belum verified
 *
 * Cara kerja:
 * 1. Mengecek apakah user sudah login (jika belum, akan di-handle oleh auth middleware)
 * 2. Mengecek kolom email_verified_at di database
 * 3. Jika email_verified_at adalah NULL, redirect ke halaman verification notice
 * 4. Jika email sudah verified, lanjutkan request
 *
 * Digunakan oleh: Route yang memerlukan email verification
 * Contoh penggunaan di route: Route::get('/dashboard', ...)->middleware(['auth', 'verified'])
 *
 * Note: Middleware ini opsional untuk MVP. Bisa diaktifkan dengan menambahkan
 * middleware 'verified' ke route yang memerlukan email verification.
 */
class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * Apa yang dilakukan method ini:
     * Memvalidasi apakah email user sudah diverifikasi dan redirect jika belum.
     *
     * Cara kerjanya:
     * 1. Ambil user yang sedang login dari request
     * 2. Cek apakah email_verified_at tidak null
     * 3. Jika null (belum verified), redirect ke halaman verification notice
     * 4. Jika sudah verified, lanjutkan ke request berikutnya
     *
     * @param Request $request — HTTP request yang masuk
     * @param Closure $next — Closure untuk melanjutkan request ke middleware/controller berikutnya
     * @return Response — Response dari request atau redirect ke verification notice
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ambil user yang sedang login
        $user = $request->user();

        // Jika user tidak ada (belum login), biarkan auth middleware yang handle
        if (!$user) {
            return $next($request);
        }

        // Jika email belum diverifikasi (email_verified_at adalah null)
        if (is_null($user->email_verified_at)) {
            // Redirect ke URL /email/verify dengan pesan
            // Note: Route verification.notice akan dibuat di task 9.3 (EmailVerificationController)
            // Untuk saat ini, kita redirect ke URL langsung
            return redirect('/email/verify')
                ->with('message', 'Silakan verifikasi email Anda terlebih dahulu.');
        }

        // Jika email sudah verified, lanjutkan request
        return $next($request);
    }
}
