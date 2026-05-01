<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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
     */
    public function register(array $data): User
    {
        // Buat user baru dengan role vendor
        $user = User::create([
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'vendor',
            'is_active' => true,
            'email_verified_at' => now(), // Auto-verify untuk MVP
        ]);

        // Buat vendor record dengan data perusahaan
        Vendor::create([
            'user_id' => $user->id,
            'company_name' => $data['company_name'],
            'pic_name' => $data['pic_name'],
            'pic_phone' => $data['pic_phone'],
            'address' => $data['address'],
        ]);

        // Auto-login user yang baru dibuat
        Auth::login($user);

        return $user;
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
        // Coba login dengan kredensial yang diberikan
        if (Auth::attempt($credentials, $remember)) {
            // Check apakah user aktif
            $user = Auth::user();
            
            if (!$user->is_active) {
                // Jika user tidak aktif, logout dan return false
                Auth::logout();
                return false;
            }

            // Regenerate session untuk security
            request()->session()->regenerate();
            
            return true;
        }

        return false;
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
        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();
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
     */
    public function createUser(array $data): User
    {
        return User::create([
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
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
     */
    public function updateUser(User $user, array $data): User
    {
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

        return $user;
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
     */
    public function deactivateUser(User $user): User
    {
        $user->is_active = false;
        $user->save();

        return $user;
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
     */
    public function activateUser(User $user): User
    {
        $user->is_active = true;
        $user->save();

        return $user;
    }
}
