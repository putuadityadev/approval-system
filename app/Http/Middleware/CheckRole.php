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
 * - Support multiple roles dengan separator koma (misal: 'admin,vendor')
 *
 * Cara kerja:
 * 1. Menerima parameter role dari route (bisa single atau multiple dengan separator koma)
 * 2. Mengecek apakah user sudah login (jika belum, akan di-handle oleh auth middleware)
 * 3. Membandingkan role user dengan role yang dibutuhkan
 * 4. Jika cocok, lanjutkan request; jika tidak, return 403 Forbidden
 *
 * Digunakan oleh: Route yang memerlukan role-based access control
 * Contoh penggunaan di route:
 * - Single role: Route::get('/admin/dashboard', ...)->middleware(['auth', 'role:super_admin'])
 * - Multiple roles: Route::get('/approval/dashboard', ...)->middleware(['auth', 'role:approver_dept,approver_ops,approver_finance,approver_gm'])
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Apa yang dilakukan method ini:
     * Memvalidasi role user dan mengembalikan 403 jika tidak sesuai.
     * Support multiple roles dengan separator koma.
     *
     * Cara kerjanya:
     * 1. Ambil user yang sedang login dari request
     * 2. Parse parameter role (bisa single atau multiple dengan separator koma)
     * 3. Cek apakah role user ada dalam daftar role yang diizinkan
     * 4. Jika tidak cocok, abort dengan 403 Forbidden
     * 5. Jika cocok, lanjutkan ke request berikutnya
     *
     * @param Request $request — HTTP request yang masuk
     * @param Closure $next — Closure untuk melanjutkan request ke middleware/controller berikutnya
     * @param string $roles — Role yang dibutuhkan untuk mengakses route (bisa single atau multiple dengan separator koma)
     * @return Response — Response dari request atau abort 403
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        // Ambil user yang sedang login
        $user = $request->user();

        // Jika user tidak login, return 403
        if (!$user) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        // Parse roles (bisa multiple dengan separator koma)
        $allowedRoles = explode(',', $roles);

        // Cek apakah role user ada dalam daftar role yang diizinkan
        if (!in_array($user->role, $allowedRoles)) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        // Jika role cocok, lanjutkan request
        return $next($request);
    }
}

