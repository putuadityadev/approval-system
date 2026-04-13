# Requirements Document: Authentication System

## Introduction

Dokumen ini mendefinisikan requirements untuk fase pertama pengembangan sistem approval mall di Bali, yang berfokus pada setup project dan sistem authentication. Sistem ini akan dibangun menggunakan Laravel + Inertia.js + React dengan MySQL database, dan akan di-deploy menggunakan Docker untuk memudahkan development tanpa instalasi Composer lokal.

Sistem authentication ini akan menjadi fondasi untuk sistem approval surat ijin kerja (Loading In, Loading Out, dan Ijin Kerja) yang akan dikembangkan di fase berikutnya. Pada fase ini, fokus utama adalah membangun infrastruktur project dan mekanisme authentication yang robust dengan role-based access control untuk dua role utama: Admin dan Requester.

## Glossary

- **Authentication_System**: Sistem yang mengelola proses registrasi, login, logout, dan manajemen sesi user
- **Admin**: User dengan role administrator yang memiliki hak untuk approve/reject surat ijin
- **Requester**: User dengan role requester (vendor) yang dapat mengajukan surat ijin kerja
- **Docker_Environment**: Environment development yang terisolasi menggunakan Docker containers untuk Laravel, MySQL, dan Node.js
- **Role_Based_Access**: Mekanisme kontrol akses berdasarkan role user (Admin atau Requester)
- **Self_Registration**: Fitur yang memungkinkan Requester mendaftar akun sendiri tanpa bantuan Admin
- **Audit_Trail**: Log sistem yang mencatat aktivitas user (who, when, what action)
- **Laravel_Application**: Aplikasi backend yang dibangun dengan framework Laravel
- **Inertia_Bridge**: Layer yang menghubungkan Laravel backend dengan React frontend
- **React_Frontend**: Aplikasi frontend yang dibangun dengan React dan Inertia.js
- **Database_Migration**: Script untuk membuat dan memodifikasi struktur database
- **Database_Seeder**: Script untuk mengisi data awal ke database
- **Form_Request**: Class Laravel untuk validasi input form
- **Policy_Class**: Class Laravel untuk authorization logic
- **Middleware**: Layer yang memproses request sebelum sampai ke controller
- **Email_Verification**: Proses verifikasi email user setelah registrasi (opsional untuk MVP)
- **Password_Reset**: Fitur untuk reset password jika user lupa

## Requirements

### Requirement 1: Docker Development Environment Setup

**User Story:** Sebagai developer, saya ingin setup development environment menggunakan Docker, sehingga saya dapat menjalankan aplikasi tanpa perlu install Composer, PHP, atau MySQL di lokal.

#### Acceptance Criteria

1. THE Docker_Environment SHALL menyediakan container untuk Laravel application dengan PHP 8.2 atau lebih tinggi
2. THE Docker_Environment SHALL menyediakan container untuk MySQL 8.0 database
3. THE Docker_Environment SHALL menyediakan container untuk Node.js 20 atau lebih tinggi untuk build React assets
4. THE Docker_Environment SHALL menyediakan volume persistence untuk MySQL data
5. THE Docker_Environment SHALL menyediakan volume persistence untuk Laravel storage
6. WHEN developer menjalankan `docker-compose up`, THE Docker_Environment SHALL menjalankan semua services yang diperlukan
7. THE Docker_Environment SHALL expose port 8000 untuk Laravel application
8. THE Docker_Environment SHALL expose port 3306 untuk MySQL database
9. THE Docker_Environment SHALL menyediakan network internal untuk komunikasi antar containers

### Requirement 2: Laravel Project Structure

**User Story:** Sebagai developer, saya ingin project Laravel yang terstruktur dengan baik menggunakan Inertia.js dan React, sehingga kode mudah di-maintain dan mengikuti best practices.

#### Acceptance Criteria

1. THE Laravel_Application SHALL menggunakan Laravel versi 11 atau terbaru
2. THE Laravel_Application SHALL terintegrasi dengan Inertia.js sebagai bridge ke frontend
3. THE React_Frontend SHALL menggunakan React 18 atau lebih tinggi dengan JavaScript/JSX (bukan TypeScript)
4. THE React_Frontend SHALL menggunakan Tailwind CSS untuk styling
5. THE Laravel_Application SHALL memiliki struktur folder untuk Controllers, Requests, Services, Actions, Models, dan Policies
6. THE React_Frontend SHALL memiliki struktur folder untuk Pages, Components, Layouts, hooks, dan utils
7. WHEN Laravel_Application di-build, THE Inertia_Bridge SHALL dapat merender React components
8. THE Laravel_Application SHALL menyediakan dokumentasi README.md dengan instruksi cara menjalankan project

### Requirement 3: Database Schema untuk Authentication

**User Story:** Sebagai developer, saya ingin database schema yang mendukung authentication dengan role-based access, sehingga sistem dapat membedakan Admin dan Requester.

#### Acceptance Criteria

1. THE Database_Migration SHALL membuat table `users` dengan kolom: id, name, email, password, role, email_verified_at, remember_token, timestamps
2. THE Database_Migration SHALL membuat kolom `role` dengan tipe ENUM yang berisi nilai 'admin' dan 'requester'
3. THE Database_Migration SHALL membuat kolom `email` dengan constraint UNIQUE
4. THE Database_Migration SHALL membuat index pada kolom `email` untuk optimasi query
5. THE Database_Migration SHALL membuat index pada kolom `role` untuk optimasi query
6. THE Database_Migration SHALL menyediakan method down() untuk rollback schema changes
7. THE Database_Seeder SHALL membuat minimal satu akun Admin default dengan email dan password yang terdokumentasi

### Requirement 4: User Registration untuk Requester

**User Story:** Sebagai Requester (vendor), saya ingin mendaftar akun sendiri melalui aplikasi, sehingga saya dapat mengajukan surat ijin tanpa perlu menghubungi Admin.

#### Acceptance Criteria

1. WHEN Requester mengakses halaman registrasi, THE Authentication_System SHALL menampilkan form dengan field: name, email, password, password_confirmation
2. WHEN Requester submit form registrasi, THE Form_Request SHALL memvalidasi bahwa semua field wajib diisi
3. WHEN Requester submit form registrasi, THE Form_Request SHALL memvalidasi bahwa email belum terdaftar di database
4. WHEN Requester submit form registrasi, THE Form_Request SHALL memvalidasi bahwa password minimal 8 karakter
5. WHEN Requester submit form registrasi, THE Form_Request SHALL memvalidasi bahwa password dan password_confirmation cocok
6. WHEN validasi berhasil, THE Authentication_System SHALL membuat user baru dengan role 'requester'
7. WHEN validasi berhasil, THE Authentication_System SHALL meng-hash password sebelum disimpan ke database
8. WHEN user berhasil dibuat, THE Authentication_System SHALL otomatis login user tersebut
9. WHEN user berhasil dibuat, THE Authentication_System SHALL redirect ke dashboard Requester
10. IF validasi gagal, THEN THE Authentication_System SHALL menampilkan error message yang deskriptif
11. THE Self_Registration SHALL hanya membuat user dengan role 'requester', tidak dapat membuat Admin

### Requirement 5: User Login untuk Admin dan Requester

**User Story:** Sebagai user (Admin atau Requester), saya ingin login ke aplikasi menggunakan email dan password, sehingga saya dapat mengakses fitur sesuai role saya.

#### Acceptance Criteria

1. WHEN user mengakses halaman login, THE Authentication_System SHALL menampilkan form dengan field: email, password, remember_me (checkbox)
2. WHEN user submit form login, THE Form_Request SHALL memvalidasi bahwa email dan password diisi
3. WHEN user submit form login, THE Authentication_System SHALL memeriksa kredensial di database
4. WHEN kredensial valid, THE Authentication_System SHALL membuat session untuk user
5. WHEN kredensial valid dan remember_me dicentang, THE Authentication_System SHALL membuat persistent session
6. WHEN kredensial valid dan user adalah Admin, THE Authentication_System SHALL redirect ke dashboard Admin
7. WHEN kredensial valid dan user adalah Requester, THE Authentication_System SHALL redirect ke dashboard Requester
8. IF kredensial tidak valid, THEN THE Authentication_System SHALL menampilkan error message "Email atau password salah"
9. IF user sudah login, THEN THE Authentication_System SHALL redirect ke dashboard sesuai role tanpa menampilkan halaman login
10. THE Authentication_System SHALL mencatat login activity ke Audit_Trail dengan informasi: user_id, action 'login', timestamp

### Requirement 6: User Logout

**User Story:** Sebagai user yang sudah login, saya ingin logout dari aplikasi, sehingga session saya berakhir dan orang lain tidak dapat mengakses akun saya.

#### Acceptance Criteria

1. WHEN user klik tombol logout, THE Authentication_System SHALL menghapus session user
2. WHEN user klik tombol logout, THE Authentication_System SHALL menghapus remember_me token jika ada
3. WHEN logout berhasil, THE Authentication_System SHALL redirect user ke halaman login
4. WHEN logout berhasil, THE Authentication_System SHALL menampilkan flash message "Anda berhasil logout"
5. THE Authentication_System SHALL mencatat logout activity ke Audit_Trail dengan informasi: user_id, action 'logout', timestamp

### Requirement 7: Role-Based Access Control

**User Story:** Sebagai sistem, saya ingin membatasi akses fitur berdasarkan role user, sehingga Admin dan Requester hanya dapat mengakses fitur yang sesuai dengan role mereka.

#### Acceptance Criteria

1. THE Middleware SHALL memeriksa apakah user sudah login sebelum mengakses protected routes
2. THE Middleware SHALL memeriksa role user sebelum mengakses role-specific routes
3. WHEN user belum login mencoba akses protected route, THE Middleware SHALL redirect ke halaman login
4. WHEN Requester mencoba akses Admin route, THE Middleware SHALL menampilkan error 403 Forbidden
5. WHEN Admin mencoba akses Requester route, THE Middleware SHALL menampilkan error 403 Forbidden
6. THE Policy_Class SHALL mendefinisikan authorization rules untuk setiap resource
7. THE Laravel_Application SHALL menyediakan route group untuk Admin dengan prefix '/admin'
8. THE Laravel_Application SHALL menyediakan route group untuk Requester dengan prefix '/requester'
9. THE React_Frontend SHALL menyembunyikan menu/tombol yang tidak sesuai dengan role user
10. THE React_Frontend SHALL menerima informasi role user melalui Inertia shared props

### Requirement 8: Password Reset/Forgot Password

**User Story:** Sebagai user yang lupa password, saya ingin mereset password saya melalui email, sehingga saya dapat login kembali ke aplikasi.

#### Acceptance Criteria

1. WHEN user klik link "Lupa Password" di halaman login, THE Authentication_System SHALL menampilkan form forgot password dengan field email
2. WHEN user submit email, THE Form_Request SHALL memvalidasi bahwa email terdaftar di database
3. WHEN email valid, THE Authentication_System SHALL generate password reset token
4. WHEN email valid, THE Authentication_System SHALL menyimpan token ke table `password_reset_tokens` dengan expiry 60 menit
5. WHEN email valid, THE Authentication_System SHALL mengirim email berisi link reset password ke user
6. WHEN user klik link reset password dari email, THE Authentication_System SHALL memvalidasi bahwa token masih valid
7. WHEN token valid, THE Authentication_System SHALL menampilkan form reset password dengan field: password, password_confirmation
8. WHEN user submit form reset password, THE Form_Request SHALL memvalidasi bahwa password minimal 8 karakter
9. WHEN user submit form reset password, THE Form_Request SHALL memvalidasi bahwa password dan password_confirmation cocok
10. WHEN validasi berhasil, THE Authentication_System SHALL update password user di database
11. WHEN password berhasil direset, THE Authentication_System SHALL menghapus token dari table `password_reset_tokens`
12. WHEN password berhasil direset, THE Authentication_System SHALL redirect ke halaman login dengan flash message "Password berhasil direset"
13. IF token expired atau tidak valid, THEN THE Authentication_System SHALL menampilkan error message "Link reset password tidak valid atau sudah kadaluarsa"
14. THE Authentication_System SHALL mencatat password reset activity ke Audit_Trail

### Requirement 9: Email Verification (Opsional untuk MVP)

**User Story:** Sebagai Admin, saya ingin memastikan email Requester valid, sehingga komunikasi sistem dapat berjalan dengan baik.

#### Acceptance Criteria

1. WHERE email verification diaktifkan, WHEN Requester selesai registrasi, THE Authentication_System SHALL mengirim email verifikasi
2. WHERE email verification diaktifkan, THE Authentication_System SHALL generate verification token untuk user
3. WHERE email verification diaktifkan, WHEN user klik link verifikasi dari email, THE Authentication_System SHALL memvalidasi token
4. WHERE email verification diaktifkan, WHEN token valid, THE Authentication_System SHALL update kolom `email_verified_at` di database
5. WHERE email verification diaktifkan, WHEN token valid, THE Authentication_System SHALL redirect ke dashboard dengan flash message "Email berhasil diverifikasi"
6. WHERE email verification diaktifkan, IF user belum verifikasi email, THEN THE Middleware SHALL membatasi akses ke fitur tertentu
7. WHERE email verification diaktifkan, THE Authentication_System SHALL menyediakan tombol "Kirim Ulang Email Verifikasi"
8. WHERE email verification tidak diaktifkan, THE Authentication_System SHALL set `email_verified_at` otomatis saat registrasi

### Requirement 10: Audit Trail untuk Authentication Events

**User Story:** Sebagai Admin, saya ingin melihat log aktivitas authentication, sehingga saya dapat tracking siapa yang login, logout, atau melakukan perubahan password.

#### Acceptance Criteria

1. THE Audit_Trail SHALL mencatat setiap login event dengan informasi: user_id, user_email, action 'login', ip_address, user_agent, timestamp
2. THE Audit_Trail SHALL mencatat setiap logout event dengan informasi: user_id, user_email, action 'logout', timestamp
3. THE Audit_Trail SHALL mencatat setiap registrasi event dengan informasi: user_id, user_email, action 'register', timestamp
4. THE Audit_Trail SHALL mencatat setiap password reset event dengan informasi: user_id, user_email, action 'password_reset', timestamp
5. THE Database_Migration SHALL membuat table `audit_logs` dengan kolom: id, user_id, user_email, action, ip_address, user_agent, metadata (JSON), timestamps
6. THE Audit_Trail SHALL menyimpan data dalam format yang mudah di-query untuk reporting
7. THE Audit_Trail SHALL tidak mencatat password atau data sensitif lainnya
8. WHERE email verification diaktifkan, THE Audit_Trail SHALL mencatat email verification event

### Requirement 11: UI Components untuk Authentication

**User Story:** Sebagai user, saya ingin interface yang clean dan mudah digunakan untuk login, register, dan reset password, sehingga saya dapat menggunakan aplikasi dengan nyaman.

#### Acceptance Criteria

1. THE React_Frontend SHALL menyediakan komponen LoginPage dengan form login
2. THE React_Frontend SHALL menyediakan komponen RegisterPage dengan form registrasi
3. THE React_Frontend SHALL menyediakan komponen ForgotPasswordPage dengan form forgot password
4. THE React_Frontend SHALL menyediakan komponen ResetPasswordPage dengan form reset password
5. THE React_Frontend SHALL menyediakan komponen GuestLayout untuk halaman authentication
6. THE React_Frontend SHALL menyediakan komponen AuthLayout untuk halaman setelah login
7. THE React_Frontend SHALL menampilkan error validation di bawah setiap input field yang error
8. THE React_Frontend SHALL menampilkan loading state saat form sedang disubmit
9. THE React_Frontend SHALL disable tombol submit saat form sedang diproses
10. THE React_Frontend SHALL menggunakan Tailwind CSS untuk styling dengan desain yang responsive
11. THE React_Frontend SHALL menyediakan komponen reusable untuk Input, Button, dan Label
12. WHERE email verification diaktifkan, THE React_Frontend SHALL menyediakan komponen VerifyEmailPage

### Requirement 12: Documentation dan Setup Instructions

**User Story:** Sebagai developer baru, saya ingin dokumentasi yang jelas tentang cara setup dan menjalankan project, sehingga saya dapat mulai development dengan cepat.

#### Acceptance Criteria

1. THE Laravel_Application SHALL menyediakan file README.md di root project
2. THE README.md SHALL berisi instruksi cara clone repository
3. THE README.md SHALL berisi instruksi cara menjalankan Docker containers
4. THE README.md SHALL berisi instruksi cara menjalankan database migration
5. THE README.md SHALL berisi instruksi cara menjalankan database seeder
6. THE README.md SHALL berisi instruksi cara build React assets
7. THE README.md SHALL berisi informasi kredensial Admin default untuk testing
8. THE README.md SHALL berisi informasi port yang digunakan (Laravel: 8000, MySQL: 3306)
9. THE README.md SHALL berisi troubleshooting untuk masalah umum
10. THE README.md SHALL berisi struktur folder project dengan penjelasan singkat
11. THE Laravel_Application SHALL menyediakan file .env.example dengan konfigurasi Docker
12. THE Laravel_Application SHALL menyediakan komentar Bahasa Indonesia di setiap file sesuai coding standards

### Requirement 13: Coding Standards Compliance

**User Story:** Sebagai developer, saya ingin kode yang mengikuti coding standards yang telah ditetapkan, sehingga kode mudah dibaca dan di-maintain oleh tim.

#### Acceptance Criteria

1. THE Laravel_Application SHALL menggunakan Form Request class untuk semua validasi form
2. THE Laravel_Application SHALL menggunakan Service atau Action class untuk logika bisnis kompleks
3. THE Laravel_Application SHALL menggunakan Policy class untuk authorization logic
4. THE Laravel_Application SHALL memiliki Controller yang tipis (hanya terima request dan delegasikan ke service)
5. THE Laravel_Application SHALL memiliki komentar Bahasa Indonesia di setiap file dan fungsi
6. THE React_Frontend SHALL memiliki komponen dengan maksimal 200 baris kode
7. THE React_Frontend SHALL memiliki komentar Bahasa Indonesia yang mendokumentasikan props di setiap komponen
8. THE React_Frontend SHALL menggunakan custom hooks untuk logika yang reusable
9. THE Laravel_Application SHALL menggunakan eager loading untuk hindari N+1 query problem
10. THE Laravel_Application SHALL menggunakan konstanta atau config untuk hardcoded values
11. THE React_Frontend SHALL memisahkan komponen UI primitif (Button, Input) ke folder `Components/ui/`
12. THE React_Frontend SHALL memisahkan komponen shared ke folder `Components/shared/`

## Notes

### MVP Scope
Untuk fase pertama ini, fokus adalah pada setup infrastruktur dan authentication system yang solid. Fitur-fitur berikut akan dikembangkan di fase selanjutnya:
- Approval workflow untuk surat ijin
- Upload dan storage file/foto surat
- Notifikasi untuk Admin saat ada surat masuk
- Dashboard analytics
- User management untuk Admin

### Email Configuration
Untuk development, email dapat menggunakan Mailtrap atau log driver. Untuk production, perlu konfigurasi SMTP yang proper.

### Security Considerations
- Password harus di-hash menggunakan bcrypt (default Laravel)
- Session harus menggunakan secure cookie di production
- CSRF protection harus aktif untuk semua form
- Rate limiting untuk login dan password reset untuk mencegah brute force attack

### Testing Strategy
Setelah implementation selesai, perlu dibuat:
- Unit tests untuk Service/Action classes
- Feature tests untuk authentication flows
- Browser tests untuk UI components (opsional)

### Performance Considerations
- Gunakan database indexing untuk kolom yang sering di-query (email, role)
- Gunakan eager loading untuk relationship
- Gunakan cache untuk data yang jarang berubah (opsional untuk MVP)
