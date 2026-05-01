<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * AuthService
 *
 * Fungsi file ini:
 * - Mengelola semua logika bisnis terkait authentication
 * - Bertanggung jawab untuk registrasi user baru, login, dan logout
 * - Memisahkan business logic dari controller agar controller tetap tipis
 *
 * Cara kerja:
 * 1. Menerima data dari controller yang sudah divalidasi
 * 2. Memproses logika authentication (create user, verify credentials, destroy session)
 * 3. Mengembalikan hasil atau melakukan side effect (login/logout)
 *
 * Digunakan oleh: AuthController
 */
class AuthService
{
    /**
     * register
     *
     * Apa yang dilakukan fungsi ini:
     * Membuat user baru dengan role 'requester' dan otomatis login user tersebut.
     *
     * Cara kerjanya:
     * 1. Buat user baru dengan data yang diberikan
     * 2. Set role sebagai 'requester' (tidak bisa membuat admin via registrasi)
     * 3. Hash password sebelum disimpan ke database
     * 4. Simpan user ke database
     * 5. Otomatis login user yang baru dibuat
     * 6. Kembalikan object user
     *
     * @param array $data — data user yang sudah divalidasi (name, email, password)
     * @return User — user yang baru dibuat
     */
    public function register(array $data): User
    {
        // Buat user baru dengan role requester
        // Password akan otomatis di-hash oleh mutator di User model
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // akan di-hash otomatis
            'role' => 'requester', // hardcode role requester untuk self-registration
        ]);

        // Auto-login user yang baru dibuat
        Auth::login($user);

        return $user;
    }

    /**
     * attempt
     *
     * Apa yang dilakukan fungsi ini:
     * Mencoba login user dengan kredensial yang diberikan.
     *
     * Cara kerjanya:
     * 1. Terima email dan password dari parameter credentials
     * 2. Gunakan Auth::attempt() untuk verifikasi kredensial
     * 3. Jika remember = true, buat persistent session (remember me)
     * 4. Kembalikan true jika berhasil, false jika gagal
     *
     * @param array $credentials — kredensial login (email, password)
     * @param bool $remember — apakah user ingin "remember me"
     * @return bool — true jika login berhasil, false jika gagal
     */
    public function attempt(array $credentials, bool $remember = false): bool
    {
        // Attempt login dengan kredensial yang diberikan
        // Laravel akan otomatis hash password dan compare dengan database
        return Auth::attempt($credentials, $remember);
    }

    /**
     * logout
     *
     * Apa yang dilakukan fungsi ini:
     * Logout user dan hapus session serta remember token.
     *
     * Cara kerjanya:
     * 1. Hapus session user yang sedang login
     * 2. Hapus remember_token dari database (jika ada)
     * 3. Regenerate session ID untuk keamanan (prevent session fixation)
     *
     * @return void
     */
    public function logout(): void
    {
        // Logout user dan hapus session
        Auth::logout();

        // Regenerate session ID untuk keamanan
        // Ini mencegah session fixation attack
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
}
