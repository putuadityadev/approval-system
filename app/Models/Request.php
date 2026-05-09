<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Request Model
 *
 * Model untuk tabel requests (master table untuk semua surat).
 *
 * Fungsi model ini:
 * - Menyimpan data master surat (SIK & SIKMB)
 * - Tracking status approval workflow
 * - Relasi dengan vendor, details, approval logs, evidences
 *
 * Relationships:
 * - belongsTo: Vendor
 * - hasOne: SikmDetail, SikDetail
 * - hasMany: ApprovalLog, RequestEvidence
 *
 * Scopes:
 * - byStatus: Filter by status
 * - byType: Filter by request_type
 * - byVendor: Filter by vendor_id
 *
 * Helper Methods:
 * - isPending(): Check if status is PENDING_*
 * - isApproved(): Check if status is APPROVED
 * - canCancel(): Check if vendor can cancel
 */
class Request extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'request_type',
        'status',
        'sop_form_code',
        'document_serial_no',
        'original_form_image',
        'qr_code',
        'cancelled_reason',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relasi ke Vendor
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Relasi ke SIKMB Detail (jika request_type = LOADING_IN/OUT)
     */
    public function sikmDetail()
    {
        return $this->hasOne(SikmDetail::class);
    }

    /**
     * Relasi ke SIK Detail (jika request_type = IJIN_KERJA)
     */
    public function sikDetail()
    {
        return $this->hasOne(SikDetail::class);
    }

    /**
     * Relasi ke Approval Logs
     */
    public function approvalLogs()
    {
        return $this->hasMany(ApprovalLog::class);
    }

    /**
     * Relasi ke Request Evidences
     */
    public function evidences()
    {
        return $this->hasMany(RequestEvidence::class);
    }

    /**
     * Scope: Filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Filter by request_type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('request_type', $type);
    }

    /**
     * Scope: Filter by vendor_id
     */
    public function scopeByVendor($query, $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }

    /**
     * Helper: Check if status is PENDING_*
     */
    public function isPending(): bool
    {
        return in_array($this->status, [
            'PENDING_DEPT',
            'PENDING_OPS',
            'PENDING_FINANCE',
            'PENDING_GM',
        ]);
    }

    /**
     * Helper: Check if status is APPROVED
     */
    public function isApproved(): bool
    {
        return $this->status === 'APPROVED';
    }

    /**
     * Helper: Check if vendor can cancel
     * Vendor hanya bisa cancel jika status SUBMITTED atau PENDING_*
     */
    public function canCancel(): bool
    {
        return in_array($this->status, [
            'SUBMITTED',
            'PENDING_DEPT',
            'PENDING_OPS',
            'PENDING_FINANCE',
            'PENDING_GM',
        ]);
    }

    /**
     * Helper: Get status label untuk display
     */
    public function getStatusLabel(): string
    {
        $labels = [
            'DRAFT' => 'Draft',
            'SUBMITTED' => 'Diajukan',
            'PENDING_DEPT' => 'Menunggu Approval Dept',
            'PENDING_OPS' => 'Menunggu Approval Ops',
            'PENDING_FINANCE' => 'Menunggu Approval Finance',
            'PENDING_GM' => 'Menunggu Approval GM',
            'APPROVED' => 'Disetujui',
            'REJECTED' => 'Ditolak',
            'CANCELLED' => 'Dibatalkan',
            'EXECUTED' => 'Selesai Dieksekusi',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    /**
     * Helper: Get request type label untuk display
     */
    public function getTypeLabel(): string
    {
        $labels = [
            'LOADING_IN' => 'Barang Masuk',
            'LOADING_OUT' => 'Barang Keluar',
            'IJIN_KERJA' => 'Izin Kerja',
        ];

        return $labels[$this->request_type] ?? $this->request_type;
    }
}
