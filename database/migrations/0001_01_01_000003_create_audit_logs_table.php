<?php

/**
 * Migration: Create Audit Logs Table
 *
 * Fungsi migration ini:
 * - Membuat table audit_logs untuk mencatat semua aktivitas authentication
 * - Menyimpan log untuk: login, logout, register, password reset, email verification
 * - Mendukung tracking user activity dengan informasi IP address dan user agent
 *
 * Cara kerja:
 * 1. Membuat table audit_logs dengan kolom yang diperlukan
 * 2. Menambahkan foreign key ke users table dengan ON DELETE SET NULL
 * 3. Menambahkan index pada kolom user_id, action, dan created_at untuk optimasi query
 *
 * Digunakan oleh: AuditLogService untuk mencatat semua authentication events
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * up
     *
     * Apa yang dilakukan fungsi ini:
     * Membuat table audit_logs untuk tracking authentication events.
     *
     * Cara kerjanya:
     * 1. Membuat table audit_logs dengan semua kolom yang diperlukan
     * 2. Menambahkan foreign key constraint ke users table
     * 3. Menambahkan index untuk optimasi query berdasarkan user_id, action, dan created_at
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            
            // User information - nullable karena user bisa dihapus tapi log tetap ada
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('user_email'); // Disimpan terpisah untuk history jika user dihapus
            
            // Action information
            $table->string('action', 50); // login, logout, register, password_reset, email_verification
            
            // Request information
            $table->string('ip_address', 45)->nullable(); // Support IPv4 dan IPv6
            $table->text('user_agent')->nullable(); // Browser/device information
            
            // Additional data dalam format JSON
            $table->json('metadata')->nullable(); // Untuk data tambahan seperti failed login reason, dll
            
            $table->timestamps();
            
            // Index untuk optimasi query
            $table->index('user_id'); // Query: "show all logs by user"
            $table->index('action'); // Query: "show all login attempts"
            $table->index('created_at'); // Query: "show logs in date range"
        });
    }

    /**
     * down
     *
     * Apa yang dilakukan fungsi ini:
     * Rollback migration dengan menghapus table audit_logs.
     *
     * Cara kerjanya:
     * 1. Menghapus table audit_logs beserta semua index dan foreign key
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
