<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * CheckRole Middleware
 *
 * Fungsi middleware ini:
 * - Memvalidasi apakah user yang sedang login memiliki role yang sesuai
 * - Mencegah akses ke route yang tidak sesuai dengan role user
 * - Mengembalikan error 403 Forbidden jika role tidak cocok
 *
 * Cara kerja:
 * 1. Menerima parameter role dari route (admin atau requester)
 * 2. Mengecek apakah user sudah login (jika belum, akan di-handle oleh auth middleware)
 * 3. Membandingkan role user dengan role yang dibutuhkan
 * 4. Jika cocok, lanjutkan request; jika tidak, return 403 Forbidden
 *
 * Digunakan oleh: Route yang memerlukan role-based access control
 * Contoh penggunaan di route: Route::get('/admin/dashboard', ...)->middleware(['auth', 'role:admin'])
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Apa yang dilakukan method ini:
     * Memvalidasi role user dan mengembalikan 403 jika tidak sesuai.
     *
     * Cara kerjanya:
     * 1. Ambil user yang sedang login dari request
     * 2. Cek apakah role user sama dengan role yang dibutuhkan
     * 3. Jika tidak cocok, abort dengan 403 Forbidden
     * 4. Jika cocok, lanjutkan ke request berikutnya
     *
     * @param Request $request — HTTP request yang masuk
     * @param Closure $next — Closure untuk melanjutkan request ke middleware/controller berikutnya
     * @param string $role — Role yang dibutuhkan untuk mengakses route (admin atau requester)
     * @return Response — Response dari request atau abort 403
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Ambil user yang sedang login
        $user = $request->user();

        // Jika user tidak memiliki role yang sesuai, return 403 Forbidden
        if (!$user || $user->role !== $role) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        // Jika role cocok, lanjutkan request
        return $next($request);
    }
}

