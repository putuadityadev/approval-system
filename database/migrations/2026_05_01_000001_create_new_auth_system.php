<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create New Auth System
 * 
 * Migration ini membuat ulang sistem authentication dengan role baru:
 * - super_admin: Manage semua user dan sistem
 * - vendor: Self-registration, submit surat
 * - approver_dept: Approval level 1 (Departemen)
 * - approver_ops: Approval level 2 (Operasional)
 * - approver_finance: Approval level 3 (Finance)
 * - approver_gm: Approval level 4 (GM Operation)
 * - security: Verifikasi lapangan, scan QR
 * 
 * Cara kerja:
 * 1. Drop tabel lama (users, audit_logs, password_reset_tokens, sessions)
 * 2. Buat tabel baru dengan struktur yang updated
 * 3. Buat tabel vendors untuk data perusahaan
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop tabel lama jika ada
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');

        // Buat tabel users dengan role baru
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', [
                'super_admin',
                'vendor',
                'approver_dept',
                'approver_ops',
                'approver_finance',
                'approver_gm',
                'security'
            ]);
            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            // Indexes
            $table->index('email');
            $table->index('role');
            $table->index('is_active');
        });

        // Buat tabel vendors untuk data perusahaan
        Schema::create('vendors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('company_name');
            $table->string('pic_name')->comment('Person In Charge Name');
            $table->string('pic_phone', 20);
            $table->text('address');
            $table->timestamps();

            // Indexes
            $table->index('company_name');
        });

        // Buat tabel password_reset_tokens
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();

            // Indexes
            $table->index('token');
        });

        // Buat tabel sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->uuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Buat tabel audit_logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->string('user_email');
            $table->string('user_role', 50);
            $table->string('action', 100)->comment('LOGIN, LOGOUT, CREATE_USER, etc');
            $table->text('details')->nullable()->comment('JSON data with additional context');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('users');
    }
};
