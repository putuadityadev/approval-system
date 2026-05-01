<?php

namespace App\Services\Auth;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * AuditLogService
 *
 * Fungsi file ini:
 * - Mengelola semua logging aktivitas authentication dalam sistem
 * - Bertanggung jawab untuk mencatat setiap event penting: login, logout, register, password reset, failed login
 * - Menyimpan informasi lengkap: user_id, user_email, action, ip_address, user_agent, timestamp
 *
 * Cara kerja:
 * 1. Menerima data user dan request dari controller/service
 * 2. Mengekstrak informasi penting (IP address, user agent)
 * 3. Menyimpan log ke database melalui AuditLog model
 * 4. Tidak mencatat data sensitif seperti password (security best practice)
 *
 * Digunakan oleh: AuthController, PasswordResetController, dan service lain yang perlu audit trail
 */
class AuditLogService
{
    /**
     * logLogin
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas login user yang berhasil ke audit trail.
     *
     * Cara kerjanya:
     * 1. Ambil informasi user yang login (id, email)
     * 2. Ambil IP address dan user agent dari request
     * 3. Simpan log dengan action 'login' ke database
     * 4. Timestamp otomatis ditambahkan oleh Laravel
     *
     * @param User $user — user yang berhasil login
     * @param Request $request — HTTP request untuk ambil IP dan user agent
     * @return void
     */
    public function logLogin(User $user, Request $request): void
    {
        AuditLog::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => null, // bisa diisi data tambahan jika diperlukan
        ]);
    }

    /**
     * logLogout
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas logout user ke audit trail.
     *
     * Cara kerjanya:
     * 1. Ambil informasi user yang logout (id, email)
     * 2. Simpan log dengan action 'logout' ke database
     * 3. IP address dan user agent diambil dari request global
     * 4. Timestamp otomatis ditambahkan oleh Laravel
     *
     * @param User $user — user yang melakukan logout
     * @return void
     */
    public function logLogout(User $user): void
    {
        AuditLog::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'action' => 'logout',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => null,
        ]);
    }

    /**
     * logRegister
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas registrasi user baru ke audit trail.
     *
     * Cara kerjanya:
     * 1. Ambil informasi user yang baru terdaftar (id, email)
     * 2. Simpan log dengan action 'register' ke database
     * 3. IP address dan user agent diambil dari request global
     * 4. Timestamp otomatis ditambahkan oleh Laravel
     *
     * @param User $user — user yang baru selesai registrasi
     * @return void
     */
    public function logRegister(User $user): void
    {
        AuditLog::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'action' => 'register',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'role' => $user->role, // simpan role untuk tracking
            ],
        ]);
    }

    /**
     * logPasswordReset
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas password reset yang berhasil ke audit trail.
     *
     * Cara kerjanya:
     * 1. Ambil informasi user yang mereset password (id, email)
     * 2. Simpan log dengan action 'password_reset' ke database
     * 3. IP address dan user agent diambil dari request global
     * 4. Timestamp otomatis ditambahkan oleh Laravel
     *
     * @param User $user — user yang berhasil reset password
     * @return void
     */
    public function logPasswordReset(User $user): void
    {
        AuditLog::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'action' => 'password_reset',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => null,
        ]);
    }

    /**
     * logFailedLogin
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat percobaan login yang gagal ke audit trail untuk security monitoring.
     *
     * Cara kerjanya:
     * 1. Terima email yang digunakan untuk login (meskipun gagal)
     * 2. Simpan log dengan action 'failed_login' ke database
     * 3. user_id diset NULL karena login gagal (user tidak terautentikasi)
     * 4. IP address dan user agent diambil dari request untuk tracking
     * 5. Metadata berisi alasan gagal untuk analisis security
     *
     * @param string $email — email yang digunakan untuk percobaan login
     * @param Request $request — HTTP request untuk ambil IP dan user agent
     * @return void
     */
    public function logFailedLogin(string $email, Request $request): void
    {
        AuditLog::create([
            'user_id' => null, // NULL karena login gagal, user tidak terautentikasi
            'user_email' => $email,
            'action' => 'failed_login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'reason' => 'invalid_credentials', // alasan gagal login
            ],
        ]);
    }

    /**
     * logEmailVerification
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas email verification yang berhasil ke audit trail.
     *
     * Cara kerjanya:
     * 1. Ambil informasi user yang berhasil verifikasi email (id, email)
     * 2. Simpan log dengan action 'email_verification' ke database
     * 3. IP address dan user agent diambil dari request global
     * 4. Timestamp otomatis ditambahkan oleh Laravel
     *
     * @param User $user — user yang berhasil verifikasi email
     * @return void
     */
    public function logEmailVerification(User $user): void
    {
        AuditLog::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'action' => 'email_verification',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => null,
        ]);
    }
}
