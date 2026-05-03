<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * ApproverSeeder
 *
 * Seeder untuk membuat akun Approver default untuk testing.
 *
 * Fungsi seeder ini:
 * - Membuat 4 akun Approver (Dept, Ops, Finance, GM)
 * - Setiap approver punya password yang sama untuk kemudahan testing
 *
 * Cara kerja:
 * 1. Check apakah sudah ada approver dengan email yang sama
 * 2. Jika belum ada, buat akun baru
 * 3. Jika sudah ada, update password-nya
 * 4. Password di-hash dengan bcrypt
 *
 * Kredensial Default:
 * - Approver Dept: approverdept@mall.com / Approver123!
 * - Approver Ops: approverops@mall.com / Approver123!
 * - Approver Finance: approverfinance@mall.com / Approver123!
 * - Approver GM: approvergm@mall.com / Approver123!
 */
class ApproverSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $approvers = [
            [
                'email' => 'approverdept@mall.com',
                'role' => 'approver_dept',
                'label' => 'Approver Departemen',
            ],
            [
                'email' => 'approverops@mall.com',
                'role' => 'approver_ops',
                'label' => 'Approver Operasional',
            ],
            [
                'email' => 'approverfinance@mall.com',
                'role' => 'approver_finance',
                'label' => 'Approver Finance',
            ],
            [
                'email' => 'approvergm@mall.com',
                'role' => 'approver_gm',
                'label' => 'Approver GM Operation',
            ],
        ];

        $password = Hash::make('Approver123!');

        foreach ($approvers as $approverData) {
            $user = User::where('email', $approverData['email'])->first();

            if ($user) {
                // Update password jika user sudah ada
                $user->update([
                    'password' => $password,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);
                $this->command->info("✅ {$approverData['label']} sudah ada. Password di-update.");
            } else {
                // Buat user baru
                User::create([
                    'email' => $approverData['email'],
                    'password' => $password,
                    'role' => $approverData['role'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);
                $this->command->info("✅ {$approverData['label']} berhasil dibuat!");
            }
        }

        $this->command->info('');
        $this->command->info('📧 Email & Password untuk semua Approver:');
        $this->command->info('   - approverdept@mall.com / Approver123!');
        $this->command->info('   - approverops@mall.com / Approver123!');
        $this->command->info('   - approverfinance@mall.com / Approver123!');
        $this->command->info('   - approvergm@mall.com / Approver123!');
        $this->command->warn('⚠️  PENTING: Ganti password setelah login pertama kali!');
    }
}
