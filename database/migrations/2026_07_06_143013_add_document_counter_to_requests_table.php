<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Tambah kolom document_counter untuk tracking serial number per type
            $table->unsignedInteger('document_counter')->after('document_serial_no')->nullable();
            
            // Tambah index untuk query performance
            $table->index(['request_type', 'document_counter']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropIndex(['request_type', 'document_counter']);
            $table->dropColumn('document_counter');
        });
    }
};
