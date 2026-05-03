<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\Auth\AuthService;
use App\Services\Auth\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * AuthController
 *
 * Fungsi file ini:
 * - Mengelola semua request terkait authentication (login, register, logout)
 * - Bertanggung jawab untuk render halaman authentication dengan Inertia
 * - Delegasi logika bisnis ke AuthService (controller tetap tipis)
 * - Mencatat semua aktivitas authentication ke audit trail
 *
 * Cara kerja:
 * 1. Menerima request dari user (login, register, logout)
 * 2. Validasi input menggunakan Form Request
 * 3. Delegasikan logika bisnis ke AuthService
 * 4. Log aktivitas ke AuditLogService
 * 5. Redirect user ke dashboard sesuai role atau tampilkan halaman yang sesuai
 *
 * Digunakan oleh: Routes di web.php (guest dan authenticated routes)
 */
class AuthController extends Controller
{
    /**
     * Constructor
     *
     * Inject dependencies yang dibutuhkan controller ini.
     * AuthService untuk logika authentication, AuditLogService untuk logging.
     */
    public function __construct(
        protected AuthService $authService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * showLogin
     *
     * Apa yang dilakukan fungsi ini:
     * Menampilkan halaman login menggunakan Inertia.
     *
     * Cara kerjanya:
     * 1. Render komponen React 'Auth/Login' melalui Inertia
     * 2. Inertia akan otomatis passing errors dan status dari session
     *
     * @return Response — Inertia response untuk render halaman login
     */
    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * login
     *
     * Apa yang dilakukan fungsi ini:
     * Memproses login user dengan kredensial yang diberikan.
     *
     * Cara kerjanya:
     * 1. Terima dan validasi input dari LoginRequest (email, password, remember)
     * 2. Panggil AuthService->attempt() untuk verifikasi kredensial
     * 3. Jika berhasil: log aktivitas login, redirect ke dashboard sesuai role (7 roles)
     * 4. Jika gagal: log failed login, return error ke frontend
     *
     * @param LoginRequest $request — request yang sudah divalidasi
     * @return RedirectResponse — redirect ke dashboard atau kembali ke login dengan error
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        // Ambil data yang sudah divalidasi
        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        // Attempt login menggunakan AuthService
        $loginSuccessful = $this->authService->attempt($credentials, $remember);

        if (!$loginSuccessful) {
            // Login gagal - log failed attempt untuk security monitoring
            $this->auditLogService->logFailedLogin($credentials['email'], $request);

            // Return error ke frontend
            return back()->withErrors([
                'email' => 'Email atau password salah.',
            ])->onlyInput('email');
        }

        // Login berhasil
        // Note: session regeneration sudah dilakukan di AuthService::attempt()

        // Ambil user yang baru login
        $user = auth()->user();

        // Log aktivitas login ke audit trail
        $this->auditLogService->logLogin($user, $request);

        // Ambil dashboard route sebelum redirect
        $dashboardRoute = $user->getDashboardRoute();
        
        // Redirect ke dashboard sesuai role user (7 roles)
        // Menggunakan with() untuk memastikan flash message ter-set
        return redirect()->route($dashboardRoute)->with('success', 'Login berhasil!');
    }

    /**
     * showRegister
     *
     * Apa yang dilakukan fungsi ini:
     * Menampilkan halaman registrasi menggunakan Inertia.
     *
     * Cara kerjanya:
     * 1. Render komponen React 'Auth/Register' melalui Inertia
     * 2. Inertia akan otomatis passing errors dari session jika ada
     *
     * @return Response — Inertia response untuk render halaman register
     */
    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * register
     *
     * Apa yang dilakukan fungsi ini:
     * Memproses registrasi user baru dengan role 'vendor' beserta data perusahaan.
     *
     * Cara kerjanya:
     * 1. Terima dan validasi input dari RegisterRequest (email, password, company_name, pic_name, pic_phone, address)
     * 2. Panggil AuthService->register() untuk buat user vendor + data perusahaan
     * 3. AuthService akan otomatis login user yang baru dibuat
     * 4. Log aktivitas registrasi ke audit trail
     * 5. Redirect ke vendor dashboard dengan flash message sukses
     *
     * @param RegisterRequest $request — request yang sudah divalidasi
     * @return RedirectResponse — redirect ke vendor dashboard
     */
    public function register(RegisterRequest $request): RedirectResponse
    {
        // Buat user vendor baru beserta data perusahaan menggunakan AuthService
        // AuthService akan otomatis set role 'vendor' dan login user
        $user = $this->authService->register($request->validated());

        // Log aktivitas registrasi ke audit trail
        $this->auditLogService->logRegister($user);

        // Redirect ke vendor dashboard dengan pesan sukses
        return redirect()->route('vendor.dashboard')->with('success', 'Akun berhasil dibuat. Selamat datang!');
    }

    /**
     * logout
     *
     * Apa yang dilakukan fungsi ini:
     * Memproses logout user dan menghapus session.
     *
     * Cara kerjanya:
     * 1. Ambil data user sebelum logout (untuk logging)
     * 2. Log aktivitas logout ke audit trail
     * 3. Panggil AuthService->logout() untuk hapus session dan regenerate token
     * 4. Redirect ke halaman login dengan flash message
     *
     * @param Request $request — HTTP request
     * @return RedirectResponse — redirect ke halaman login
     */
    public function logout(Request $request): RedirectResponse
    {
        // Ambil user sebelum logout untuk logging
        $user = auth()->user();

        // Log aktivitas logout ke audit trail
        $this->auditLogService->logLogout($user);

        // Logout user dan hapus session
        $this->authService->logout();

        // Redirect ke login dengan pesan sukses
        return redirect()->route('login')->with('success', 'Anda berhasil logout.');
    }
}
