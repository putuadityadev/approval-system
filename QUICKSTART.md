# Quick Start Guide

Panduan cepat untuk setup dan menjalankan Mall Approval System dalam 5 menit.

## ⚡ Prerequisites

- ✅ Docker Desktop installed dan running
- ✅ Git installed
- ✅ Terminal/Command Prompt

**Cek instalasi:**
```bash
docker --version
docker-compose --version
git --version
```

## 🚀 Setup (5 Menit)

### Option 1: Menggunakan Helper Script (Recommended)

#### Linux/Mac:
```bash
# 1. Clone repository
git clone <repository-url>
cd mall-approval-system

# 2. Buat script executable
chmod +x docker-helper.sh

# 3. Run setup (akan install semua dependencies dan setup database)
./docker-helper.sh setup

# 4. Akses aplikasi
# Browser: http://localhost:8000
# Login: admin@mall.com / password123
```

#### Windows (PowerShell):
```powershell
# 1. Clone repository
git clone <repository-url>
cd mall-approval-system

# 2. Run setup
.\docker-helper.ps1 setup

# 3. Akses aplikasi
# Browser: http://localhost:8000
# Login: admin@mall.com / password123
```

### Option 2: Manual Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd mall-approval-system

# 2. Copy environment file
cp .env.example .env

# 3. Start Docker containers
docker-compose up -d

# 4. Wait for MySQL to be ready (10 seconds)
sleep 10

# 5. Install Composer dependencies
docker-compose exec app composer install

# 6. Generate application key
docker-compose exec app php artisan key:generate

# 7. Run migrations
docker-compose exec app php artisan migrate

# 8. Seed database
docker-compose exec app php artisan db:seed

# 9. Install NPM dependencies
docker-compose exec node npm install

# 10. Build frontend assets
docker-compose exec node npm run build

# 11. Akses aplikasi
# Browser: http://localhost:8000
# Login: admin@mall.com / password123
```

## 🎯 Daily Development Workflow

### Start Development

```bash
# Start containers
docker-compose up -d

# Start Vite dev server (hot reload)
docker-compose exec node npm run dev
```

Atau dengan helper script:
```bash
./docker-helper.sh start
./docker-helper.sh npm run dev
```

### Stop Development

```bash
# Stop containers
docker-compose down
```

Atau dengan helper script:
```bash
./docker-helper.sh stop
```

## 📝 Common Commands

### Laravel Artisan

```bash
# Manual
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
docker-compose exec app php artisan cache:clear

# Dengan helper script
./docker-helper.sh artisan migrate
./docker-helper.sh artisan db:seed
./docker-helper.sh clear-cache
```

### Composer

```bash
# Manual
docker-compose exec app composer install
docker-compose exec app composer require package/name

# Dengan helper script
./docker-helper.sh composer install
./docker-helper.sh composer require package/name
```

### NPM

```bash
# Manual
docker-compose exec node npm install
docker-compose exec node npm run dev
docker-compose exec node npm run build

# Dengan helper script
./docker-helper.sh npm install
./docker-helper.sh npm run dev
./docker-helper.sh npm run build
```

### View Logs

```bash
# Manual
docker-compose logs -f app
docker-compose logs -f db

# Dengan helper script
./docker-helper.sh logs app
./docker-helper.sh logs db
```

## 🔧 Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution**: Edit `docker-compose.yml` dan ubah port:
```yaml
ports:
  - "8001:8000"  # Ubah 8000 ke 8001
```

### Database Connection Error

**Error**: `SQLSTATE[HY000] [2002] Connection refused`

**Solution**: 
1. Tunggu 10-15 detik setelah start containers
2. Verify `.env` file:
   ```env
   DB_HOST=db  # Harus 'db', bukan 'localhost'
   ```
3. Restart containers:
   ```bash
   docker-compose restart
   ```

### Permission Denied

**Error**: `Permission denied` di folder storage

**Solution**:
```bash
docker-compose exec app chmod -R 777 storage bootstrap/cache
```

### Container Keeps Restarting

**Solution**:
```bash
# Check logs untuk error
docker-compose logs app

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🧪 Testing

```bash
# Run all tests
docker-compose exec app php artisan test

# Run specific test
docker-compose exec app php artisan test --filter=LoginTest

# Dengan helper script
./docker-helper.sh test
./docker-helper.sh test --filter=LoginTest
```

## 🔄 Reset Database

```bash
# Fresh migration (reset database)
docker-compose exec app php artisan migrate:fresh --seed

# Dengan helper script
./docker-helper.sh fresh
```

## 📚 Next Steps

Setelah setup berhasil:

1. ✅ Baca [README.md](README.md) untuk dokumentasi lengkap
2. ✅ Baca [DOCKER.md](DOCKER.md) untuk detail Docker setup
3. ✅ Baca `rules_coding.md` untuk coding standards
4. ✅ Explore struktur project di folder `app/` dan `resources/js/`
5. ✅ Mulai development! 🚀

## 🆘 Need Help?

- Check [README.md](README.md) untuk dokumentasi lengkap
- Check [DOCKER.md](DOCKER.md) untuk troubleshooting Docker
- Check logs: `docker-compose logs -f`
- Hubungi tim development

---

**Happy Coding! 🎉**
