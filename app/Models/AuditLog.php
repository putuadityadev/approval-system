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
 * - Mengelola log aktivitas authentication dalam sistem
 * - Mencatat semua event penting: login, logout, register, password reset, email verification
 * - Menyimpan informasi user, IP address, user agent, dan metadata tambahan
 *
 * Cara kerja:
 * 1. Menyimpan setiap authentication event ke database
 * 2. Metadata disimpan dalam format array (JSON di database) untuk fleksibilitas
 * 3. Relationship ke User dengan nullable (log tetap ada meskipun user dihapus)
 * 4. Menyediakan scope untuk filter log berdasarkan action atau user
 *
 * Digunakan oleh: AuditLogService untuk mencatat semua authentication events
 */
class AuditLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'user_email',
        'action',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /**
     * Relationship: AuditLog belongs to User
     *
     * Digunakan untuk mendapatkan informasi user yang melakukan action.
     * Nullable karena user bisa dihapus tapi log tetap ada.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Filter audit logs berdasarkan action
     *
     * Cara pakai: AuditLog::byAction('login')->get()
     *
     * @param Builder $query
     * @param string $action — Jenis action (login, logout, register, password_reset, dll)
     * @return Builder
     */
    public function scopeByAction(Builder $query, string $action): Builder
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: Filter audit logs berdasarkan user ID
     *
     * Cara pakai: AuditLog::byUser(1)->get()
     *
     * @param Builder $query
     * @param int $userId — ID user yang ingin difilter
     * @return Builder
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }
}
