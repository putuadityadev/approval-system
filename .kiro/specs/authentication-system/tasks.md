# Implementation Plan: Authentication System

## Overview

Dokumen ini berisi task list untuk implementasi sistem authentication menggunakan Laravel 11 + Inertia.js + React (JavaScript/JSX) dengan MySQL database dan Docker environment. Sistem ini akan menjadi fondasi untuk aplikasi approval surat ijin mall di Bali dengan 2 role utama: Admin dan Requester.

**Tech Stack:**
- Backend: Laravel 11 (PHP 8.2+)
- Frontend: React 18 + Inertia.js (JavaScript/JSX)
- Styling: Tailwind CSS
- Database: MySQL 8.0
- Containerization: Docker + Docker Compose

**Coding Standards:**
- Komentar dalam Bahasa Indonesia
- Controller tipis (delegasi ke Service/Action)
- Form Request untuk semua validasi
- Komponen React maksimal 200 baris
- Props terdokumentasi di komentar

## Tasks

- [x] 1. Setup Docker development environment
  - Buat Dockerfile untuk Laravel app container (PHP 8.2-fpm + extensions)
  - Buat docker-compose.yml dengan 3 services: app, db, node
  - Konfigurasi volume persistence untuk MySQL data dan Laravel storage
  - Konfigurasi network internal untuk komunikasi antar containers
  - Expose port 8000 (Laravel) dan 3306 (MySQL)
  - Buat file .env.example dengan konfigurasi Docker
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 2. Initialize Laravel project dan Inertia setup
  - Install Laravel 11 di dalam app container
  - Install dan konfigurasi Inertia.js server-side
  - Install React 18 dan dependencies (Vite, Tailwind CSS)
  - Konfigurasi Inertia client-side di resources/js/app.jsx
  - Setup Tailwind CSS dengan konfigurasi untuk Inertia
  - Buat struktur folder: Actions, Services, Policies di app/
  - Buat struktur folder: Components/ui, Components/shared, Layouts, Pages, hooks, utils di resources/js/
  - Konfigurasi HandleInertiaRequests middleware untuk shared props (auth user)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 3. Create database migrations
  - [x] 3.1 Buat migration untuk users table
    - Kolom: id, name, email (unique), password, role (enum: admin/requester), email_verified_at, remember_token, timestamps
    - Index: email, role
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 3.2 Buat migration untuk password_reset_tokens table
    - Kolom: email (primary), token, created_at
    - Index: token
    - _Requirements: 8.4_
  
  - [x] 3.3 Buat migration untuk sessions table
    - Kolom: id (primary), user_id, ip_address, user_agent, payload, last_activity
    - Index: user_id, last_activity
    - _Requirements: 5.4, 5.5_
  
  - [x] 3.4 Buat migration untuk audit_logs table
    - Kolom: id, user_id (nullable FK), user_email, action, ip_address, user_agent, metadata (JSON), timestamps
    - Index: user_id, action, created_at
    - Foreign key: user_id references users(id) ON DELETE SET NULL
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 4. Create database seeders
  - [-] 4.1 Buat AdminSeeder untuk akun admin default
    - Email: admin@mall.com
    - Password: password123 (hashed)
    - Role: admin
    - Email verified: true
    - _Requirements: 3.7_
  
  - [~] 4.2 Buat RequesterSeeder untuk dummy requester (opsional, untuk testing)
    - Buat 3-5 akun requester dengan factory
    - Role: requester
    - Email verified: true
    - _Requirements: 3.7_

- [ ] 5. Implement Models dengan relationships
  - [~] 5.1 Buat User model
    - Fillable: name, email, password, role
    - Hidden: password, remember_token
    - Casts: email_verified_at (datetime), password (hashed)
    - Relationship: hasMany(AuditLog), hasMany(Session)
    - Scopes: scopeAdmins(), scopeRequesters()
    - Accessors: isAdmin(), isRequester()
    - _Requirements: 4.11, 5.10, 7.10_
  
  - [~] 5.2 Buat AuditLog model
    - Fillable: user_id, user_email, action, ip_address, user_agent, metadata
    - Casts: metadata (array)
    - Relationship: belongsTo(User)
    - Scopes: scopeByAction(string), scopeByUser(int)
    - _Requirements: 10.5, 10.6_

- [ ] 6. Create Form Request classes untuk validasi
  - [~] 6.1 Buat LoginRequest
    - Rules: email (required|email), password (required|string), remember (boolean)
    - _Requirements: 5.2_
  
  - [~] 6.2 Buat RegisterRequest
    - Rules: name (required|string|max:255), email (required|email|unique:users), password (required|string|min:8|confirmed)
    - Custom message dalam Bahasa Indonesia
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  
  - [~] 6.3 Buat ForgotPasswordRequest
    - Rules: email (required|email|exists:users,email)
    - _Requirements: 8.2_
  
  - [~] 6.4 Buat ResetPasswordRequest
    - Rules: token (required|string), email (required|email|exists:users), password (required|string|min:8|confirmed)
    - _Requirements: 8.8, 8.9_

- [ ] 7. Implement Service classes untuk business logic
  - [~] 7.1 Buat AuthService
    - Method register(array $data): User — buat user baru dengan role 'requester', hash password, auto-login
    - Method attempt(array $credentials, bool $remember): bool — login user dengan kredensial
    - Method logout(): void — hapus session dan remember_token
    - Semua method dengan komentar Bahasa Indonesia yang jelas
    - _Requirements: 4.6, 4.7, 4.8, 4.11, 5.3, 5.4, 5.5, 6.1, 6.2_
  
  - [~] 7.2 Buat PasswordResetService
    - Method sendResetLink(string $email): void — generate token, simpan ke DB, kirim email
    - Method resetPassword(array $data): void — validasi token, update password, hapus token
    - _Requirements: 8.3, 8.4, 8.5, 8.10, 8.11_
  
  - [~] 7.3 Buat AuditLogService
    - Method logLogin(User $user, Request $request): void
    - Method logLogout(User $user): void
    - Method logRegister(User $user): void
    - Method logPasswordReset(User $user): void
    - Method logFailedLogin(string $email, Request $request): void
    - Semua method menyimpan: user_id, user_email, action, ip_address, user_agent, timestamp
    - _Requirements: 5.10, 6.5, 10.1, 10.2, 10.3, 10.4, 10.7, 8.14_

- [ ] 8. Create Middleware untuk role-based access dan audit
  - [~] 8.1 Buat CheckRole middleware
    - Terima parameter role (admin atau requester)
    - Check apakah user memiliki role yang sesuai
    - Return 403 Forbidden jika tidak sesuai
    - _Requirements: 7.2, 7.4, 7.5_
  
  - [~] 8.2 Buat EnsureEmailIsVerified middleware (opsional untuk MVP)
    - Check apakah email_verified_at tidak null
    - Redirect ke verification.notice jika belum verified
    - _Requirements: 9.6_
  
  - [~] 8.3 Register middleware aliases di bootstrap/app.php
    - Alias 'role' untuk CheckRole
    - Alias 'verified' untuk EnsureEmailIsVerified
    - _Requirements: 7.1, 7.2_

- [ ] 9. Implement Controllers (tipis, delegasi ke Service)
  - [~] 9.1 Buat AuthController
    - showLogin(): render halaman login dengan Inertia
    - login(LoginRequest): panggil AuthService->attempt(), log audit, redirect ke dashboard sesuai role
    - showRegister(): render halaman register dengan Inertia
    - register(RegisterRequest): panggil AuthService->register(), log audit, redirect ke requester dashboard
    - logout(Request): panggil AuthService->logout(), log audit, redirect ke login
    - Semua method dengan komentar Bahasa Indonesia
    - _Requirements: 4.1, 4.8, 4.9, 4.10, 5.1, 5.6, 5.7, 6.3, 6.4_
  
  - [~] 9.2 Buat PasswordResetController
    - showForgotPassword(): render halaman forgot password
    - sendResetLink(ForgotPasswordRequest): panggil PasswordResetService->sendResetLink()
    - showResetPassword(string $token): render halaman reset password dengan token
    - resetPassword(ResetPasswordRequest): panggil PasswordResetService->resetPassword(), log audit
    - _Requirements: 8.1, 8.2, 8.6, 8.7, 8.12, 8.13_
  
  - [~] 9.3 Buat EmailVerificationController (opsional untuk MVP)
    - notice(): render halaman verification notice
    - verify(Request): validasi signed URL, update email_verified_at, log audit
    - resend(Request): kirim ulang email verifikasi
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.7_

- [~] 10. Setup routing dengan role-based access
  - Definisikan guest routes: login, register, forgot-password, reset-password
  - Definisikan authenticated routes: logout, email verification
  - Definisikan admin routes dengan middleware ['auth', 'role:admin']: /admin/dashboard
  - Definisikan requester routes dengan middleware ['auth', 'role:requester']: /requester/dashboard
  - Root route redirect ke dashboard jika authenticated, ke login jika guest
  - Tambahkan rate limiting untuk login (5 attempts/minute) dan password reset (3 requests/hour)
  - _Requirements: 5.6, 5.7, 7.1, 7.2, 7.3, 7.7, 7.8, 8.13_

- [~] 11. Checkpoint - Ensure backend structure complete
  - Pastikan semua migrations, models, services, controllers sudah dibuat
  - Jalankan `php artisan migrate` dan `php artisan db:seed`
  - Test manual: buat user via tinker, check database
  - Tanyakan user jika ada pertanyaan atau perlu penyesuaian

- [ ] 12. Create UI primitive components (resources/js/Components/ui/)
  - [~] 12.1 Buat Button.jsx
    - Props: type, variant (primary/secondary/danger), disabled, loading, children, onClick
    - Styling dengan Tailwind CSS, responsive
    - Tampilkan spinner jika loading=true
    - _Requirements: 11.9, 11.10, 11.11_
  
  - [~] 12.2 Buat Input.jsx
    - Props: type, name, value, onChange, error, label, placeholder, required
    - Tampilkan error message di bawah input jika ada
    - Styling dengan Tailwind CSS, responsive
    - _Requirements: 11.7, 11.10, 11.11_
  
  - [~] 12.3 Buat Label.jsx
    - Props: htmlFor, children, required
    - Tampilkan asterisk (*) jika required=true
    - _Requirements: 11.11_
  
  - [~] 12.4 Buat Alert.jsx
    - Props: type (success/error/warning/info), message
    - Styling berbeda untuk setiap type
    - _Requirements: 11.7_

- [ ] 13. Create shared components (resources/js/Components/shared/)
  - [~] 13.1 Buat ValidationErrors.jsx
    - Props: errors (object dari Inertia)
    - Render list of validation errors dengan styling
    - _Requirements: 11.7_
  
  - [~] 13.2 Buat FlashMessage.jsx
    - Props: message, type
    - Auto-dismiss setelah 5 detik
    - Animasi fade in/out
    - _Requirements: 6.4_
  
  - [~] 13.3 Buat UserMenu.jsx
    - Props: user (object dengan name dan role)
    - Dropdown menu: Profile, Settings, Logout
    - Tampilkan nama user dan role
    - _Requirements: 7.9_

- [ ] 14. Create Layouts
  - [~] 14.1 Buat GuestLayout.jsx
    - Layout untuk halaman authentication (login, register, forgot password, reset password)
    - Struktur: centered card dengan logo, form area, footer links
    - Styling: clean, minimal, responsive dengan Tailwind CSS
    - _Requirements: 11.5, 11.10_
  
  - [~] 14.2 Buat AuthenticatedLayout.jsx
    - Layout untuk halaman setelah login (dashboard)
    - Struktur: navbar (dengan UserMenu & logout), sidebar (navigation), main content area
    - Props: auth (user object)
    - Responsive: collapsible sidebar di mobile
    - _Requirements: 11.6, 11.10_

- [ ] 15. Create authentication pages (resources/js/Pages/Auth/)
  - [~] 15.1 Buat Login.jsx
    - Props: errors, status (flash message)
    - Form fields: email, password, remember (checkbox)
    - Submit: POST ke /login menggunakan useForm dari Inertia
    - Tampilkan loading state saat processing
    - Link ke register dan forgot password
    - _Requirements: 5.1, 11.1, 11.8, 11.9_
  
  - [~] 15.2 Buat Register.jsx
    - Props: errors
    - Form fields: name, email, password, password_confirmation
    - Submit: POST ke /register menggunakan useForm
    - Tampilkan loading state saat processing
    - Link ke login
    - _Requirements: 4.1, 11.2, 11.8, 11.9_
  
  - [~] 15.3 Buat ForgotPassword.jsx
    - Props: errors, status
    - Form field: email
    - Submit: POST ke /forgot-password
    - Tampilkan success message jika email terkirim
    - Link kembali ke login
    - _Requirements: 8.1, 11.3_
  
  - [~] 15.4 Buat ResetPassword.jsx
    - Props: token, email, errors
    - Form fields: password, password_confirmation (token dan email hidden)
    - Submit: POST ke /reset-password
    - Redirect ke login setelah success
    - _Requirements: 8.7, 11.4_
  
  - [~] 15.5 Buat VerifyEmail.jsx (opsional untuk MVP)
    - Props: status
    - Tampilkan pesan "Please verify your email"
    - Tombol "Resend Verification Email"
    - _Requirements: 9.1, 9.7, 11.12_

- [ ] 16. Create dashboard pages (resources/js/Pages/Dashboard/)
  - [~] 16.1 Buat AdminDashboard.jsx
    - Props: auth (user object)
    - Tampilan: Welcome message dengan nama admin, placeholder untuk fitur future
    - Layout: gunakan AuthenticatedLayout
    - _Requirements: 5.6, 7.6_
  
  - [~] 16.2 Buat RequesterDashboard.jsx
    - Props: auth (user object)
    - Tampilan: Welcome message dengan nama requester, placeholder untuk fitur future
    - Layout: gunakan AuthenticatedLayout
    - _Requirements: 4.9, 5.7, 7.7_

- [ ] 17. Create custom hooks (resources/js/hooks/)
  - [~] 17.1 Buat useAuth.js
    - Return: { user, isAdmin, isRequester, logout }
    - Ambil data user dari Inertia shared props (usePage().props.auth)
    - Helper functions untuk check role
    - _Requirements: 7.9, 7.10_
  
  - [~] 17.2 Buat useFlashMessage.js
    - Return: { message, type, show, hide }
    - Manage flash message state
    - Auto-hide setelah duration tertentu
    - _Requirements: 6.4_

- [~] 18. Implement email functionality untuk password reset
  - Konfigurasi mail driver di .env (gunakan 'log' untuk development)
  - Buat Mailable class untuk password reset email
  - Buat email template dengan link reset password
  - Test email sending dengan Mailtrap atau log driver
  - _Requirements: 8.5_

- [~] 19. Checkpoint - Ensure frontend complete
  - Pastikan semua komponen, layouts, dan pages sudah dibuat
  - Test manual: akses setiap halaman, check styling dan responsiveness
  - Jalankan `npm run build` untuk ensure no build errors
  - Tanyakan user jika ada pertanyaan atau perlu penyesuaian

- [ ] 20. Integration dan wiring
  - [~] 20.1 Wire authentication flow end-to-end
    - Test flow: register → auto-login → redirect ke requester dashboard
    - Test flow: login sebagai admin → redirect ke admin dashboard
    - Test flow: login sebagai requester → redirect ke requester dashboard
    - Test flow: logout → redirect ke login
    - _Requirements: 4.8, 4.9, 5.6, 5.7, 6.3_
  
  - [~] 20.2 Wire password reset flow end-to-end
    - Test flow: forgot password → email sent → click link → reset password → login
    - Test expired token scenario
    - _Requirements: 8.1 - 8.13_
  
  - [~] 20.3 Wire role-based access control
    - Test: requester tidak bisa akses /admin/dashboard (403)
    - Test: admin tidak bisa akses /requester/dashboard (403)
    - Test: guest tidak bisa akses protected routes (redirect ke login)
    - _Requirements: 7.3, 7.4, 7.5_
  
  - [~] 20.4 Verify audit trail logging
    - Check database: audit_logs table terisi untuk login, logout, register, password reset
    - Verify data: user_id, user_email, action, ip_address, user_agent, timestamp
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 21. Create comprehensive documentation
  - [~] 21.1 Buat README.md di root project
    - Section: Prerequisites (Docker, Git)
    - Section: Installation (clone, setup .env, docker-compose up, migrate, seed)
    - Section: Development (start server, run Vite, access app)
    - Section: Default Credentials (admin@mall.com / password123)
    - Section: Troubleshooting (permission issues, clear cache, rebuild containers)
    - Section: Project Structure (folder structure dengan penjelasan)
    - Section: Coding Standards (link ke rules_coding.md)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10_
  
  - [~] 21.2 Verify komentar Bahasa Indonesia di semua file
    - Check: setiap file PHP memiliki komentar header
    - Check: setiap fungsi memiliki komentar penjelasan
    - Check: setiap komponen React memiliki komentar props
    - _Requirements: 12.12, 13.5, 13.7_

- [ ]* 22. Write unit tests untuk Services
  - [ ]* 22.1 Test AuthService
    - test_register_creates_user_with_requester_role()
    - test_register_hashes_password()
    - test_attempt_returns_true_for_valid_credentials()
    - test_attempt_returns_false_for_invalid_credentials()
    - test_logout_clears_session()
  
  - [ ]* 22.2 Test PasswordResetService
    - test_send_reset_link_generates_token()
    - test_reset_password_updates_password()
    - test_reset_password_deletes_token()
  
  - [ ]* 22.3 Test AuditLogService
    - test_log_login_creates_audit_record()
    - test_log_logout_creates_audit_record()
    - test_log_includes_ip_and_user_agent()

- [ ]* 23. Write feature tests untuk authentication flows
  - [ ]* 23.1 Test registration flow
    - test_user_can_view_registration_page()
    - test_user_can_register_as_requester()
    - test_user_cannot_register_with_duplicate_email()
    - test_user_is_auto_logged_in_after_registration()
    - test_registration_only_creates_requester_role()
  
  - [ ]* 23.2 Test login flow
    - test_user_can_view_login_page()
    - test_user_can_login_with_valid_credentials()
    - test_user_cannot_login_with_invalid_credentials()
    - test_user_is_redirected_to_correct_dashboard_based_on_role()
    - test_user_can_logout()
  
  - [ ]* 23.3 Test password reset flow
    - test_user_can_request_password_reset()
    - test_password_reset_email_is_sent()
    - test_user_can_reset_password_with_valid_token()
    - test_user_cannot_reset_password_with_invalid_token()
    - test_password_reset_token_expires_after_60_minutes()
  
  - [ ]* 23.4 Test role-based access
    - test_admin_can_access_admin_routes()
    - test_requester_cannot_access_admin_routes()
    - test_requester_can_access_requester_routes()
    - test_admin_cannot_access_requester_routes()
    - test_guest_cannot_access_protected_routes()
  
  - [ ]* 23.5 Test audit trail
    - test_login_creates_audit_log()
    - test_logout_creates_audit_log()
    - test_registration_creates_audit_log()
    - test_password_reset_creates_audit_log()

- [ ]* 24. Write component tests untuk React components
  - [ ]* 24.1 Test Login component
    - renders login form with email and password fields
    - shows validation errors when fields are empty
    - disables submit button while processing
    - calls login endpoint with correct data
  
  - [ ]* 24.2 Test Register component
    - renders registration form with all required fields
    - validates email format on blur
    - validates password strength
    - validates password confirmation match
  
  - [ ]* 24.3 Test Dashboard components
    - renders admin dashboard for admin users
    - renders requester dashboard for requester users
    - displays user name and role
    - shows logout button

- [~] 25. Final checkpoint - Complete system verification
  - Ensure all tests pass (unit, feature, component)
  - Verify Docker containers running properly
  - Test complete user journey: register → login → dashboard → logout
  - Test complete password reset journey
  - Verify audit logs in database
  - Check responsive design di mobile dan desktop
  - Review kode untuk ensure coding standards compliance
  - Tanyakan user untuk final review dan approval

## Notes

### MVP Scope
Tasks ini fokus pada setup infrastruktur dan authentication system yang solid. Fitur-fitur berikut akan dikembangkan di fase selanjutnya:
- Approval workflow untuk surat ijin (Loading In, Loading Out, Ijin Kerja)
- Upload dan storage file/foto surat (Cloudflare R2)
- Notifikasi untuk Admin saat ada surat masuk
- Dashboard analytics dan reporting
- User management UI untuk Admin (CRUD users)

### Testing Strategy
- Tasks dengan tanda `*` adalah optional dan bisa di-skip untuk MVP yang lebih cepat
- Unit tests dan feature tests sangat direkomendasikan untuk production readiness
- Component tests bisa ditambahkan setelah MVP jika ada waktu

### Coding Standards Compliance
Setiap task harus mengikuti coding standards yang telah ditetapkan:
- Komentar Bahasa Indonesia di setiap file dan fungsi
- Controller tipis (delegasi ke Service/Action)
- Form Request untuk semua validasi
- Komponen React maksimal 200 baris
- Props terdokumentasi di komentar
- Eager loading untuk hindari N+1 query

### Email Configuration
Untuk development, gunakan mail driver 'log' (email akan muncul di storage/logs/laravel.log). Untuk production, perlu konfigurasi SMTP yang proper.

### Security Considerations
- Password di-hash dengan bcrypt (default Laravel)
- Session menggunakan secure cookie di production
- CSRF protection aktif untuk semua form
- Rate limiting untuk login dan password reset

### Performance Considerations
- Database indexing untuk kolom yang sering di-query (email, role)
- Eager loading untuk relationship
- Pagination untuk large datasets
