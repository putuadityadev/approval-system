<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * routes/web.php
 *
 * Fungsi file ini:
 * - Mendefinisikan semua routes untuk aplikasi Mall Approval System
 * - Mengatur role-based access control dengan middleware
 * - Menerapkan rate limiting untuk keamanan (login dan password reset)
 *
 * Struktur routing:
 * 1. Root route — redirect berdasarkan status authentication dan role
 * 2. Guest routes — untuk user yang belum login (login, register, forgot password, reset password)
 * 3. Authenticated routes — untuk user yang sudah login (logout, email verification)
 * 4. Super Admin routes — hanya untuk user dengan role 'super_admin'
 * 5. Vendor routes — hanya untuk user dengan role 'vendor'
 * 6. Approver routes — untuk user dengan role approver (dept, ops, finance, gm)
 * 7. Security routes — hanya untuk user dengan role 'security'
 *
 * Security:
 * - Rate limiting untuk login: 5 attempts per menit
 * - Rate limiting untuk password reset: 3 requests per jam
 * - CSRF protection aktif untuk semua POST/PUT/DELETE requests
 * - Role-based middleware untuk membatasi akses berdasarkan role
 * - Active status check untuk semua authenticated routes
 */

/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
|
| Route utama aplikasi. Jika user sudah login, redirect ke dashboard sesuai role.
| Jika belum login, redirect ke halaman login.
|
*/

Route::get('/', function () {
    // Check apakah user sudah login
    if (auth()->check()) {
        // Redirect ke dashboard sesuai role menggunakan helper method
        $dashboardRoute = auth()->user()->getDashboardRoute();
        return redirect()->route($dashboardRoute);
    }

    // Jika belum login, redirect ke halaman login
    return redirect()->route('login');
})->name('home');

/*
|--------------------------------------------------------------------------
| Guest Routes
|--------------------------------------------------------------------------
|
| Routes ini hanya bisa diakses oleh user yang belum login (guest).
| Jika user sudah login, akan di-redirect ke dashboard sesuai role.
|
| Middleware: guest
| Rate Limiting:
| - Login: 5 attempts per menit (throttle:5,1)
| - Password reset: 3 requests per jam (throttle:3,60)
|
*/

Route::middleware('guest')->group(function () {
    
    // Login Routes
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1') // Rate limit: 5 attempts per 1 menit
        ->name('login.post');

    // Register Routes (untuk Vendor)
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.post');

    // Forgot Password Routes
    Route::get('/forgot-password', [PasswordResetController::class, 'showForgotPassword'])
        ->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])
        ->middleware('throttle:3,60') // Rate limit: 3 requests per 60 menit (1 jam)
        ->name('password.email');

    // Reset Password Routes
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetPassword'])
        ->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
        ->name('password.update');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
|
| Routes ini hanya bisa diakses oleh user yang sudah login.
| Jika user belum login, akan di-redirect ke halaman login.
| Jika user tidak aktif (is_active = false), akan di-logout otomatis.
|
| Middleware: auth, active
|
*/

Route::middleware(['auth', 'active'])->group(function () {
    
    // Logout Route
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Email Verification Routes (Opsional untuk MVP)
    // Uncomment jika email verification diaktifkan
    Route::get('/email/verify', [EmailVerificationController::class, 'notice'])
        ->name('verification.notice');
    
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1']) // Signed URL + rate limit
        ->name('verification.verify');
    
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1') // Rate limit: 6 requests per menit
        ->name('verification.send');
});

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
|
| Routes ini hanya bisa diakses oleh user dengan role 'super_admin'.
| Jika user bukan super admin, akan mendapat error 403 Forbidden.
|
| Middleware: auth, active, role:super_admin
| Prefix: /admin
|
*/

Route::middleware(['auth', 'active', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Super Admin Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard', [
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    })->name('dashboard');

    // User Management Routes (CRUD)
    Route::resource('users', UserController::class)->except(['show']);
    
    // Activate User Route (custom action)
    Route::post('/users/{user}/activate', [UserController::class, 'activate'])->name('users.activate');
});

/*
|--------------------------------------------------------------------------
| Vendor Routes
|--------------------------------------------------------------------------
|
| Routes ini hanya bisa diakses oleh user dengan role 'vendor'.
| Jika user bukan vendor, akan mendapat error 403 Forbidden.
|
| Middleware: auth, active, role:vendor
| Prefix: /vendor
|
*/

Route::middleware(['auth', 'active', 'role:vendor'])->prefix('vendor')->name('vendor.')->group(function () {
    
    // Vendor Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Vendor\RequestController::class, 'dashboard'])
        ->name('dashboard');

    // Request Management Routes
    Route::get('/requests', [\App\Http\Controllers\Vendor\RequestController::class, 'index'])
        ->name('requests.index');
    
    // My Documents
    Route::get('/documents', [\App\Http\Controllers\Vendor\DocumentController::class, 'index'])
        ->name('documents.index');
    
    // My Profile
    Route::get('/profile', [\App\Http\Controllers\Vendor\ProfileController::class, 'index'])
        ->name('profile.index');
    Route::post('/profile/password', [\App\Http\Controllers\Vendor\ProfileController::class, 'updatePassword'])
        ->name('profile.password.update');
    
    // New Flow: Upload & OCR first, then create form
    Route::post('/requests/upload-and-scan', [\App\Http\Controllers\Vendor\RequestController::class, 'uploadAndScan'])
        ->name('requests.upload-scan');
    
    // SIKMB Routes (with OCR data)
    Route::get('/requests/create/sikmb', [\App\Http\Controllers\Vendor\RequestController::class, 'createSikmb'])
        ->name('requests.create.sikmb');
    Route::post('/requests/sikmb', [\App\Http\Controllers\Vendor\RequestController::class, 'storeSikmb'])
        ->name('requests.store.sikmb');
    
    // SIK Routes (with OCR data)
    Route::get('/requests/create/sik', [\App\Http\Controllers\Vendor\RequestController::class, 'createSik'])
        ->name('requests.create.sik');
    Route::post('/requests/sik', [\App\Http\Controllers\Vendor\RequestController::class, 'storeSik'])
        ->name('requests.store.sik');
    
    // Request Detail & Actions
    Route::get('/requests/{id}', [\App\Http\Controllers\Vendor\RequestController::class, 'show'])
        ->name('requests.show');
    Route::post('/requests/{id}/cancel', [\App\Http\Controllers\Vendor\RequestController::class, 'cancel'])
        ->name('requests.cancel');
    
    // OCR Routes (untuk ekstrak data dari gambar surat)
    Route::post('/ocr/extract-sikmb', [\App\Http\Controllers\Vendor\OcrController::class, 'extractSikmData'])
        ->name('ocr.extract.sikmb');
    Route::post('/ocr/extract-sik', [\App\Http\Controllers\Vendor\OcrController::class, 'extractSikData'])
        ->name('ocr.extract.sik');
});

/*
|--------------------------------------------------------------------------
| Approver Routes
|--------------------------------------------------------------------------
|
| Routes ini bisa diakses oleh user dengan role approver (dept, ops, finance, gm).
| Jika user bukan approver, akan mendapat error 403 Forbidden.
|
| Middleware: auth, active, role:approver_dept,approver_ops,approver_finance,approver_gm
| Prefix: /approver
|
*/

Route::middleware(['auth', 'active', 'role:approver_dept,approver_ops,approver_finance,approver_gm'])->prefix('approver')->name('approver.')->group(function () {
    
    // Approver Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Approver\ApprovalController::class, 'dashboard'])
        ->name('dashboard');

    // Request Management Routes
    Route::get('/requests', [\App\Http\Controllers\Approver\ApprovalController::class, 'index'])
        ->name('requests.index');
    
    Route::get('/requests/{id}', [\App\Http\Controllers\Approver\ApprovalController::class, 'show'])
        ->name('requests.show');
    
    Route::post('/requests/{id}/approve', [\App\Http\Controllers\Approver\ApprovalController::class, 'approve'])
        ->name('requests.approve');
    
    Route::post('/requests/{id}/reject', [\App\Http\Controllers\Approver\ApprovalController::class, 'reject'])
        ->name('requests.reject');
    
    // Approval History
    Route::get('/history', [\App\Http\Controllers\Approver\ApprovalController::class, 'history'])
        ->name('history');
});

/*
|--------------------------------------------------------------------------
| Security Routes
|--------------------------------------------------------------------------
|
| Routes ini hanya bisa diakses oleh user dengan role 'security'.
| Jika user bukan security, akan mendapat error 403 Forbidden.
|
| Middleware: auth, active, role:security
| Prefix: /security
|
*/

Route::middleware(['auth', 'active', 'role:security'])->prefix('security')->name('security.')->group(function () {
    
    // Security Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Security\SecurityController::class, 'dashboard'])
        ->name('dashboard');

    // QR Scanner
    Route::get('/scanner', [\App\Http\Controllers\Security\SecurityController::class, 'scanner'])
        ->name('scanner');
    
    // Process QR Scan
    Route::post('/scan', [\App\Http\Controllers\Security\SecurityController::class, 'scan'])
        ->name('scan');
    
    // Process Scan by Document Serial Number (Manual Input untuk Testing)
    Route::post('/scan-by-serial', [\App\Http\Controllers\Security\SecurityController::class, 'scanBySerial'])
        ->name('scan.by.serial');
    
    // Request Management
    Route::get('/requests', [\App\Http\Controllers\Security\SecurityController::class, 'index'])
        ->name('requests.index');
    
    Route::get('/requests/{id}', [\App\Http\Controllers\Security\SecurityController::class, 'show'])
        ->name('requests.show');
    
    // Upload Evidence Photos
    Route::post('/requests/{id}/evidence', [\App\Http\Controllers\Security\SecurityController::class, 'uploadEvidence'])
        ->name('requests.evidence');
});
