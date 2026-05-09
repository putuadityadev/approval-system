<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * SikmItem Model
 *
 * Model untuk tabel sikmb_items (daftar barang dalam SIKMB).
 *
 * Fungsi model ini:
 * - Menyimpan detail setiap barang yang akan diangkut
 * - 1 SIKMB bisa punya banyak items
 *
 * Relationships:
 * - belongsTo: SikmDetail
 */
class SikmItem extends Model
{
    use HasFactory;

    /**
     * Nama table di database
     * 
     * @var string
     */
    protected $table = 'sikmb_items';

    protected $fillable = [
        'sikmb_detail_id',
        'item_name',
        'quantity',
        'unit',
        'remarks',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke SIKMB Detail
     */
    public function sikmDetail()
    {
        return $this->belongsTo(SikmDetail::class, 'sikmb_detail_id');
    }
}
