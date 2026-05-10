<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * RequestEvidence Model
 *
 * Model untuk tabel request_evidences (foto evidence dari Security).
 *
 * Fungsi model ini:
 * - Menyimpan foto verifikasi barang/pekerjaan
 * - Tracking siapa yang upload dan kapan
 *
 * Relationships:
 * - belongsTo: Request
 * - belongsTo: User (uploader - Security)
 */
class RequestEvidence extends Model
{
    use HasFactory;
    use HasUuids;

    /**
     * Nama table di database
     * 
     * @var string
     */
    protected $table = 'request_evidences';

    // Disable timestamps karena evidence immutable dan pakai uploaded_at
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'uploaded_by',
        'evidence_type',
        'image_url',
        'notes',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    /**
     * Relasi ke Request
     */
    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    /**
     * Relasi ke User (Uploader - Security)
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Scope: Filter by request_id
     */
    public function scopeByRequest($query, $requestId)
    {
        return $query->where('request_id', $requestId);
    }

    /**
     * Helper: Get evidence type label untuk display
     */
    public function getTypeLabel(): string
    {
        $labels = [
            'SECURITY_LOADING_IN' => 'Foto Barang Masuk',
            'SECURITY_LOADING_OUT' => 'Foto Barang Keluar',
            'SIK_WORK_PROOF' => 'Foto Bukti Pekerjaan',
        ];

        return $labels[$this->evidence_type] ?? $this->evidence_type;
    }
}
