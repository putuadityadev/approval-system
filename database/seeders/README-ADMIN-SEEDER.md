# Admin Seeder - Dokumentasi

## Deskripsi

AdminSeeder membuat akun admin default untuk testing dan initial setup aplikasi.

## Kredensial Admin Default

- **Email**: `admin@mall.com`
- **Password**: `password123`
- **Role**: `admin`
- **Email Verified**: `true` (sudah terverifikasi)

## Cara Menjalankan

### Menggunakan Docker (Recommended)

```bash
# Jika Docker sudah running
docker-compose exec app php artisan db:seed --class=AdminSeeder

# Atau jalankan semua seeder (termasuk AdminSeeder)
docker-compose exec app php artisan db:seed

# Atau menggunakan helper script
./docker-helper.sh artisan db:seed
```

### Tanpa Docker (PHP lokal)

```bash
# Jalankan hanya AdminSeeder
php artisan db:seed --class=AdminSeeder

# Atau jalankan semua seeder
php artisan db:seed
```

### Fresh Migration + Seed

```bash
# Dengan Docker
docker-compose exec app php artisan migrate:fresh --seed

# Atau menggunakan helper script
./docker-helper.sh fresh

# Tanpa Docker
php artisan migrate:fresh --seed
```

## Fitur

- **Idempotent**: Seeder akan mengecek apakah admin sudah ada sebelum membuat yang baru
- **Safe**: Tidak akan membuat duplikat admin jika sudah ada
- **Informative**: Menampilkan pesan sukses atau skip jika admin sudah ada

## File yang Dimodifikasi

1. **database/seeders/AdminSeeder.php** - Seeder baru untuk admin
2. **database/seeders/DatabaseSeeder.php** - Updated untuk memanggil AdminSeeder
3. **app/Models/User.php** - Updated fillable untuk include 'role' dan 'email_verified_at'

## Testing

Setelah menjalankan seeder, Anda bisa login dengan kredensial di atas untuk mengakses admin dashboard.

## Keamanan

⚠️ **PENTING**: Untuk production, pastikan untuk:
1. Mengganti password default `password123` dengan password yang kuat
2. Mengganti email `admin@mall.com` dengan email admin yang sebenarnya
3. Atau hapus seeder ini dan buat admin secara manual melalui tinker atau command khusus
