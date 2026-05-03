<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * SecuritySeeder
 *
 * Seeder untuk membuat akun Security default untuk testing.
 *
 * Fungsi seeder ini:
 * - Membuat 1 akun Security dengan kredensial default
 * - Security bisa scan QR code dan verifikasi lapangan
 *
 * Cara kerja:
 * 1. Check apakah sudah ada Security dengan email yang sama
 * 2. Jika belum ada, buat akun baru
 * 3. Jika sudah ada, update password-nya
 * 4. Password di-hash dengan bcrypt
 *
 * Kredensial Default:
 * - Email: security@mall.com
 * - Password: Security123!
 * - Role: security
 */
class SecuritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = 'security@mall.com';
        $password = Hash::make('Security123!');

        $user = User::where('email', $email)->first();

        if ($user) {
            // Update password jika user sudah ada
            $user->update([
                'password' => $password,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $this->command->info('✅ Security sudah ada. Password di-update.');
        } else {
            // Buat user baru
            User::create([
                'email' => $email,
                'password' => $password,
                'role' => 'security',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $this->command->info('✅ Security berhasil dibuat!');
        }

        $this->command->info('');
        $this->command->info('📧 Email: security@mall.com');
        $this->command->info('🔑 Password: Security123!');
        $this->command->warn('⚠️  PENTING: Ganti password setelah login pertama kali!');
    }
}
