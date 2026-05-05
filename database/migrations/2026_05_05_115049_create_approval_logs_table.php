<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create Approval Logs Table
 * 
 * Tabel audit trail untuk setiap step approval (immutable).
 * 
 * Fungsi tabel ini:
 * - Mencatat setiap perubahan status surat
 * - Tracking siapa yang approve/reject dan kapan
 * - Menyimpan alasan approve/reject
 * 
 * Cara kerja:
 * 1. Setiap perubahan status harus tercatat di sini
 * 2. Log bersifat immutable (tidak bisa diupdate/delete)
 * 3. notes wajib diisi jika action=REJECTED
 * 
 * Example flow:
 * - Vendor submit → action=SUBMITTED, from_status=DRAFT, to_status=PENDING_DEPT
 * - Dept approve → action=APPROVED, from_status=PENDING_DEPT, to_status=PENDING_OPS
 * - Finance reject → action=REJECTED, from_status=PENDING_FINANCE, to_status=REJECTED, notes="Vendor ada tunggakan"
 * 
 * Relasi:
 * - belongsTo requests (request_id)
 * - belongsTo users (approver_id) - NULL jika vendor submit
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('approval_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->onDelete('cascade');
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('approver_role', 50)->comment('Role yang melakukan aksi');
            $table->enum('action', ['SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED']);
            $table->string('from_status', 50)->nullable()->comment('Status sebelum aksi');
            $table->string('to_status', 50)->nullable()->comment('Status setelah aksi');
            $table->text('notes')->nullable()->comment('Alasan approve/reject (wajib jika REJECTED)');
            $table->timestamp('action_date')->useCurrent()->comment('Waktu aksi');

            // Indexes
            $table->index('request_id');
            $table->index('action_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_logs');
    }
};
