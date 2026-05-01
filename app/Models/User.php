<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

/**
 * User Model
 *
 * Fungsi model ini:
 * - Mengelola data user dengan 7 role berbeda dalam sistem
 * - Menyediakan relationship ke Vendor, AuditLog untuk tracking
 * - Menyediakan helper methods untuk check role user
 *
 * Role yang tersedia:
 * - super_admin: Manage semua user dan sistem
 * - vendor: Submit surat, view own submissions
 * - approver_dept: Approval level 1 (Departemen)
 * - approver_ops: Approval level 2 (Operasional)
 * - approver_finance: Approval level 3 (Finance)
 * - approver_gm: Approval level 4 (GM Operation)
 * - security: Verifikasi lapangan, scan QR
 *
 * Cara kerja:
 * 1. Menyimpan data user dengan role spesifik
 * 2. Password otomatis di-hash saat disimpan (menggunakan cast 'hashed')
 * 3. Menyediakan scope untuk filter user berdasarkan role
 * 4. Menyediakan accessor untuk check role user
 *
 * Digunakan oleh: AuthService, Controllers, Middleware untuk authentication dan authorization
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Relationship: User memiliki satu vendor record (jika role=vendor)
     *
     * Digunakan untuk mengambil data perusahaan vendor.
     *
     * @return HasOne
     */
    public function vendor(): HasOne
    {
        return $this->hasOne(Vendor::class);
    }

    /**
     * Relationship: User memiliki banyak audit logs
     *
     * Digunakan untuk tracking semua aktivitas user seperti login, logout, dll.
     *
     * @return HasMany
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Scope: Filter hanya user dengan role super_admin
     *
     * Cara pakai: User::superAdmins()->get()
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeSuperAdmins(Builder $query): Builder
    {
        return $query->where('role', 'super_admin');
    }

    /**
     * Scope: Filter hanya user dengan role vendor
     *
     * Cara pakai: User::vendors()->get()
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeVendors(Builder $query): Builder
    {
        return $query->where('role', 'vendor');
    }

    /**
     * Scope: Filter hanya user dengan role approver (semua level)
     *
     * Cara pakai: User::approvers()->get()
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeApprovers(Builder $query): Builder
    {
        return $query->whereIn('role', [
            'approver_dept',
            'approver_ops',
            'approver_finance',
            'approver_gm',
        ]);
    }

    /**
     * Scope: Filter hanya user dengan role security
     *
     * Cara pakai: User::securities()->get()
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeSecurities(Builder $query): Builder
    {
        return $query->where('role', 'security');
    }

    /**
     * Scope: Filter hanya user yang aktif
     *
     * Cara pakai: User::active()->get()
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Accessor: Check apakah user adalah super admin
     *
     * Cara pakai: $user->isSuperAdmin()
     *
     * @return bool
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Accessor: Check apakah user adalah vendor
     *
     * Cara pakai: $user->isVendor()
     *
     * @return bool
     */
    public function isVendor(): bool
    {
        return $this->role === 'vendor';
    }

    /**
     * Accessor: Check apakah user adalah approver (level apapun)
     *
     * Cara pakai: $user->isApprover()
     *
     * @return bool
     */
    public function isApprover(): bool
    {
        return in_array($this->role, [
            'approver_dept',
            'approver_ops',
            'approver_finance',
            'approver_gm',
        ]);
    }

    /**
     * Accessor: Check apakah user adalah security
     *
     * Cara pakai: $user->isSecurity()
     *
     * @return bool
     */
    public function isSecurity(): bool
    {
        return $this->role === 'security';
    }

    /**
     * Accessor: Get role display name (untuk UI)
     *
     * Cara pakai: $user->getRoleDisplayName()
     *
     * @return string
     */
    public function getRoleDisplayName(): string
    {
        return match($this->role) {
            'super_admin' => 'Super Admin',
            'vendor' => 'Vendor',
            'approver_dept' => 'Approver Departemen',
            'approver_ops' => 'Approver Operasional',
            'approver_finance' => 'Approver Finance',
            'approver_gm' => 'Approver GM Operation',
            'security' => 'Security',
            default => 'Unknown',
        };
    }

    /**
     * Accessor: Get dashboard route name berdasarkan role
     *
     * Cara pakai: $user->getDashboardRoute()
     * Return route name (bukan path) untuk digunakan dengan route() helper
     *
     * @return string
     */
    public function getDashboardRoute(): string
    {
        return match($this->role) {
            'super_admin' => 'admin.dashboard',
            'vendor' => 'vendor.dashboard',
            'approver_dept', 'approver_ops', 'approver_finance', 'approver_gm' => 'approver.dashboard',
            'security' => 'security.dashboard',
            default => 'login',
        };
    }
}
