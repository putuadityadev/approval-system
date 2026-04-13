<?php

/**
 * Migration: Create Users Table
 *
 * Fungsi migration ini:
 * - Membuat table users untuk menyimpan data user (Admin dan Requester)
 * - Membuat table password_reset_tokens untuk fitur reset password
 * - Membuat table sessions untuk menyimpan session data
 *
 * Cara kerja:
 * 1. Membuat table users dengan kolom: id, name, email, password, role, email_verified_at, remember_token, timestamps
 * 2. Menambahkan index pada kolom email dan role untuk optimasi query
 * 3. Membuat table password_reset_tokens untuk menyimpan token reset password
 * 4. Membuat table sessions untuk session management
 *
 * Digunakan oleh: Authentication system
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
     * Membuat table users, password_reset_tokens, dan sessions untuk authentication system.
     *
     * Cara kerjanya:
     * 1. Membuat table users dengan kolom yang diperlukan dan index
     * 2. Membuat table password_reset_tokens untuk forgot password flow
     * 3. Membuat table sessions untuk session management
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'requester'])->default('requester');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            
            // Index untuk optimasi query
            $table->index('email');
            $table->index('role');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
            
            // Index untuk optimasi query
            $table->index('token');
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * down
     *
     * Apa yang dilakukan fungsi ini:
     * Rollback migration dengan menghapus semua table yang dibuat.
     *
     * Cara kerjanya:
     * 1. Menghapus table users
     * 2. Menghapus table password_reset_tokens
     * 3. Menghapus table sessions
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
