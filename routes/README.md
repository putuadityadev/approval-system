# Routing Documentation

## Overview

File ini mendokumentasikan struktur routing untuk Mall Approval System. Routing menggunakan role-based access control dengan middleware untuk membatasi akses berdasarkan role user (Admin atau Requester).

## Route Structure

### 1. Root Route (`/`)

**Behavior:**
- Jika user **belum login** → redirect ke `/login`
- Jika user **sudah login sebagai Admin** → redirect ke `/admin/dashboard`
- Jika user **sudah login sebagai Requester** → redirect ke `/requester/dashboard`

**Middleware:** None (public route)

---

### 2. Guest Routes

Routes ini hanya bisa diakses oleh user yang **belum login**. Jika user sudah login, akan di-redirect ke dashboard sesuai role.

**Middleware:** `guest`

| Method | URI | Controller Method | Route Name | Rate Limit |
|--------|-----|-------------------|------------|------------|
| GET | `/login` | `AuthController@showLogin` | `login` | - |
| POST | `/login` | `AuthController@login` | `login.post` | 5 attempts/menit |
| GET | `/register` | `AuthController@showRegister` | `register` | - |
| POST | `/register` | `AuthController@register` | `register.post` | - |
| GET | `/forgot-password` | `PasswordResetController@showForgotPassword` | `password.request` | - |
| POST | `/forgot-password` | `PasswordResetController@sendResetLink` | `password.email` | 3 requests/jam |
| GET | `/reset-password/{token}` | `PasswordResetController@showResetPassword` | `password.reset` | - |
| POST | `/reset-password` | `PasswordResetController@resetPassword` | `password.update` | - |

**Rate Limiting:**
- **Login**: 5 attempts per 1 menit per IP address
- **Password Reset**: 3 requests per 1 jam per email

---

### 3. Authenticated Routes

Routes ini hanya bisa diakses oleh user yang **sudah login**. Jika user belum login, akan di-redirect ke halaman login.

**Middleware:** `auth`

| Method | URI | Controller Method | Route Name | Rate Limit |
|--------|-----|-------------------|------------|------------|
| POST | `/logout` | `AuthController@logout` | `logout` | - |
| GET | `/email/verify` | `EmailVerificationController@notice` | `verification.notice` | - |
| GET | `/email/verify/{id}/{hash}` | `EmailVerificationController@verify` | `verification.verify` | 6 requests/menit |
| POST | `/email/verification-notification` | `EmailVerificationController@resend` | `verification.send` | 6 requests/menit |

**Note:** Email verification routes bersifat opsional untuk MVP. Jika email verification tidak diaktifkan, `email_verified_at` akan diset otomatis saat registrasi.

---

### 4. Admin Routes

Routes ini hanya bisa diakses oleh user dengan role **`admin`**. Jika user bukan admin, akan mendapat error **403 Forbidden**.

**Middleware:** `auth`, `role:admin`  
**Prefix:** `/admin`  
**Route Name Prefix:** `admin.`

| Method | URI | Controller Method | Route Name | Description |
|--------|-----|-------------------|------------|-------------|
| GET | `/admin/dashboard` | Closure (Inertia render) | `admin.dashboard` | Dashboard utama admin |

**Future Routes (Coming Soon):**
- User management (CRUD users)
- Approval workflow management
- Reports dan analytics
- System settings

---

### 5. Requester Routes

Routes ini hanya bisa diakses oleh user dengan role **`requester`**. Jika user bukan requester, akan mendapat error **403 Forbidden**.

**Middleware:** `auth`, `role:requester`  
**Prefix:** `/requester`  
**Route Name Prefix:** `requester.`

| Method | URI | Controller Method | Route Name | Description |
|--------|-----|-------------------|------------|-------------|
| GET | `/requester/dashboard` | Closure (Inertia render) | `requester.dashboard` | Dashboard utama requester |

**Future Routes (Coming Soon):**
- Submit surat ijin (Loading In, Loading Out, Ijin Kerja)
- View status surat yang diajukan
- Upload dokumen pendukung
- View history surat

---

## Middleware

### 1. `guest`

**Fungsi:** Memastikan hanya user yang belum login yang bisa akses route.

**Behavior:**
- Jika user sudah login → redirect ke home (`/`)
- Jika user belum login → allow access

**Digunakan di:** Login, Register, Forgot Password, Reset Password

---

### 2. `auth`

**Fungsi:** Memastikan hanya user yang sudah login yang bisa akses route.

**Behavior:**
- Jika user belum login → redirect ke `/login`
- Jika user sudah login → allow access

**Digunakan di:** Logout, Email Verification, Admin Routes, Requester Routes

---

### 3. `role:admin` / `role:requester`

**Fungsi:** Memastikan user memiliki role yang sesuai untuk akses route.

**Behavior:**
- Jika user tidak memiliki role yang sesuai → return **403 Forbidden**
- Jika user memiliki role yang sesuai → allow access

**Implementation:** `app/Http/Middleware/CheckRole.php`

**Digunakan di:**
- `role:admin` → Admin Routes
- `role:requester` → Requester Routes

---

## Rate Limiting

Rate limiting digunakan untuk mencegah brute force attack dan abuse.

### Login Rate Limit

**Limit:** 5 attempts per 1 menit per IP address

**Implementation:**
```php
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('login.post');
```

**Behavior:**
- Setelah 5 failed login attempts dalam 1 menit → return **429 Too Many Requests**
- Error message: "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit."

---

### Password Reset Rate Limit

**Limit:** 3 requests per 1 jam per email

**Implementation:**
```php
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])
    ->middleware('throttle:3,60')
    ->name('password.email');
```

**Behavior:**
- Setelah 3 password reset requests dalam 1 jam → return **429 Too Many Requests**
- Error message: "Terlalu banyak permintaan reset password. Silakan coba lagi nanti."

---

### Email Verification Rate Limit

**Limit:** 6 requests per 1 menit

**Implementation:**
```php
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');
```

**Behavior:**
- Setelah 6 verification attempts dalam 1 menit → return **429 Too Many Requests**

---

## Security Features

### 1. CSRF Protection

Semua POST, PUT, DELETE requests dilindungi oleh CSRF token. Laravel otomatis memvalidasi token untuk setiap request.

**Implementation:**
- Token disimpan di session
- Token harus disertakan di setiap form submission
- Inertia otomatis handle CSRF token

---

### 2. Signed URLs

Email verification menggunakan signed URL untuk memastikan link tidak bisa dimanipulasi.

**Implementation:**
```php
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');
```

**Behavior:**
- URL memiliki signature yang divalidasi oleh Laravel
- Jika signature tidak valid → return **403 Forbidden**

---

### 3. Role-Based Access Control

Setiap route dilindungi oleh middleware yang check role user.

**Implementation:**
- Admin routes: `middleware(['auth', 'role:admin'])`
- Requester routes: `middleware(['auth', 'role:requester'])`

**Behavior:**
- Jika user tidak memiliki role yang sesuai → return **403 Forbidden**
- Audit log mencatat setiap failed access attempt

---

## Testing

Semua routing telah di-test dengan PHPUnit. Test file: `tests/Feature/RoutingTest.php`

**Test Coverage:**
- ✅ Root route redirect behavior
- ✅ Guest routes accessibility
- ✅ Authenticated routes accessibility
- ✅ Admin routes dengan role-based access
- ✅ Requester routes dengan role-based access
- ✅ Rate limiting untuk login dan password reset
- ✅ Email verification routes

**Run Tests:**
```bash
docker-compose exec app php artisan test --filter=RoutingTest
```

---

## Future Enhancements

### Admin Routes (Fase Berikutnya)

```php
// User Management
Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');
Route::get('/admin/users/create', [UserController::class, 'create'])->name('admin.users.create');
Route::post('/admin/users', [UserController::class, 'store'])->name('admin.users.store');
Route::get('/admin/users/{user}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
Route::put('/admin/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');

// Approval Management
Route::get('/admin/approvals', [ApprovalController::class, 'index'])->name('admin.approvals.index');
Route::post('/admin/approvals/{approval}/approve', [ApprovalController::class, 'approve'])->name('admin.approvals.approve');
Route::post('/admin/approvals/{approval}/reject', [ApprovalController::class, 'reject'])->name('admin.approvals.reject');
```

### Requester Routes (Fase Berikutnya)

```php
// Submit Surat Ijin
Route::get('/requester/permits/create', [PermitController::class, 'create'])->name('requester.permits.create');
Route::post('/requester/permits', [PermitController::class, 'store'])->name('requester.permits.store');

// View Status & History
Route::get('/requester/permits', [PermitController::class, 'index'])->name('requester.permits.index');
Route::get('/requester/permits/{permit}', [PermitController::class, 'show'])->name('requester.permits.show');
```

---

## Troubleshooting

### Issue: 403 Forbidden saat akses route

**Possible Causes:**
1. User tidak memiliki role yang sesuai
2. Middleware `role:admin` atau `role:requester` tidak terdaftar

**Solution:**
- Check role user di database: `SELECT role FROM users WHERE id = ?`
- Check middleware alias di `bootstrap/app.php`

---

### Issue: 429 Too Many Requests

**Possible Causes:**
1. Terlalu banyak login attempts dalam 1 menit
2. Terlalu banyak password reset requests dalam 1 jam

**Solution:**
- Tunggu beberapa menit sebelum mencoba lagi
- Clear rate limit cache: `php artisan cache:clear`

---

### Issue: CSRF Token Mismatch

**Possible Causes:**
1. Session expired
2. CSRF token tidak disertakan di form

**Solution:**
- Refresh halaman untuk generate token baru
- Pastikan Inertia form menggunakan `useForm` hook

---

## References

- **Requirements:** `.kiro/specs/authentication-system/requirements.md` (Requirements 5.6, 5.7, 7.1, 7.2, 7.3, 7.7, 7.8, 8.13)
- **Design:** `.kiro/specs/authentication-system/design.md`
- **Middleware:** `app/Http/Middleware/CheckRole.php`, `app/Http/Middleware/EnsureEmailIsVerified.php`
- **Controllers:** `app/Http/Controllers/Auth/`
