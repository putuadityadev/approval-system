<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create Requests Table
 * 
 * Tabel induk untuk semua surat (SIK & SIKMB).
 * 
 * Fungsi tabel ini:
 * - Menyimpan data master surat approval
 * - Tracking status approval (DRAFT → SUBMITTED → PENDING_* → APPROVED/REJECTED)
 * - Menyimpan link foto form fisik dan QR code
 * 
 * Cara kerja:
 * 1. Vendor submit surat → status SUBMITTED
 * 2. Approval flow: PENDING_DEPT → PENDING_OPS → PENDING_FINANCE → PENDING_GM
 * 3. Setelah APPROVED → generate QR code
 * 4. Security scan QR → status EXECUTED
 * 
 * Relasi:
 * - belongsTo vendors (vendor_id)
 * - hasOne sikmb_details (jika LOADING_IN/OUT)
 * - hasOne sik_details (jika IJIN_KERJA)
 * - hasMany approval_logs
 * - hasMany request_evidences
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('vendor_id'); $table->foreign('vendor_id')->references('id')->on('vendors')->onDelete('restrict');
            $table->enum('request_type', ['LOADING_IN', 'LOADING_OUT', 'IJIN_KERJA']);
            $table->enum('status', [
                'DRAFT',
                'SUBMITTED',
                'PENDING_DEPT',
                'PENDING_OPS',
                'PENDING_FINANCE',
                'PENDING_GM',
                'APPROVED',
                'REJECTED',
                'CANCELLED',
                'EXECUTED'
            ])->default('DRAFT');
            $table->string('sop_form_code', 50)->nullable()->comment('Kode form SOP (SM-ICB/001)');
            $table->string('document_serial_no', 50)->unique()->nullable()->comment('No seri form fisik (001518)');
            $table->string('original_form_image', 500)->nullable()->comment('Path foto form fisik di MinIO');
            $table->string('qr_code', 500)->nullable()->comment('Path QR code di MinIO (generated after APPROVED)');
            $table->text('cancelled_reason')->nullable()->comment('Alasan cancel (jika status=CANCELLED)');
            $table->timestamps();
            $table->softDeletes()->comment('Soft delete timestamp');

            // Indexes
            $table->index('vendor_id');
            $table->index('status');
            $table->index('request_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
