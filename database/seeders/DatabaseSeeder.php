<?php

/**
 * DatabaseSeeder
 *
 * Fungsi seeder ini:
 * - Memanggil semua seeder untuk setup data awal aplikasi
 * - Digunakan saat development dan testing
 *
 * Cara kerja:
 * 1. Panggil AdminSeeder untuk membuat akun admin default
 * 2. Bisa ditambahkan seeder lain sesuai kebutuhan
 *
 * Digunakan oleh: Command `php artisan db:seed`
 */

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * run
     *
     * Apa yang dilakukan fungsi ini:
     * Menjalankan semua seeder untuk setup data awal aplikasi.
     *
     * Cara kerjanya:
     * 1. Panggil SuperAdminSeeder untuk membuat akun super admin default
     * 2. Panggil ApproverSeeder untuk membuat akun approver (4 level)
     * 3. Panggil SecuritySeeder untuk membuat akun security
     *
     * @return void
     */
    public function run(): void
    {
        // Buat akun default untuk semua role
        $this->call([
            SuperAdminSeeder::class,
            ApproverSeeder::class,
            SecuritySeeder::class,
        ]);
    }
}
