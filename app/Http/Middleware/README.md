# Middleware Documentation

## CheckRole Middleware

Middleware ini digunakan untuk memvalidasi role user dan membatasi akses ke route berdasarkan role.

### Cara Penggunaan

#### 1. Menggunakan di Route

```php
// Route yang hanya bisa diakses oleh admin
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/users', [AdminController::class, 'users']);
});

// Route yang hanya bisa diakses oleh requester
Route::middleware(['auth', 'role:requester'])->group(function () {
    Route::get('/requester/dashboard', [RequesterController::class, 'dashboard']);
    Route::get('/requester/requests', [RequesterController::class, 'requests']);
});
```

#### 2. Menggunakan di Controller

```php
class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:admin']);
    }
    
    public function dashboard()
    {
        // Hanya admin yang bisa akses method ini
    }
}
```

### Behavior

- **Jika user belum login**: Middleware `auth` akan redirect ke halaman login
- **Jika user sudah login tapi role tidak sesuai**: Middleware `role` akan return 403 Forbidden dengan pesan "Anda tidak memiliki akses ke halaman ini."
- **Jika user sudah login dan role sesuai**: Request akan dilanjutkan ke controller

### Role yang Tersedia

- `admin` - User dengan role administrator
- `requester` - User dengan role requester (vendor)

### Testing

Test untuk middleware ini tersedia di `tests/Feature/CheckRoleMiddlewareTest.php`

Untuk menjalankan test:
```bash
docker exec laravel_app php artisan test --filter=CheckRoleMiddlewareTest
```

### Catatan

- Middleware ini harus selalu digunakan bersama dengan middleware `auth`
- Middleware ini sudah terdaftar dengan alias `role` di `bootstrap/app.php`
- Jika ingin menambahkan role baru, update enum di migration `users` table dan sesuaikan middleware jika diperlukan

---

## EnsureEmailIsVerified Middleware

Middleware ini digunakan untuk memvalidasi apakah email user sudah diverifikasi sebelum mengakses route tertentu.

**Status**: Opsional untuk MVP - Middleware ini sudah dibuat dan siap digunakan, tapi email verification feature belum diaktifkan secara default.

### Cara Penggunaan

#### 1. Menggunakan di Route

```php
// Route yang memerlukan email verification
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/profile', [ProfileController::class, 'show']);
});

// Atau untuk route individual
Route::get('/settings', [SettingsController::class, 'index'])
    ->middleware(['auth', 'verified']);
```

#### 2. Menggunakan di Controller

```php
class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }
    
    public function index()
    {
        // Hanya user dengan email verified yang bisa akses
    }
}
```

### Behavior

- **Jika user belum login**: Middleware `auth` akan redirect ke halaman login
- **Jika user sudah login tapi email belum verified**: Middleware `verified` akan redirect ke `/email/verify` dengan flash message
- **Jika user sudah login dan email sudah verified**: Request akan dilanjutkan ke controller
- **Jika user adalah null (guest)**: Middleware akan pass request ke middleware berikutnya (defensive programming)

### Mengaktifkan Email Verification

Untuk mengaktifkan email verification di aplikasi:

1. **Set environment variable** di `.env`:
   ```env
   EMAIL_VERIFICATION_ENABLED=true
   ```

2. **Buat EmailVerificationController** (Task 9.3):
   - Route: `/email/verify` (verification notice)
   - Route: `/email/verify/{id}/{hash}` (verification link)
   - Route: `/email/verification-notification` (resend verification)

3. **Tambahkan middleware ke route yang memerlukan verification**:
   ```php
   Route::middleware(['auth', 'verified'])->group(function () {
       // Protected routes
   });
   ```

4. **Update registration flow** untuk mengirim email verification setelah user register

### Testing

Test untuk middleware ini tersedia di `tests/Feature/EnsureEmailIsVerifiedMiddlewareTest.php`

Untuk menjalankan test:
```bash
docker exec laravel_app php artisan test --filter=EnsureEmailIsVerifiedMiddlewareTest
```

### Catatan

- Middleware ini **opsional untuk MVP** dan tidak diaktifkan secara default
- Middleware ini sudah terdaftar dengan alias `verified` di `bootstrap/app.php`
- Middleware ini harus selalu digunakan bersama dengan middleware `auth`
- Email verification controller dan routes akan dibuat di Task 9.3 (EmailVerificationController)
- Untuk development, bisa skip email verification dengan set `EMAIL_VERIFICATION_ENABLED=false` di `.env`

