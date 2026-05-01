# Email Verification Controller - Setup Guide

## Overview

EmailVerificationController telah dibuat untuk menangani email verification flow. Controller ini bersifat **opsional untuk MVP** dan dapat diaktifkan jika diperlukan.

## Routes yang Perlu Ditambahkan

Tambahkan routes berikut ke `routes/web.php`:

```php
use App\Http\Controllers\Auth\EmailVerificationController;

// Email Verification Routes (authenticated users only)
Route::middleware('auth')->group(function () {
    // Halaman verification notice
    Route::get('/email/verify', [EmailVerificationController::class, 'notice'])
        ->name('verification.notice');
    
    // Proses verifikasi email (dengan signed URL)
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    
    // Resend email verification
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});
```

## Cara Mengaktifkan Email Verification

### 1. Update User Model

Pastikan User model mengimplementasi `MustVerifyEmail`:

```php
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    // ...
}
```

### 2. Update Middleware di Routes

Tambahkan middleware `verified` ke routes yang memerlukan email verification:

```php
// Contoh: requester routes yang memerlukan email verification
Route::middleware(['auth', 'role:requester', 'verified'])->group(function () {
    Route::get('/requester/dashboard', [RequesterDashboardController::class, 'index'])
        ->name('requester.dashboard');
});
```

### 3. Update AuthService

Jika email verification diaktifkan, hapus auto-set `email_verified_at` di AuthService->register():

```php
// SEBELUM (tanpa email verification):
$user = User::create([
    'name' => $data['name'],
    'email' => $data['email'],
    'password' => Hash::make($data['password']),
    'role' => 'requester',
    'email_verified_at' => now(), // auto-verified
]);

// SESUDAH (dengan email verification):
$user = User::create([
    'name' => $data['name'],
    'email' => $data['email'],
    'password' => Hash::make($data['password']),
    'role' => 'requester',
    // email_verified_at akan diset setelah user klik link verifikasi
]);

// Kirim email verifikasi
$user->sendEmailVerificationNotification();
```

### 4. Konfigurasi Mail Driver

Update `.env` untuk konfigurasi email:

```env
# Development (log ke file)
MAIL_MAILER=log

# Production (gunakan SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@mall.com
MAIL_FROM_NAME="${APP_NAME}"
```

## Frontend Component

Buat komponen React untuk halaman verification notice:

**File**: `resources/js/Pages/Auth/VerifyEmail.jsx`

```jsx
/**
 * VerifyEmail
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan pesan bahwa user perlu verifikasi email
 * - Menyediakan tombol untuk resend email verification
 *
 * Cara kerjanya:
 * 1. Menerima status dari backend (jika ada)
 * 2. Menampilkan pesan instruksi ke user
 * 3. Menyediakan tombol resend yang memanggil route verification.send
 *
 * Props:
 * - status: string (opsional) - pesan status dari backend
 */
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <div className="mb-4 text-sm text-gray-600">
                Terima kasih telah mendaftar! Sebelum memulai, silakan verifikasi email Anda 
                dengan mengklik link yang baru saja kami kirimkan. Jika Anda tidak menerima email, 
                kami akan dengan senang hati mengirimkan yang lain.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    Link verifikasi baru telah dikirim ke alamat email yang Anda berikan saat registrasi.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Kirim Ulang Email Verifikasi
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
```

## Testing

Jalankan test untuk memastikan email verification berfungsi:

```bash
php artisan test --filter EmailVerificationControllerTest
```

## Audit Trail

Setiap email verification yang berhasil akan dicatat ke `audit_logs` table dengan:
- `action`: 'email_verification'
- `user_id`: ID user yang verify
- `user_email`: Email user
- `ip_address`: IP address saat verify
- `user_agent`: Browser/device info
- `timestamp`: Waktu verifikasi

## Notes

- Email verification adalah **opsional untuk MVP**
- Jika tidak diaktifkan, `email_verified_at` akan diset otomatis saat registrasi
- Rate limiting sudah diterapkan (6 attempts per minute) untuk prevent abuse
- Signed URL memiliki expiry time (default 60 menit)
- Email verification notification menggunakan Laravel's built-in notification system

## Troubleshooting

### Email tidak terkirim
- Check konfigurasi MAIL_* di .env
- Jika menggunakan log driver, check `storage/logs/laravel.log`
- Pastikan queue worker berjalan jika menggunakan queue

### Link verifikasi expired
- Link verifikasi valid selama 60 menit
- User dapat request link baru dengan tombol "Resend"

### User tidak redirect setelah verify
- Check apakah routes sudah terdaftar dengan benar
- Check apakah middleware 'auth' sudah diterapkan
- Check apakah dashboard routes sudah ada
