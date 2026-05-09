<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create SIK Details Table
 * 
 * Tabel detail untuk surat SIK (Surat Izin Kerja).
 * 
 * Fungsi tabel ini:
 * - Menyimpan detail pekerjaan yang akan dilakukan
 * - Menyimpan jumlah pekerja, jadwal, lokasi
 * - Menyimpan jenis pekerjaan dan permit khusus
 * 
 * Cara kerja:
 * 1. Tabel ini hanya ada jika request_type = IJIN_KERJA
 * 2. Relasi 1-to-1 dengan requests (request_id UNIQUE)
 * 3. Security akan cocokkan worker_count dengan jumlah pekerja di lapangan
 * 
 * Relasi:
 * - belongsTo requests (request_id)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sik_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('request_id')->unique(); $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->integer('worker_count')->comment('Jumlah tenaga kerja (harus > 0)');
            $table->date('start_date')->comment('Tanggal mulai kerja');
            $table->date('end_date')->comment('Tanggal selesai kerja');
            $table->time('start_time')->comment('Jam mulai kerja');
            $table->time('end_time')->comment('Jam selesai kerja');
            $table->string('location')->comment('Lokasi kerja (Toilet Lt. GF)');
            $table->string('job_type')->comment('Jenis pekerjaan (Instalasi Listrik)');
            $table->text('description')->nullable()->comment('Keterangan/permit khusus (Hot Work Permit)');
            $table->timestamps();

            // Indexes
            $table->index('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sik_details');
    }
};
