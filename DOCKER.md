# Docker Setup Documentation

Dokumentasi lengkap tentang Docker environment untuk Mall Approval System.

## 📦 Container Architecture

Sistem ini menggunakan 3 container utama yang saling terhubung:

### 1. App Container (Laravel)
- **Base Image**: `php:8.2-fpm`
- **Purpose**: Menjalankan Laravel application
- **Port**: 8000 (exposed ke host)
- **Volume**: `./:/var/www/html` (bind mount untuk development)
- **Dependencies**: MySQL container harus running terlebih dahulu

**PHP Extensions yang terinstall:**
- pdo_mysql (untuk koneksi MySQL)
- mbstring (untuk string handling)
- exif (untuk image metadata)
- pcntl (untuk process control)
- bcmath (untuk arbitrary precision mathematics)
- gd (untuk image processing)

**Additional Tools:**
- Composer (latest version)
- Git
- Nginx (untuk production deployment)

### 2. Database Container (MySQL)
- **Base Image**: `mysql:8.0`
- **Purpose**: Database server
- **Port**: 3306 (exposed ke host untuk debugging)
- **Volume**: `mysql_data` (named volume untuk persistence)
- **Environment Variables**:
  - `MYSQL_DATABASE`: mall_approval
  - `MYSQL_USER`: mall_user
  - `MYSQL_PASSWORD`: secret123
  - `MYSQL_ROOT_PASSWORD`: secret123

**Data Persistence:**
Data MySQL disimpan di named volume `mysql_data`, sehingga data tidak hilang ketika container dihapus atau direstart.

### 3. Node Container (Vite Dev Server)
- **Base Image**: `node:20-alpine`
- **Purpose**: Build dan serve React assets dengan hot reload
- **Port**: 5173 (internal, proxied melalui Laravel)
- **Volume**: `./:/var/www/html` (shared dengan app container)
- **Command**: `npm run dev -- --host`

**Hot Module Replacement (HMR):**
Vite dev server menyediakan hot reload untuk React components, sehingga perubahan kode langsung terlihat tanpa refresh browser.

## 🌐 Network Architecture

Semua container terhubung melalui custom bridge network `laravel_network`:

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Host                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         laravel_network (bridge)                 │  │
│  │                                                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │   app    │  │    db    │  │   node   │     │  │
│  │  │  :8000   │  │  :3306   │  │  :5173   │     │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘     │  │
│  │       │             │             │            │  │
│  └───────┼─────────────┼─────────────┼────────────┘  │
│          │             │             │                │
│     localhost:8000  localhost:3306  localhost:5173   │
└─────────────────────────────────────────────────────────┘
```

**Komunikasi Internal:**
- App container dapat akses database dengan hostname `db`
- Node container dapat akses app container dengan hostname `app`
- Semua container dapat saling berkomunikasi melalui network internal

**Port Mapping:**
- `8000:8000` - Laravel application
- `3306:3306` - MySQL database (untuk debugging dengan MySQL client)
- `5173:5173` - Vite dev server (optional, biasanya proxied melalui Laravel)

## 📁 Volume Management

### Named Volume: mysql_data

```yaml
volumes:
  mysql_data:
    driver: local
```

**Purpose**: Menyimpan data MySQL secara persistent

**Location**: 
- Linux/Mac: `/var/lib/docker/volumes/mysql_data/_data`
- Windows: `\\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes\mysql_data\_data`

**Commands:**
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect mysql_data

# Remove volume (HATI-HATI: akan menghapus semua data database)
docker volume rm mysql_data

# Backup volume
docker run --rm -v mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql_backup.tar.gz -C /data
```

### Bind Mount: ./:/var/www/html

**Purpose**: Mount source code dari host ke container untuk development

**Behavior**:
- Perubahan di host langsung terlihat di container
- Perubahan di container langsung terlihat di host
- Cocok untuk development, tidak untuk production

**Excluded Files** (via .dockerignore):
- `.git/`
- `node_modules/`
- `vendor/`
- `storage/logs/*`
- `.env`

## 🔧 Environment Variables

Environment variables dapat dikonfigurasi di beberapa tempat:

### 1. .env File (Laravel)

```env
DB_HOST=db              # Hostname container database
DB_PORT=3306            # Port MySQL
DB_DATABASE=mall_approval
DB_USERNAME=mall_user
DB_PASSWORD=secret123
```

**Note**: `DB_HOST=db` menggunakan hostname container, bukan `localhost`

### 2. docker-compose.yml

```yaml
environment:
  - DB_HOST=db
  - DB_PORT=3306
  - DB_DATABASE=${DB_DATABASE:-mall_approval}
  - DB_USERNAME=${DB_USERNAME:-mall_user}
  - DB_PASSWORD=${DB_PASSWORD:-secret123}
```

**Syntax**: `${VARIABLE:-default}` artinya gunakan value dari environment variable, atau default jika tidak ada.

### 3. docker-compose.override.yml (Optional)

File ini tidak di-commit ke git dan bisa digunakan untuk override konfigurasi local:

```yaml
version: '3.8'

services:
  app:
    environment:
      - APP_DEBUG=true
      - LOG_LEVEL=debug
```

## 🚀 Docker Commands Reference

### Container Management

```bash
# Start containers (detached mode)
docker-compose up -d

# Start containers (foreground, dengan logs)
docker-compose up

# Stop containers
docker-compose down

# Stop dan remove volumes (HATI-HATI: menghapus data)
docker-compose down -v

# Restart containers
docker-compose restart

# Restart specific container
docker-compose restart app

# Stop specific container
docker-compose stop app

# Start specific container
docker-compose start app
```

### Logs & Monitoring

```bash
# View logs semua containers
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# Logs specific container
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f node

# Last 100 lines
docker-compose logs --tail=100 app

# Logs dengan timestamp
docker-compose logs -t app
```

### Container Status

```bash
# List running containers
docker-compose ps

# List all containers (including stopped)
docker-compose ps -a

# Container stats (CPU, memory usage)
docker stats

# Inspect container
docker inspect laravel_app
```

### Execute Commands in Container

```bash
# Execute command (interactive)
docker-compose exec app bash
docker-compose exec db mysql -u mall_user -p

# Execute command (non-interactive)
docker-compose exec -T app php artisan migrate

# Execute as specific user
docker-compose exec -u www-data app php artisan cache:clear
```

### Build & Rebuild

```bash
# Build images
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build app

# Rebuild dan restart
docker-compose up -d --build
```

### Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (HATI-HATI)
docker system prune -a --volumes
```

## 🐛 Troubleshooting

### Container Won't Start

**Symptom**: Container exit immediately setelah start

**Diagnosis**:
```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps
```

**Common Causes**:
1. Port already in use
2. Syntax error di docker-compose.yml
3. Missing dependencies
4. Permission issues

**Solutions**:
```bash
# Change port di docker-compose.yml
ports:
  - "8001:8000"  # Ubah dari 8000 ke 8001

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Error

**Symptom**: `SQLSTATE[HY000] [2002] Connection refused`

**Diagnosis**:
```bash
# Check if db container is running
docker-compose ps db

# Check db logs
docker-compose logs db

# Test connection from app container
docker-compose exec app ping db
```

**Common Causes**:
1. DB container belum ready (butuh waktu ~10 detik setelah start)
2. Wrong credentials di .env
3. DB_HOST bukan `db` tapi `localhost`

**Solutions**:
```bash
# Wait for db to be ready
sleep 10

# Verify .env
DB_HOST=db  # Bukan localhost!
DB_PORT=3306
DB_DATABASE=mall_approval
DB_USERNAME=mall_user
DB_PASSWORD=secret123

# Restart containers
docker-compose restart
```

### Permission Denied

**Symptom**: `Permission denied` saat akses storage atau cache

**Diagnosis**:
```bash
# Check file permissions
docker-compose exec app ls -la storage/

# Check owner
docker-compose exec app stat storage/
```

**Solutions**:
```bash
# Fix permissions
docker-compose exec app chmod -R 777 storage bootstrap/cache
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache

# Or rebuild with correct permissions
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use

**Symptom**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Diagnosis**:
```bash
# Check what's using the port (Linux/Mac)
lsof -i :8000

# Check what's using the port (Windows)
netstat -ano | findstr :8000
```

**Solutions**:
```bash
# Option 1: Kill process using the port
kill -9 <PID>

# Option 2: Change port di docker-compose.yml
ports:
  - "8001:8000"

# Option 3: Use docker-compose.override.yml
# (lihat section Environment Variables)
```

### Composer/NPM Install Fails

**Symptom**: `composer install` atau `npm install` error

**Diagnosis**:
```bash
# Check logs
docker-compose logs app
docker-compose logs node

# Check disk space
docker system df
```

**Solutions**:
```bash
# Clear composer cache
docker-compose exec app composer clear-cache

# Clear npm cache
docker-compose exec node npm cache clean --force

# Remove and reinstall
docker-compose exec app rm -rf vendor
docker-compose exec app composer install

docker-compose exec node rm -rf node_modules
docker-compose exec node npm install
```

### Container Keeps Restarting

**Symptom**: Container status `Restarting`

**Diagnosis**:
```bash
# Check logs
docker-compose logs app

# Check exit code
docker-compose ps
```

**Common Causes**:
1. Application error (syntax error, missing dependency)
2. Command in Dockerfile fails
3. Health check fails

**Solutions**:
```bash
# Disable restart policy temporarily
docker-compose up --no-start
docker-compose start app

# Check logs for error
docker-compose logs app

# Fix error dan rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Security Best Practices

### Development Environment

1. **Don't expose MySQL port di production**
   ```yaml
   # Development: OK
   ports:
     - "3306:3306"
   
   # Production: Remove port mapping
   # ports:
   #   - "3306:3306"
   ```

2. **Use strong passwords**
   ```env
   # Development: OK
   DB_PASSWORD=secret123
   
   # Production: Use strong password
   DB_PASSWORD=Str0ng!P@ssw0rd#2024
   ```

3. **Don't commit .env file**
   ```bash
   # .gitignore
   .env
   .env.backup
   ```

4. **Use secrets untuk production**
   ```yaml
   # docker-compose.prod.yml
   services:
     db:
       environment:
         MYSQL_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
       secrets:
         - db_root_password
   
   secrets:
     db_root_password:
       external: true
   ```

### Production Environment

1. **Use multi-stage build**
2. **Run as non-root user**
3. **Use read-only filesystem where possible**
4. **Scan images for vulnerabilities**
5. **Use specific image tags, not `latest`**

## 📊 Performance Optimization

### Development

```yaml
# docker-compose.yml
services:
  app:
    # Use delegated consistency untuk better performance di Mac
    volumes:
      - ./:/var/www/html:delegated
```

### Production

```dockerfile
# Dockerfile.prod
FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    git curl libpng-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql opcache

# Copy opcache config
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Copy application
COPY . /var/www/html

# Install dependencies (production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data /var/www/html
```

## 🔄 Backup & Restore

### Database Backup

```bash
# Backup database
docker-compose exec db mysqldump -u mall_user -psecret123 mall_approval > backup.sql

# Backup dengan timestamp
docker-compose exec db mysqldump -u mall_user -psecret123 mall_approval > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup semua databases
docker-compose exec db mysqldump -u root -psecret123 --all-databases > backup_all.sql
```

### Database Restore

```bash
# Restore database
docker-compose exec -T db mysql -u mall_user -psecret123 mall_approval < backup.sql

# Restore dengan progress
pv backup.sql | docker-compose exec -T db mysql -u mall_user -psecret123 mall_approval
```

### Volume Backup

```bash
# Backup volume
docker run --rm \
  -v mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mysql_backup.tar.gz -C /data .

# Restore volume
docker run --rm \
  -v mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mysql_backup.tar.gz -C /data
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Docker Best Practices](https://laravel.com/docs/11.x/deployment#docker)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [PHP Docker Hub](https://hub.docker.com/_/php)

---

**Last Updated**: 2024-01-XX
