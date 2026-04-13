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
     * 1. Panggil AdminSeeder untuk membuat akun admin default
     * 2. Seeder lain bisa ditambahkan di sini sesuai kebutuhan
     *
     * @return void
     */
    public function run(): void
    {
        // Buat akun admin default
        $this->call([
            AdminSeeder::class,
        ]);
    }
}
