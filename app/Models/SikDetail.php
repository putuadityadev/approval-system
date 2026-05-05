<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * SikDetail Model
 *
 * Model untuk tabel sik_details (detail surat SIK).
 *
 * Fungsi model ini:
 * - Menyimpan detail pekerjaan yang akan dilakukan
 * - Menyimpan jumlah pekerja, jadwal, lokasi
 *
 * Relationships:
 * - belongsTo: Request
 */
class SikDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'worker_count',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'location',
        'job_type',
        'description',
    ];

    protected $casts = [
        'worker_count' => 'integer',
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
}
