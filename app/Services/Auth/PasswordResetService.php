<?php

namespace App\Services\Auth;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
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
 * 4. Log semua operasi penting untuk monitoring dan debugging
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
        Log::info('PASSWORD_RESET_SEND_LINK_START', [
            'email' => $email,
        ]);

        try {
            // Cari user berdasarkan email
            $user = User::where('email', $email)->first();

            if (!$user) {
                Log::warning('PASSWORD_RESET_USER_NOT_FOUND', [
                    'email' => $email,
                ]);

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

            Log::info('PASSWORD_RESET_TOKEN_CREATED', [
                'email' => $email,
                'user_id' => $user->id,
            ]);

            // Kirim email berisi link reset password menggunakan Mailable class
            Mail::to($email)->send(new ResetPasswordMail($token, $email));

            Log::info('PASSWORD_RESET_EMAIL_SENT', [
                'email' => $email,
                'user_id' => $user->id,
            ]);

        } catch (\Exception $e) {
            Log::error('PASSWORD_RESET_SEND_LINK_FAILED', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
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

        Log::info('PASSWORD_RESET_START', [
            'email' => $email,
        ]);

        DB::beginTransaction();

        try {
            // Ambil data token dari database
            $resetRecord = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->first();

            // Validasi: token harus ada di database
            if (!$resetRecord) {
                Log::warning('PASSWORD_RESET_TOKEN_NOT_FOUND', [
                    'email' => $email,
                ]);

                throw new \Exception('Token reset password tidak valid atau sudah digunakan.');
            }

            // Validasi: token harus cocok dengan yang di database
            if (!Hash::check($token, $resetRecord->token)) {
                Log::warning('PASSWORD_RESET_TOKEN_MISMATCH', [
                    'email' => $email,
                ]);

                throw new \Exception('Token reset password tidak valid.');
            }

            // Validasi: token tidak boleh lebih dari 60 menit
            $tokenAge = Carbon::parse($resetRecord->created_at)->diffInMinutes(Carbon::now());
            if ($tokenAge > 60) {
                // Hapus token yang sudah expired
                DB::table('password_reset_tokens')
                    ->where('email', $email)
                    ->delete();

                Log::warning('PASSWORD_RESET_TOKEN_EXPIRED', [
                    'email' => $email,
                    'token_age_minutes' => $tokenAge,
                ]);

                throw new \Exception('Token reset password sudah kadaluarsa. Silakan request ulang.');
            }

            // Cari user berdasarkan email
            $user = User::where('email', $email)->first();

            if (!$user) {
                Log::error('PASSWORD_RESET_USER_NOT_FOUND', [
                    'email' => $email,
                ]);

                throw new \Exception('User tidak ditemukan.');
            }

            // Update password user
            $user->password = $newPassword;
            $user->save();

            Log::info('PASSWORD_RESET_PASSWORD_UPDATED', [
                'user_id' => $user->id,
                'email' => $email,
            ]);

            // Hapus token dari database (token hanya bisa dipakai sekali)
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            DB::commit();

            Log::info('PASSWORD_RESET_SUCCESS', [
                'user_id' => $user->id,
                'email' => $email,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('PASSWORD_RESET_FAILED', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
