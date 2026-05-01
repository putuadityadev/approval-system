<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureActive Middleware
 *
 * Fungsi middleware ini:
 * - Memvalidasi apakah user yang sedang login masih aktif (is_active = true)
 * - Mencegah user yang sudah dinonaktifkan untuk mengakses sistem
 * - Otomatis logout user yang sudah dinonaktifkan
 *
 * Cara kerja:
 * 1. Mengecek apakah user sudah login
 * 2. Mengecek status is_active user
 * 3. Jika is_active = false, logout user dan redirect ke login dengan pesan error
 * 4. Jika is_active = true, lanjutkan request
 *
 * Digunakan oleh: Semua authenticated routes
 * Contoh penggunaan di route: Route::get('/dashboard', ...)->middleware(['auth', 'active'])
 */
class EnsureActive
{
    /**
     * Handle an incoming request.
     *
     * Apa yang dilakukan method ini:
     * Memvalidasi status is_active user dan logout jika tidak aktif.
     *
     * Cara kerjanya:
     * 1. Ambil user yang sedang login dari request
     * 2. Cek apakah user masih aktif (is_active = true)
     * 3. Jika tidak aktif, logout user dan redirect ke login dengan pesan error
     * 4. Jika aktif, lanjutkan ke request berikutnya
     *
     * @param Request $request — HTTP request yang masuk
     * @param Closure $next — Closure untuk melanjutkan request ke middleware/controller berikutnya
     * @return Response — Response dari request atau redirect ke login
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ambil user yang sedang login
        $user = $request->user();

        // Jika user tidak aktif, logout dan redirect ke login
        if ($user && !$user->is_active) {
            // Logout user
            Auth::logout();

            // Invalidate session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirect ke login dengan pesan error
            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.',
            ]);
        }

        // Jika user aktif, lanjutkan request
        return $next($request);
    }
}
