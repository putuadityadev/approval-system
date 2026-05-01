<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

/**
 * AuditLog Model
 *
 * Fungsi model ini:
 * - Mencatat semua aktivitas user dalam sistem (immutable audit trail)
 * - Menyimpan: who, when, what action, IP address, user agent
 * - Relationship dengan User untuk tracking siapa yang melakukan aksi
 *
 * Cara kerja:
 * 1. Setiap aksi penting (login, logout, create user, dll) dicatat di sini
 * 2. Log bersifat immutable (tidak bisa diupdate/delete)
 * 3. Jika user dihapus, user_id jadi NULL tapi email tetap tersimpan
 *
 * Digunakan oleh: AuditLogService untuk mencatat semua aktivitas
 */
class AuditLog extends Model
{
    use HasFactory;

    /**
     * Disable updated_at karena audit log immutable
     */
    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'user_email',
        'user_role',
        'action',
        'details',
        'ip_address',
        'user_agent',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'details' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Relationship: AuditLog belongs to User
     *
     * Digunakan untuk mengambil data user yang melakukan aksi.
     * Bisa NULL jika user sudah dihapus.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Filter berdasarkan action
     *
     * Cara pakai: AuditLog::byAction('LOGIN')->get()
     *
     * @param Builder $query
     * @param string $action
     * @return Builder
     */
    public function scopeByAction(Builder $query, string $action): Builder
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: Filter berdasarkan user
     *
     * Cara pakai: AuditLog::byUser(1)->get()
     *
     * @param Builder $query
     * @param int $userId
     * @return Builder
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Filter berdasarkan role
     *
     * Cara pakai: AuditLog::byRole('vendor')->get()
     *
     * @param Builder $query
     * @param string $role
     * @return Builder
     */
    public function scopeByRole(Builder $query, string $role): Builder
    {
        return $query->where('user_role', $role);
    }

    /**
     * Scope: Get recent logs (default 100)
     *
     * Cara pakai: AuditLog::recent()->get()
     *
     * @param Builder $query
     * @param int $limit
     * @return Builder
     */
    public function scopeRecent(Builder $query, int $limit = 100): Builder
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }
}
