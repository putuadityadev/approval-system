<?php

namespace App\Services\Auth;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * PasswordResetService
 *
 * Fungsi file ini:
 * - Mengelola semua logika bisnis terkait password reset
 * - Bertanggung jawab untuk generate token, kirim email, dan reset password
 * - Memisahkan business logic dari controller agar controller tetap tipis
 *
 * Cara kerja:
 * 1. Menerima data dari controller yang sudah divalidasi
 * 2. Memproses logika password reset (generate token, validasi token, update password)
 * 3. Mengembalikan hasil atau throw exception jika ada error
 *
 * Digunakan oleh: PasswordResetController
 */
class PasswordResetService
{
    /**
     * sendResetLink
     *
     * Apa yang dilakukan fungsi ini:
     * Generate token reset password, simpan ke database, dan kirim email ke user.
     *
     * Cara kerjanya:
     * 1. Cari user berdasarkan email
     * 2. Generate token random yang aman
     * 3. Hash token sebelum disimpan ke database (security best practice)
     * 4. Simpan token ke table password_reset_tokens dengan timestamp
     * 5. Kirim email berisi link reset password ke user
     *
     * @param string $email — email user yang request reset password
     * @return void
     * @throws \Exception — jika user tidak ditemukan atau email gagal dikirim
     */
    public function sendResetLink(string $email): void
    {
        // Cari user berdasarkan email
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('User dengan email tersebut tidak ditemukan.');
        }

        // Generate token random yang aman (60 karakter)
        $token = Str::random(60);

        // Hapus token lama jika ada (satu email hanya boleh punya satu token aktif)
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();

        // Simpan token baru ke database
        // Token di-hash untuk keamanan (jika database bocor, token tidak bisa dipakai)
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        // Kirim email berisi link reset password menggunakan Mailable class
        // Email akan menggunakan template Blade yang sudah dibuat
        // Untuk development, email akan masuk ke log (MAIL_MAILER=log di .env)
        // Untuk production, ganti dengan SMTP yang proper
        Mail::to($email, $user->name)->send(new ResetPasswordMail($token, $email));
    }

    /**
     * resetPassword
     *
     * Apa yang dilakukan fungsi ini:
     * Validasi token reset password, update password user, dan hapus token dari database.
     *
     * Cara kerjanya:
     * 1. Ambil data token dari database berdasarkan email
     * 2. Validasi apakah token cocok dengan yang di database (compare hash)
     * 3. Validasi apakah token belum expired (maksimal 60 menit)
     * 4. Update password user di database
     * 5. Hapus token dari database (token hanya bisa dipakai sekali)
     *
     * @param array $data — data yang berisi email, token, dan password baru
     * @return void
     * @throws \Exception — jika token tidak valid, expired, atau user tidak ditemukan
     */
    public function resetPassword(array $data): void
    {
        $email = $data['email'];
        $token = $data['token'];
        $newPassword = $data['password'];

        // Ambil data token dari database
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        // Validasi: token harus ada di database
        if (!$resetRecord) {
            throw new \Exception('Token reset password tidak valid atau sudah digunakan.');
        }

        // Validasi: token harus cocok dengan yang di database
        // Gunakan Hash::check() karena token di database sudah di-hash
        if (!Hash::check($token, $resetRecord->token)) {
            throw new \Exception('Token reset password tidak valid.');
        }

        // Validasi: token tidak boleh lebih dari 60 menit
        $tokenAge = Carbon::parse($resetRecord->created_at)->diffInMinutes(Carbon::now());
        if ($tokenAge > 60) {
            // Hapus token yang sudah expired
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            throw new \Exception('Token reset password sudah kadaluarsa. Silakan request ulang.');
        }

        // Cari user berdasarkan email
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('User tidak ditemukan.');
        }

        // Update password user
        // Password akan otomatis di-hash oleh cast 'hashed' di User model
        $user->password = $newPassword;
        $user->save();

        // Hapus token dari database (token hanya bisa dipakai sekali)
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();
    }
}
