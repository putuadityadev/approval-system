<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * AuditLogService
 *
 * Fungsi file ini:
 * - Mengelola semua logika bisnis terkait audit logging
 * - Bertanggung jawab untuk mencatat semua aktivitas user
 * - Menyimpan: user_id, user_email, action, ip_address, user_agent, timestamp
 *
 * Cara kerja:
 * 1. Menerima data user dan request dari controller
 * 2. Menyimpan log ke database dengan format yang konsisten
 * 3. Log bersifat immutable (tidak bisa diupdate/delete)
 * 4. Jika gagal menyimpan audit log, log error tapi jangan throw exception (agar tidak mengganggu flow utama)
 *
 * Digunakan oleh: AuthController, AdminController
 */
class AuditLogService
{
    /**
     * logLogin
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas login user yang berhasil.
     *
     * Cara kerjanya:
     * 1. Ambil IP address dan user agent dari request
     * 2. Simpan log dengan action 'LOGIN'
     * 3. Simpan user_id, email, role, IP, dan user agent
     *
     * @param User $user — user yang login
     * @param Request $request — request object untuk ambil IP dan user agent
     * @return void
     */
    public function logLogin(User $user, Request $request): void
    {
        try {
            AuditLog::create([
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'action' => 'LOGIN',
                'details' => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('AUDIT_LOG_LOGIN_FAILED', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * logLogout
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas logout user.
     *
     * Cara kerjanya:
     * 1. Ambil IP address dan user agent dari request
     * 2. Simpan log dengan action 'LOGOUT'
     *
     * @param User $user — user yang logout
     * @return void
     */
    public function logLogout(User $user): void
    {
        try {
            AuditLog::create([
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'action' => 'LOGOUT',
                'details' => null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('AUDIT_LOG_LOGOUT_FAILED', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * logRegister
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas register vendor baru.
     *
     * Cara kerjanya:
     * 1. Simpan log dengan action 'REGISTER'
     * 2. Simpan company_name di details untuk tracking
     *
     * @param User $user — user yang baru register
     * @return void
     */
    public function logRegister(User $user): void
    {
        try {
            $details = null;
            
            // Jika user adalah vendor, simpan company_name di details
            if ($user->isVendor() && $user->vendor) {
                $details = [
                    'company_name' => $user->vendor->company_name,
                ];
            }

            AuditLog::create([
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'action' => 'REGISTER',
                'details' => $details,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('AUDIT_LOG_REGISTER_FAILED', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * logFailedLogin
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas login yang gagal (untuk security monitoring).
     *
     * Cara kerjanya:
     * 1. Simpan log dengan action 'FAILED_LOGIN'
     * 2. user_id = NULL karena login gagal
     * 3. Simpan email yang dicoba untuk tracking
     *
     * @param string $email — email yang dicoba untuk login
     * @param Request $request — request object untuk ambil IP dan user agent
     * @return void
     */
    public function logFailedLogin(string $email, Request $request): void
    {
        try {
            AuditLog::create([
                'user_id' => null,
                'user_email' => $email,
                'user_role' => 'unknown',
                'action' => 'FAILED_LOGIN',
                'details' => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('AUDIT_LOG_FAILED_LOGIN_FAILED', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * logPasswordReset
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas reset password.
     *
     * Cara kerjanya:
     * 1. Simpan log dengan action 'PASSWORD_RESET'
     * 2. Simpan user_id dan email
     *
     * @param User $user — user yang reset password
     * @return void
     */
    public function logPasswordReset(User $user): void
    {
        try {
            AuditLog::create([
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'action' => 'PASSWORD_RESET',
                'details' => null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('AUDIT_LOG_PASSWORD_RESET_FAILED', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * logCreateUser
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas Super Admin create user baru.
     *
     * Cara kerjanya:
     * 1. Simpan log dengan action 'CREATE_USER'
     * 2. Simpan details: email dan role user yang dibuat
     *
     * @param User $admin — Super Admin yang create user
     * @param User $createdUser — User yang baru dibuat
     * @return void
     */
    public function logCreateUser(User $admin, User $createdUser): void
    {
        try {
            AuditLog::create([
                'user_id' => $admin->id,
                'user_email' => $admin->email,
                'user_role' => $admin->role,
                'action' => 'CREATE_USER',
                'details' => [
                    'created_user_email' => $createdUser->email,
                    'created_user_role' => $createdUser->role,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('AUDIT_LOG_CREATE_USER_FAILED', [
                'admin_id' => $admin->id,
                'created_user_id' => $createdUser->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * logUpdateUser
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas Super Admin update user.
     *
     * Cara kerjanya:
     * 1. Simpan log dengan action 'UPDATE_USER'
     * 2. Simpan details: email user yang diupdate
     *
     * @param User $admin — Super Admin yang update user
     * @param User $updatedUser — User yang diupdate
     * @return void
     */
    public function logUpdateUser(User $admin, User $updatedUser): void
    {
        try {
            AuditLog::create([
                'user_id' => $admin->id,
                'user_email' => $admin->email,
                'user_role' => $admin->role,
                'action' => 'UPDATE_USER',
                'details' => [
                    'updated_user_email' => $updatedUser->email,
                    'updated_user_role' => $updatedUser->role,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('AUDIT_LOG_UPDATE_USER_FAILED', [
                'admin_id' => $admin->id,
                'updated_user_id' => $updatedUser->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * logDeactivateUser
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas Super Admin deactivate user.
     *
     * Cara kerjanya:
     * 1. Simpan log dengan action 'DEACTIVATE_USER'
     * 2. Simpan details: email user yang dideactivate
     *
     * @param User $admin — Super Admin yang deactivate user
     * @param User $deactivatedUser — User yang dideactivate
     * @return void
     */
    public function logDeactivateUser(User $admin, User $deactivatedUser): void
    {
        try {
            AuditLog::create([
                'user_id' => $admin->id,
                'user_email' => $admin->email,
                'user_role' => $admin->role,
                'action' => 'DEACTIVATE_USER',
                'details' => [
                    'deactivated_user_email' => $deactivatedUser->email,
                    'deactivated_user_role' => $deactivatedUser->role,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('AUDIT_LOG_DEACTIVATE_USER_FAILED', [
                'admin_id' => $admin->id,
                'deactivated_user_id' => $deactivatedUser->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * logActivateUser
     *
     * Apa yang dilakukan fungsi ini:
     * Mencatat aktivitas Super Admin activate user.
     *
     * Cara kerjanya:
     * 1. Simpan log dengan action 'ACTIVATE_USER'
     * 2. Simpan details: email user yang diactivate
     *
     * @param User $admin — Super Admin yang activate user
     * @param User $activatedUser — User yang diactivate
     * @return void
     */
    public function logActivateUser(User $admin, User $activatedUser): void
    {
        try {
            AuditLog::create([
                'user_id' => $admin->id,
                'user_email' => $admin->email,
                'user_role' => $admin->role,
                'action' => 'ACTIVATE_USER',
                'details' => [
                    'activated_user_email' => $activatedUser->email,
                    'activated_user_role' => $activatedUser->role,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('AUDIT_LOG_ACTIVATE_USER_FAILED', [
                'admin_id' => $admin->id,
                'activated_user_id' => $activatedUser->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
