<?php

/**
 * AdminSeeder
 *
 * Fungsi seeder ini:
 * - Membuat akun admin default untuk testing dan initial setup
 * - Akun ini digunakan untuk akses admin dashboard
 *
 * Cara kerja:
 * 1. Cek apakah admin dengan email admin@mall.com sudah ada
 * 2. Jika belum ada, buat user baru dengan role admin
 * 3. Set email_verified_at agar akun langsung aktif
 *
 * Digunakan oleh: DatabaseSeeder untuk setup awal aplikasi
 */

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * run
     *
     * Apa yang dilakukan fungsi ini:
     * Membuat akun admin default dengan kredensial yang sudah ditentukan.
     *
     * Cara kerjanya:
     * 1. Cek apakah admin dengan email admin@mall.com sudah ada di database
     * 2. Jika belum ada, buat user baru dengan role admin
     * 3. Password di-hash menggunakan bcrypt untuk keamanan
     * 4. Set email_verified_at ke waktu sekarang agar akun langsung aktif
     *
     * @return void
     */
    public function run(): void
    {
        // Cek apakah admin sudah ada
        $adminExists = User::where('email', 'admin@mall.com')->exists();

        if (!$adminExists) {
            User::create([
                'name' => 'Admin Mall',
                'email' => 'admin@mall.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);

            $this->command->info('✓ Admin default berhasil dibuat (admin@mall.com / password123)');
        } else {
            $this->command->info('✓ Admin default sudah ada, skip seeding');
        }
    }
}
