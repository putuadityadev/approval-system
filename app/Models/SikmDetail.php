<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * SikmDetail Model
 *
 * Model untuk tabel sikmb_details (detail surat SIKMB).
 *
 * Fungsi model ini:
 * - Menyimpan detail barang yang akan diangkut
 * - Menyimpan jadwal dan lokasi angkut
 *
 * Relationships:
 * - belongsTo: Request
 * - hasMany: SikmItem
 */
class SikmDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'origin_floor',
        'origin_unit',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'dest_address',
        'dest_floor',
        'dest_phone',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke Request
     */
    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    /**
     * Relasi ke SIKMB Items
     */
    public function items()
    {
        return $this->hasMany(SikmItem::class);
    }

    /**
     * Helper: Get total items count
     */
    public function getTotalItems(): int
    {
        return $this->items()->count();
    }
}
