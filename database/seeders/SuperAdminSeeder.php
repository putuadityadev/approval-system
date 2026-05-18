<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * SuperAdminSeeder
 *
 * Seeder untuk membuat akun Super Admin default.
 *
 * Fungsi seeder ini:
 * - Membuat 1 akun Super Admin dengan kredensial default
 * - Super Admin bisa manage semua user dan sistem
 *
 * Cara kerja:
 * 1. Check apakah sudah ada Super Admin
 * 2. Jika belum ada, buat akun baru
 * 3. Password di-hash dengan bcrypt
 *
 * Kredensial Default:
 * - Email: superadmin@mall.com
 * - Password: SuperAdmin123!
 * - Role: super_admin
 */
class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check apakah sudah ada Super Admin
        $existingSuperAdmin = User::where('role', 'super_admin')->first();

        if ($existingSuperAdmin) {
            $this->command->info('Super Admin sudah ada. Skip seeding.');
            return;
        }

        // Buat Super Admin baru — credentials dari environment variable
        $email    = env('SUPER_ADMIN_EMAIL', 'superadmin@approval.local');
        $password = env('SUPER_ADMIN_PASSWORD');

        if (empty($password)) {
            $this->command->error('❌ SUPER_ADMIN_PASSWORD tidak ditemukan di environment!');
            $this->command->error('   Set SUPER_ADMIN_PASSWORD di .env sebelum menjalankan seeder.');
            return;
        }

        User::create([
            'email'             => $email,
            'password'          => Hash::make($password),
            'role'              => 'super_admin',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        $this->command->info('✅ Super Admin berhasil dibuat!');
        $this->command->info("📧 Email: {$email}");
        $this->command->warn('⚠️  Password dikonfigurasi via SUPER_ADMIN_PASSWORD di .env');
    }
}
