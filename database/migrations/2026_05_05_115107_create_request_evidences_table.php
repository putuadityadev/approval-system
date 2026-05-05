<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create Request Evidences Table
 * 
 * Tabel untuk menyimpan foto evidence dari Security di lapangan.
 * 
 * Fungsi tabel ini:
 * - Menyimpan foto verifikasi barang/pekerjaan
 * - Tracking siapa yang upload dan kapan
 * - Menyimpan catatan Security
 * 
 * Cara kerja:
 * 1. Hanya user dengan role=security yang bisa upload
 * 2. Foto wajib diupload setelah scan QR code
 * 3. 1 request bisa punya banyak foto evidence (max 5)
 * 
 * Evidence types:
 * - SECURITY_LOADING_IN: Foto barang masuk
 * - SECURITY_LOADING_OUT: Foto barang keluar
 * - SIK_WORK_PROOF: Foto bukti pekerjaan
 * 
 * Relasi:
 * - belongsTo requests (request_id)
 * - belongsTo users (uploaded_by) - Security
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('request_evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->onDelete('cascade');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('evidence_type', [
                'SECURITY_LOADING_IN',
                'SECURITY_LOADING_OUT',
                'SIK_WORK_PROOF'
            ])->comment('Jenis evidence');
            $table->string('image_url', 500)->comment('Path foto di MinIO');
            $table->text('notes')->nullable()->comment('Catatan Security');
            $table->timestamp('uploaded_at')->useCurrent()->comment('Waktu upload');

            // Indexes
            $table->index('request_id');
            $table->index('uploaded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_evidences');
    }
};
