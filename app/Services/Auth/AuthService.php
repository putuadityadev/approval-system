<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * AuthService
 *
 * Fungsi file ini:
 * - Mengelola semua logika bisnis terkait authentication
 * - Bertanggung jawab untuk register vendor, login, dan logout
 * - Memisahkan business logic dari controller agar controller tetap tipis
 *
 * Cara kerja:
 * 1. Menerima data dari controller yang sudah divalidasi
 * 2. Memproses logika authentication (register, login, logout)
 * 3. Mengembalikan hasil atau throw exception jika ada error
 * 4. Log semua operasi penting untuk monitoring dan debugging
 *
 * Digunakan oleh: AuthController
 */
class AuthService
{
    /**
     * register
     *
     * Apa yang dilakukan fungsi ini:
     * Register vendor baru dengan data perusahaan, auto-login setelah register.
     *
     * Cara kerjanya:
     * 1. Buat user baru dengan role 'vendor'
     * 2. Buat vendor record dengan data perusahaan
     * 3. Auto-login user yang baru dibuat
     * 4. Return user object
     *
     * @param array $data — data yang berisi email, password, dan data vendor
     * @return User
     * @throws \Exception — jika terjadi error saat create user atau vendor
     */
    public function register(array $data): User
    {
        Log::info('AUTH_REGISTER_VENDOR_START', [
            'email' => $data['email'],
            'company_name' => $data['company_name'],
        ]);

        DB::beginTransaction();

        try {
            // Buat user baru dengan role vendor
            $user = User::create([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'vendor',
                'is_active' => true,
                'email_verified_at' => now(), // Auto-verify untuk MVP
            ]);

            Log::info('AUTH_REGISTER_VENDOR_USER_CREATED', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            // Buat vendor record dengan data perusahaan
            $vendor = Vendor::create([
                'user_id' => $user->id,
                'company_name' => $data['company_name'],
                'pic_name' => $data['pic_name'],
                'pic_phone' => $data['pic_phone'],
                'address' => $data['address'],
            ]);

            Log::info('AUTH_REGISTER_VENDOR_COMPANY_CREATED', [
                'vendor_id' => $vendor->id,
                'user_id' => $user->id,
                'company_name' => $vendor->company_name,
            ]);

            // Auto-login user yang baru dibuat
            Auth::login($user);

            DB::commit();

            Log::info('AUTH_REGISTER_VENDOR_SUCCESS', [
                'user_id' => $user->id,
                'email' => $user->email,
                'company_name' => $vendor->company_name,
            ]);

            return $user;

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('AUTH_REGISTER_VENDOR_FAILED', [
                'email' => $data['email'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal melakukan registrasi. Silakan coba lagi.');
        }
    }

    /**
     * attempt
     *
     * Apa yang dilakukan fungsi ini:
     * Login user dengan kredensial yang diberikan.
     *
     * Cara kerjanya:
     * 1. Check apakah kredensial valid
     * 2. Check apakah user aktif (is_active = true)
     * 3. Jika valid dan aktif, login user
     * 4. Return true jika berhasil, false jika gagal
     *
     * @param array $credentials — data yang berisi email dan password
     * @param bool $remember — apakah user ingin "remember me"
     * @return bool
     */
    public function attempt(array $credentials, bool $remember = false): bool
    {
        Log::info('AUTH_LOGIN_ATTEMPT', [
            'email' => $credentials['email'],
            'remember' => $remember,
        ]);

        try {
            // Coba login dengan kredensial yang diberikan
            if (Auth::attempt($credentials, $remember)) {
                // Check apakah user aktif
                $user = Auth::user();
                
                if (!$user->is_active) {
                    // Jika user tidak aktif, logout dan return false
                    Log::warning('AUTH_LOGIN_INACTIVE_USER', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'role' => $user->role,
                    ]);

                    Auth::logout();
                    return false;
                }

                // Regenerate session untuk security
                request()->session()->regenerate();
                
                Log::info('AUTH_LOGIN_SUCCESS', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                ]);

                return true;
            }

            Log::warning('AUTH_LOGIN_INVALID_CREDENTIALS', [
                'email' => $credentials['email'],
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('AUTH_LOGIN_FAILED', [
                'email' => $credentials['email'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * logout
     *
     * Apa yang dilakukan fungsi ini:
     * Logout user dan hapus session.
     *
     * Cara kerjanya:
     * 1. Logout user dari sistem
     * 2. Invalidate session
     * 3. Regenerate CSRF token
     *
     * @return void
     */
    public function logout(): void
    {
        $user = Auth::user();

        Log::info('AUTH_LOGOUT', [
            'user_id' => $user?->id,
            'email' => $user?->email,
            'role' => $user?->role,
        ]);

        try {
            Auth::logout();

            request()->session()->invalidate();
            request()->session()->regenerateToken();

            Log::info('AUTH_LOGOUT_SUCCESS', [
                'user_id' => $user?->id,
            ]);

        } catch (\Exception $e) {
            Log::error('AUTH_LOGOUT_FAILED', [
                'user_id' => $user?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * createUser
     *
     * Apa yang dilakukan fungsi ini:
     * Create user baru oleh Super Admin (untuk role non-vendor).
     *
     * Cara kerjanya:
     * 1. Buat user baru dengan role yang dipilih
     * 2. Set is_active = true by default
     * 3. Auto-verify email
     * 4. Return user object
     *
     * @param array $data — data yang berisi email, password, dan role
     * @return User
     * @throws \Exception — jika terjadi error saat create user
     */
    public function createUser(array $data): User
    {
        Log::info('AUTH_CREATE_USER_START', [
            'email' => $data['email'],
            'role' => $data['role'],
            'admin_id' => Auth::id(),
        ]);

        try {
            $user = User::create([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            Log::info('AUTH_CREATE_USER_SUCCESS', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'admin_id' => Auth::id(),
            ]);

            return $user;

        } catch (\Exception $e) {
            Log::error('AUTH_CREATE_USER_FAILED', [
                'email' => $data['email'],
                'role' => $data['role'],
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal membuat user. Silakan coba lagi.');
        }
    }

    /**
     * updateUser
     *
     * Apa yang dilakukan fungsi ini:
     * Update user oleh Super Admin.
     *
     * Cara kerjanya:
     * 1. Update email jika ada
     * 2. Update password jika ada (di-hash)
     * 3. Update is_active jika ada
     * 4. Return user object
     *
     * @param User $user — user yang akan diupdate
     * @param array $data — data yang akan diupdate
     * @return User
     * @throws \Exception — jika terjadi error saat update user
     */
    public function updateUser(User $user, array $data): User
    {
        Log::info('AUTH_UPDATE_USER_START', [
            'user_id' => $user->id,
            'email' => $user->email,
            'admin_id' => Auth::id(),
            'changes' => array_keys($data),
        ]);

        try {
            // Update email jika ada
            if (isset($data['email'])) {
                $user->email = $data['email'];
            }

            // Update password jika ada
            if (isset($data['password']) && !empty($data['password'])) {
                $user->password = Hash::make($data['password']);
            }

            // Update is_active jika ada
            if (isset($data['is_active'])) {
                $user->is_active = $data['is_active'];
            }

            $user->save();

            Log::info('AUTH_UPDATE_USER_SUCCESS', [
                'user_id' => $user->id,
                'email' => $user->email,
                'admin_id' => Auth::id(),
            ]);

            return $user;

        } catch (\Exception $e) {
            Log::error('AUTH_UPDATE_USER_FAILED', [
                'user_id' => $user->id,
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal mengupdate user. Silakan coba lagi.');
        }
    }

    /**
     * deactivateUser
     *
     * Apa yang dilakukan fungsi ini:
     * Deactivate user (soft delete dengan set is_active = false).
     *
     * Cara kerjanya:
     * 1. Set is_active = false
     * 2. User tidak bisa login lagi
     * 3. Data user tetap ada di database
     *
     * @param User $user — user yang akan dideactivate
     * @return User
     * @throws \Exception — jika terjadi error saat deactivate user
     */
    public function deactivateUser(User $user): User
    {
        Log::info('AUTH_DEACTIVATE_USER_START', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'admin_id' => Auth::id(),
        ]);

        try {
            $user->is_active = false;
            $user->save();

            Log::info('AUTH_DEACTIVATE_USER_SUCCESS', [
                'user_id' => $user->id,
                'email' => $user->email,
                'admin_id' => Auth::id(),
            ]);

            return $user;

        } catch (\Exception $e) {
            Log::error('AUTH_DEACTIVATE_USER_FAILED', [
                'user_id' => $user->id,
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal menonaktifkan user. Silakan coba lagi.');
        }
    }

    /**
     * activateUser
     *
     * Apa yang dilakukan fungsi ini:
     * Activate user yang sebelumnya dideactivate.
     *
     * Cara kerjanya:
     * 1. Set is_active = true
     * 2. User bisa login lagi
     *
     * @param User $user — user yang akan diactivate
     * @return User
     * @throws \Exception — jika terjadi error saat activate user
     */
    public function activateUser(User $user): User
    {
        Log::info('AUTH_ACTIVATE_USER_START', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'admin_id' => Auth::id(),
        ]);

        try {
            $user->is_active = true;
            $user->save();

            Log::info('AUTH_ACTIVATE_USER_SUCCESS', [
                'user_id' => $user->id,
                'email' => $user->email,
                'admin_id' => Auth::id(),
            ]);

            return $user;

        } catch (\Exception $e) {
            Log::error('AUTH_ACTIVATE_USER_FAILED', [
                'user_id' => $user->id,
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal mengaktifkan user. Silakan coba lagi.');
        }
    }
}
