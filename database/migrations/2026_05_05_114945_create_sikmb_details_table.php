<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create SIKMB Details Table
 * 
 * Tabel detail untuk surat SIKMB (Surat Izin Keluar/Masuk Barang).
 * 
 * Fungsi tabel ini:
 * - Menyimpan detail barang yang akan diangkut
 * - Menyimpan jadwal angkut (tanggal, jam)
 * - Menyimpan lokasi asal dan tujuan
 * 
 * Cara kerja:
 * 1. Tabel ini hanya ada jika request_type = LOADING_IN atau LOADING_OUT
 * 2. Relasi 1-to-1 dengan requests (request_id UNIQUE)
 * 3. Relasi 1-to-Many dengan sikmb_items (daftar barang)
 * 
 * Relasi:
 * - belongsTo requests (request_id)
 * - hasMany sikmb_items
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sikmb_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('request_id')->unique(); $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->string('origin_floor', 50)->nullable()->comment('Lantai asal barang');
            $table->string('origin_unit', 100)->nullable()->comment('Unit/toko asal barang');
            $table->date('start_date')->comment('Tanggal mulai angkut');
            $table->date('end_date')->comment('Tanggal selesai angkut');
            $table->time('start_time')->comment('Jam mulai (22:00)');
            $table->time('end_time')->comment('Jam selesai (05:00)');
            $table->text('dest_address')->comment('Alamat tujuan lengkap');
            $table->string('dest_floor', 50)->nullable()->comment('Lantai tujuan');
            $table->string('dest_phone', 20)->comment('No HP penerima barang');
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
        Schema::dropIfExists('sikmb_details');
    }
};
