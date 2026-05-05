<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create SIKMB Items Table
 * 
 * Tabel daftar barang dalam surat SIKMB.
 * 
 * Fungsi tabel ini:
 * - Menyimpan detail setiap barang yang akan diangkut
 * - 1 SIKMB bisa punya banyak items (relasi 1-to-Many)
 * 
 * Cara kerja:
 * 1. Setiap row = 1 jenis barang
 * 2. Vendor bisa input banyak barang dalam 1 surat
 * 3. Quantity harus > 0
 * 
 * Relasi:
 * - belongsTo sikmb_details (sikmb_detail_id)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sikmb_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sikmb_detail_id')->constrained('sikmb_details')->onDelete('cascade');
            $table->string('item_name')->comment('Nama barang');
            $table->integer('quantity')->comment('Jumlah barang (harus > 0)');
            $table->string('unit', 50)->comment('Satuan (kotak, pcs, dus, dll)');
            $table->text('remarks')->nullable()->comment('Keterangan tambahan');
            $table->timestamps();

            // Indexes
            $table->index('sikmb_detail_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sikmb_items');
    }
};
