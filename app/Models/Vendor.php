<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Vendor Model
 *
 * Fungsi model ini:
 * - Menyimpan data perusahaan vendor (Nama PT, PIC, No HP, Alamat)
 * - Relationship dengan User (1 user vendor = 1 vendor record)
 * - Data ini auto-fill saat vendor submit surat
 *
 * Cara kerja:
 * 1. Setiap user dengan role='vendor' punya 1 record di tabel vendors
 * 2. Data vendor digunakan untuk auto-fill form surat
 * 3. Jika user dihapus, vendor record juga terhapus (CASCADE)
 *
 * Digunakan oleh: AuthService (saat registration), Request submission (Phase 2)
 */
class Vendor extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'company_name',
        'pic_name',
        'pic_phone',
        'address',
    ];

    /**
     * Relationship: Vendor belongs to User
     *
     * Digunakan untuk mengambil data user yang terkait dengan vendor ini.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor: Get full vendor info untuk display
     *
     * Cara pakai: $vendor->getFullInfo()
     *
     * @return string
     */
    public function getFullInfo(): string
    {
        return "{$this->company_name} - {$this->pic_name} ({$this->pic_phone})";
    }
}
