<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * ApprovalLog Model
 *
 * Model untuk tabel approval_logs (audit trail approval).
 *
 * Fungsi model ini:
 * - Mencatat setiap perubahan status surat
 * - Tracking siapa yang approve/reject dan kapan
 * - Log bersifat immutable (tidak bisa diupdate/delete)
 *
 * Relationships:
 * - belongsTo: Request
 * - belongsTo: User (approver)
 */
class ApprovalLog extends Model
{
    use HasFactory;
    use HasUuids;

    /**
     * Disable timestamps karena kita pakai action_date
     * 
     * @var bool
     */
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'approver_id',
        'approver_role',
        'action',
        'from_status',
        'to_status',
        'notes',
        'action_date',
    ];

    protected $casts = [
        'action_date' => 'datetime',
    ];

    /**
     * Relasi ke Request
     */
    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    /**
     * Relasi ke User (Approver)
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    /**
     * Scope: Filter by request_id
     */
    public function scopeByRequest($query, $requestId)
    {
        return $query->where('request_id', $requestId);
    }

    /**
     * Scope: Filter by approver_id
     */
    public function scopeByApprover($query, $approverId)
    {
        return $query->where('approver_id', $approverId);
    }

    /**
     * Helper: Get action label untuk display
     */
    public function getActionLabel(): string
    {
        $labels = [
            'SUBMITTED' => 'Diajukan',
            'APPROVED' => 'Disetujui',
            'REJECTED' => 'Ditolak',
            'CANCELLED' => 'Dibatalkan',
        ];

        return $labels[$this->action] ?? $this->action;
    }
}
