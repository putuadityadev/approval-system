<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

/**
 * User Model
 *
 * Fungsi model ini:
 * - Mengelola data user (Admin dan Requester) dalam sistem authentication
 * - Menyediakan relationship ke AuditLog dan Session untuk tracking aktivitas user
 * - Menyediakan helper methods untuk check role user
 *
 * Cara kerja:
 * 1. Menyimpan data user dengan role (admin atau requester)
 * 2. Password otomatis di-hash saat disimpan (menggunakan cast 'hashed')
 * 3. Menyediakan scope untuk filter user berdasarkan role
 * 4. Menyediakan accessor untuk check apakah user adalah admin atau requester
 *
 * Digunakan oleh: AuthService, Controllers, Middleware untuk authentication dan authorization
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
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
        ];
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
     * Relationship: User memiliki banyak sessions
     *
     * Digunakan untuk tracking semua session aktif user (jika menggunakan database session driver).
     *
     * @return HasMany
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(Session::class);
    }

    /**
     * Scope: Filter hanya user dengan role admin
     *
     * Cara pakai: User::admins()->get()
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeAdmins(Builder $query): Builder
    {
        return $query->where('role', 'admin');
    }

    /**
     * Scope: Filter hanya user dengan role requester
     *
     * Cara pakai: User::requesters()->get()
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeRequesters(Builder $query): Builder
    {
        return $query->where('role', 'requester');
    }

    /**
     * Accessor: Check apakah user adalah admin
     *
     * Cara pakai: $user->isAdmin()
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Accessor: Check apakah user adalah requester
     *
     * Cara pakai: $user->isRequester()
     *
     * @return bool
     */
    public function isRequester(): bool
    {
        return $this->role === 'requester';
    }
}
