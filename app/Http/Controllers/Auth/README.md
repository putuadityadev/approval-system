# Authentication Controllers

## Overview

Folder ini berisi semua controller yang menangani authentication flow untuk sistem approval mall.

## Controllers

### 1. AuthController.php
**Tanggung Jawab**: Mengelola login, register, dan logout

**Methods**:
- `showLogin()` - Render halaman login
- `login(LoginRequest)` - Proses login user
- `showRegister()` - Render halaman register
- `register(RegisterRequest)` - Proses registrasi requester baru
- `logout(Request)` - Proses logout user

**Routes**:
- GET `/login` → showLogin
- POST `/login` → login
- GET `/register` → showRegister
- POST `/register` → register
- POST `/logout` → logout

### 2. PasswordResetController.php
**Tanggung Jawab**: Mengelola forgot password dan reset password

**Methods**:
- `showForgotPassword()` - Render halaman forgot password
- `sendResetLink(ForgotPasswordRequest)` - Kirim email reset password
- `showResetPassword(string $token)` - Render halaman reset password
- `resetPassword(ResetPasswordRequest)` - Update password baru

**Routes**:
- GET `/forgot-password` → showForgotPassword
- POST `/forgot-password` → sendResetLink
- GET `/reset-password/{token}` → showResetPassword
- POST `/reset-password` → resetPassword

### 3. EmailVerificationController.php (Opsional untuk MVP)
**Tanggung Jawab**: Mengelola email verification

**Methods**:
- `notice()` - Render halaman verification notice
- `verify(EmailVerificationRequest)` - Proses verifikasi email
- `resend(Request)` - Kirim ulang email verifikasi

**Routes**:
- GET `/email/verify` → notice
- GET `/email/verify/{id}/{hash}` → verify
- POST `/email/verification-notification` → resend

**Note**: Controller ini opsional. Lihat `README-EMAIL-VERIFICATION.md` untuk setup guide.

## Prinsip Design

### Controller Tipis
Semua controller mengikuti prinsip "thin controller":
- Controller hanya menerima request dan validasi
- Logika bisnis didelegasikan ke Service layer
- Audit logging didelegasikan ke AuditLogService

### Dependency Injection
Semua dependencies di-inject melalui constructor:
```php
public function __construct(
    protected AuthService $authService,
    protected AuditLogService $auditLogService
) {}
```

### Form Request Validation
Semua validasi menggunakan Form Request class, tidak di controller:
- `LoginRequest` - validasi login form
- `RegisterRequest` - validasi register form
- `ForgotPasswordRequest` - validasi forgot password form
- `ResetPasswordRequest` - validasi reset password form
- `EmailVerificationRequest` - validasi signed URL (Laravel built-in)

### Inertia Response
Semua halaman di-render menggunakan Inertia:
```php
return Inertia::render('Auth/Login');
```

### Audit Trail
Semua aktivitas authentication dicatat ke audit_logs:
- Login (berhasil dan gagal)
- Logout
- Register
- Password reset
- Email verification

## Testing

Setiap controller memiliki test suite di `tests/Feature/`:
- `AuthControllerTest.php`
- `PasswordResetControllerTest.php`
- `EmailVerificationControllerTest.php`

Jalankan test:
```bash
# Test semua authentication controllers
php artisan test tests/Feature/Auth

# Test specific controller
php artisan test --filter AuthControllerTest
```

## Komentar Bahasa Indonesia

Semua file mengikuti coding standards dengan komentar Bahasa Indonesia:
- Komentar header di setiap file menjelaskan fungsi file
- Komentar di setiap method menjelaskan cara kerja
- Komentar inline untuk logika yang kompleks

## Dependencies

### Services
- `AuthService` - logika authentication (register, login, logout)
- `PasswordResetService` - logika password reset
- `AuditLogService` - logging aktivitas authentication

### Models
- `User` - model user dengan role-based access
- `AuditLog` - model untuk audit trail

### Middleware
- `auth` - memastikan user sudah login
- `guest` - memastikan user belum login
- `role:admin` - memastikan user adalah admin
- `role:requester` - memastikan user adalah requester
- `verified` - memastikan email sudah diverifikasi (opsional)

## Next Steps

Setelah authentication system selesai, fitur berikutnya:
1. Dashboard untuk Admin dan Requester
2. Approval workflow untuk surat ijin
3. File upload dan storage
4. Notifikasi real-time
5. User management UI
