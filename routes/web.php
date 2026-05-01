<?php

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
 * 1. Root route — redirect berdasarkan status authentication
 * 2. Guest routes — untuk user yang belum login (login, register, forgot password, reset password)
 * 3. Authenticated routes — untuk user yang sudah login (logout, email verification)
 * 4. Admin routes — hanya untuk user dengan role 'admin'
 * 5. Requester routes — hanya untuk user dengan role 'requester'
 *
 * Security:
 * - Rate limiting untuk login: 5 attempts per menit
 * - Rate limiting untuk password reset: 3 requests per jam
 * - CSRF protection aktif untuk semua POST/PUT/DELETE requests
 * - Role-based middleware untuk membatasi akses berdasarkan role
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
        // Redirect ke dashboard sesuai role
        if (auth()->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('requester.dashboard');
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

    // Register Routes
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
|
| Middleware: auth
|
*/

Route::middleware('auth')->group(function () {
    
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
| Admin Routes
|--------------------------------------------------------------------------
|
| Routes ini hanya bisa diakses oleh user dengan role 'admin'.
| Jika user bukan admin, akan mendapat error 403 Forbidden.
|
| Middleware: auth, role:admin
| Prefix: /admin
|
*/

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Admin Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/AdminDashboard', [
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    })->name('dashboard');

    // TODO: Tambahkan routes untuk fitur admin lainnya di sini
    // Contoh:
    // - User management (CRUD users)
    // - Approval workflow management
    // - Reports dan analytics
    // - System settings
});

/*
|--------------------------------------------------------------------------
| Requester Routes
|--------------------------------------------------------------------------
|
| Routes ini hanya bisa diakses oleh user dengan role 'requester'.
| Jika user bukan requester, akan mendapat error 403 Forbidden.
|
| Middleware: auth, role:requester
| Prefix: /requester
|
*/

Route::middleware(['auth', 'role:requester'])->prefix('requester')->name('requester.')->group(function () {
    
    // Requester Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/RequesterDashboard', [
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    })->name('dashboard');

    // TODO: Tambahkan routes untuk fitur requester lainnya di sini
    // Contoh:
    // - Submit surat ijin (Loading In, Loading Out, Ijin Kerja)
    // - View status surat yang diajukan
    // - Upload dokumen pendukung
    // - View history surat
});
