# Mall Approval System - Authentication Module

Sistem approval surat ijin mall di Bali dengan authentication system yang robust menggunakan Laravel 11 + Inertia.js + React (JavaScript/JSX).

## 🎯 Fitur Utama (Fase 1 - Authentication)

- ✅ User Registration untuk Requester (self-registration)
- ✅ User Login dengan role-based access (Admin & Requester)
- ✅ Password Reset via email
- ✅ Role-Based Access Control (RBAC)
- ✅ Audit Trail untuk tracking aktivitas authentication
- ✅ Docker environment untuk development yang konsisten

## 🛠️ Tech Stack

- **Backend**: Laravel 11 (PHP 8.2+)
- **Frontend**: React 18 + Inertia.js (JavaScript/JSX)
- **Styling**: Tailwind CSS
- **Database**: MySQL 8.0
- **Containerization**: Docker + Docker Compose
- **Build Tool**: Vite

## 📋 Prerequisites

Sebelum memulai, pastikan sudah terinstall:

- [Docker](https://docs.docker.com/get-docker/) (versi 20.10 atau lebih baru)
- [Docker Compose](https://docs.docker.com/compose/install/) (versi 2.0 atau lebih baru)
- [Git](https://git-scm.com/downloads)

**Tidak perlu install:**
- ❌ PHP (sudah ada di Docker container)
- ❌ Composer (sudah ada di Docker container)
- ❌ Node.js (sudah ada di Docker container)
- ❌ MySQL (sudah ada di Docker container)

## 🚀 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd mall-approval-system
```

### 2. Setup Environment File

```bash
cp .env.example .env
```

Edit file `.env` jika perlu mengubah konfigurasi database atau port. Default configuration sudah siap digunakan untuk development.

### 3. Start Docker Containers

```bash
docker-compose up -d
```

Perintah ini akan:
- Build Docker image untuk Laravel app
- Download MySQL 8.0 image
- Download Node.js 20 image
- Membuat network internal untuk komunikasi antar containers
- Membuat volume persistence untuk MySQL data
- Start semua services

**Catatan**: Build pertama kali akan memakan waktu beberapa menit karena download images dan install dependencies.

### 4. Install Laravel Dependencies

```bash
docker-compose exec app composer install
```

### 5. Generate Application Key

```bash
docker-compose exec app php artisan key:generate
```

### 6. Run Database Migrations

```bash
docker-compose exec app php artisan migrate
```

### 7. Seed Database dengan Data Awal

```bash
docker-compose exec app php artisan db:seed
```

Ini akan membuat:
- 1 akun Admin default (email: `admin@mall.com`, password: `password123`)

### 8. Install Frontend Dependencies

```bash
docker-compose exec node npm install
```

### 9. Build Frontend Assets

Untuk development dengan hot reload:

```bash
docker-compose exec node npm run dev
```

Atau untuk production build:

```bash
docker-compose exec node npm run build
```

## 🌐 Access Application

Setelah semua container running:

- **Laravel Application**: http://localhost:8000
- **MySQL Database**: localhost:3306
- **Vite Dev Server**: http://localhost:5173 (internal, proxied melalui Laravel)

## 🔑 Default Credentials

### Admin Account
- **Email**: admin@mall.com
- **Password**: password123

### Requester Account
Requester dapat mendaftar sendiri melalui halaman registrasi di aplikasi.

## 🐳 Docker Commands

### Start Containers

```bash
docker-compose up -d
```

### Stop Containers

```bash
docker-compose down
```

### View Logs

```bash
# Semua containers
docker-compose logs -f

# Specific container
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f node
```

### Restart Containers

```bash
docker-compose restart
```

### Rebuild Containers

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands in Container

```bash
# Laravel commands
docker-compose exec app php artisan <command>

# Composer commands
docker-compose exec app composer <command>

# NPM commands
docker-compose exec node npm <command>

# MySQL commands
docker-compose exec db mysql -u mall_user -p mall_approval
```

## 🧪 Testing

### Run PHPUnit Tests

```bash
docker-compose exec app php artisan test
```

### Run Vitest Tests (Frontend)

```bash
docker-compose exec node npm run test
```

### Run Specific Test

```bash
docker-compose exec app php artisan test --filter=LoginTest
```

## 🔧 Troubleshooting

### Permission Issues

Jika mengalami permission error pada folder `storage` atau `bootstrap/cache`:

```bash
docker-compose exec app chmod -R 777 storage bootstrap/cache
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Clear Cache

```bash
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear
```

### Database Connection Error

1. Pastikan container `db` sudah running:
   ```bash
   docker-compose ps
   ```

2. Check logs database container:
   ```bash
   docker-compose logs db
   ```

3. Verify environment variables di `.env`:
   ```
   DB_HOST=db
   DB_PORT=3306
   DB_DATABASE=mall_approval
   DB_USERNAME=mall_user
   DB_PASSWORD=secret123
   ```

### Port Already in Use

Jika port 8000, 3306, atau 5173 sudah digunakan, edit `docker-compose.yml` dan ubah port mapping:

```yaml
ports:
  - "8001:8000"  # Ubah 8000 ke 8001 untuk Laravel
  - "3307:3306"  # Ubah 3306 ke 3307 untuk MySQL
  - "5174:5173"  # Ubah 5173 ke 5174 untuk Vite
```

### Container Won't Start

```bash
# Stop semua containers
docker-compose down

# Remove volumes (HATI-HATI: ini akan menghapus data database)
docker-compose down -v

# Rebuild dan start ulang
docker-compose build --no-cache
docker-compose up -d
```

### Node Modules Issues

```bash
# Hapus node_modules dan reinstall
docker-compose exec node rm -rf node_modules
docker-compose exec node npm install
```

## 📁 Project Structure

```
mall-approval-system/
├── app/
│   ├── Actions/              # Single-purpose action classes
│   ├── Http/
│   │   ├── Controllers/      # Thin controllers (delegasi ke service/action)
│   │   ├── Middleware/       # Custom middleware
│   │   └── Requests/         # Form validation classes
│   ├── Models/               # Eloquent models
│   ├── Policies/             # Authorization policies
│   └── Services/             # Business logic services
├── database/
│   ├── migrations/           # Database schema migrations
│   ├── seeders/              # Database seeders
│   └── factories/            # Model factories untuk testing
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── ui/           # Primitive UI components (Button, Input, dll)
│   │   │   └── shared/       # Shared components
│   │   ├── Layouts/          # Layout components (Guest, Authenticated)
│   │   ├── Pages/            # Inertia pages (satu file per route)
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Helper functions
│   └── views/
│       └── app.blade.php     # Root template untuk Inertia
├── routes/
│   └── web.php               # Web routes
├── docker-compose.yml        # Docker services configuration
├── Dockerfile                # Laravel app container definition
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 📝 Coding Standards

Project ini mengikuti coding standards yang ketat untuk maintainability:

### PHP (Laravel)

- ✅ **Controller tipis**: Hanya terima request dan delegasikan ke Service/Action
- ✅ **Form Request**: Semua validasi di Form Request class, bukan di controller
- ✅ **Service Layer**: Business logic kompleks di Service class
- ✅ **Policy**: Authorization logic di Policy class
- ✅ **Komentar Bahasa Indonesia**: Setiap file dan fungsi wajib ada komentar penjelasan

### JavaScript (React)

- ✅ **Komponen kecil**: Maksimal 200 baris per komponen
- ✅ **Props documentation**: Props didokumentasikan di komentar atas komponen
- ✅ **Custom hooks**: Logika reusable di custom hooks
- ✅ **Separation of concerns**: UI primitif di `Components/ui/`, shared di `Components/shared/`
- ✅ **Komentar Bahasa Indonesia**: Setiap komponen dan fungsi wajib ada komentar

Untuk detail lengkap, lihat file `rules_coding.md`.

## 🔐 Security

- ✅ Password di-hash dengan bcrypt
- ✅ CSRF protection aktif untuk semua form
- ✅ Rate limiting untuk login dan password reset
- ✅ Session menggunakan secure cookie di production
- ✅ SQL injection prevention dengan Eloquent ORM
- ✅ XSS prevention dengan React auto-escaping

## 📊 Database Schema

### Users Table
- id, name, email (unique), password, role (enum: admin/requester)
- email_verified_at, remember_token, timestamps

### Audit Logs Table
- id, user_id, user_email, action, ip_address, user_agent
- metadata (JSON), timestamps

### Password Reset Tokens Table
- email (primary), token, created_at

### Sessions Table
- id, user_id, ip_address, user_agent, payload, last_activity

## 🚧 Roadmap (Fase Berikutnya)

- [ ] Approval workflow untuk surat ijin (Loading In, Loading Out, Ijin Kerja)
- [ ] File upload dan storage (Cloudflare R2 integration)
- [ ] Notifikasi real-time untuk Admin
- [ ] Dashboard analytics dan reporting
- [ ] User management UI untuk Admin (CRUD users)

## 📄 License

Proprietary - Mall Approval System

## 🤝 Contributing

Untuk berkontribusi ke project ini:

1. Baca `rules_coding.md` untuk coding standards
2. Buat branch baru dari `main`
3. Commit dengan message yang deskriptif
4. Push ke branch dan buat Pull Request
5. Tunggu code review dari tim

## 📞 Support

Jika mengalami masalah atau ada pertanyaan:

1. Check section Troubleshooting di atas
2. Check logs container: `docker-compose logs -f`
3. Hubungi tim development

---

**Happy Coding! 🚀**
