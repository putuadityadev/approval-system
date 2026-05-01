# Testing Guide - Sistem Autentikasi Baru

## ✅ Status: Ready for Testing

Sistem autentikasi dengan 7 roles sudah selesai dan siap ditest!

## ⚠️ PENTING: Clear Cache Sebelum Testing

**Sebelum mulai testing, WAJIB clear cache:**

1. **Clear Browser Cache:**
   - Chrome/Edge: `Ctrl + Shift + Delete` → Clear "Cached images and files"
   - Firefox: `Ctrl + Shift + Delete` → Clear "Cache"
   - **ATAU gunakan Incognito/Private window**

2. **Clear Laravel Cache:**
   ```bash
   docker exec -it laravel_app php artisan optimize:clear
   ```

3. **Hard Refresh:** Tekan `Ctrl + F5` di browser

## 🔑 Credentials untuk Testing

### Super Admin (sudah ada di database)
- **Email:** `superadmin@mall.com`
- **Password:** `SuperAdmin123!`

## 🧪 Skenario Testing

### 1. Test Login Super Admin
1. Buka browser: `http://localhost:8000`
2. Login dengan credentials Super Admin di atas
3. ✅ Seharusnya redirect ke `/admin/dashboard`
4. ✅ Seharusnya melihat "Dashboard Super Admin" dengan menu "Kelola Users"

### 2. Test Create User (Approver)
1. Dari dashboard Super Admin, klik "Kelola Users"
2. Klik tombol "+ Tambah User"
3. Isi form:
   - Email: `approver.dept@mall.com`
   - Password: `Password123!`
   - Konfirmasi Password: `Password123!`
   - Role: Pilih "Approver Department"
4. Klik "Simpan"
5. ✅ Seharusnya redirect ke list users dengan flash message "User berhasil dibuat"
6. ✅ User baru muncul di tabel

### 3. Test Create User (Security)
1. Dari list users, klik "+ Tambah User"
2. Isi form:
   - Email: `security@mall.com`
   - Password: `Password123!`
   - Konfirmasi Password: `Password123!`
   - Role: Pilih "Security"
3. Klik "Simpan"
4. ✅ User security berhasil dibuat

### 4. Test Edit User
1. Dari list users, klik tombol "Edit" pada salah satu user
2. Ubah email atau role
3. Klik "Simpan Perubahan"
4. ✅ Seharusnya redirect ke list users dengan flash message "User berhasil diupdate"

### 5. Test Deactivate User
1. Dari list users, klik tombol "Nonaktifkan" pada salah satu user
2. Konfirmasi dialog
3. ✅ Status user berubah menjadi "Nonaktif" (badge merah)
4. ✅ Tombol berubah menjadi "Aktifkan"

### 6. Test Login dengan User yang Dinonaktifkan
1. Logout dari Super Admin
2. Coba login dengan user yang sudah dinonaktifkan
3. ✅ Seharusnya muncul error: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator."

### 7. Test Activate User
1. Login kembali sebagai Super Admin
2. Dari list users, klik tombol "Aktifkan" pada user yang tadi dinonaktifkan
3. ✅ Status user berubah menjadi "Aktif" (badge hijau)

### 8. Test Registrasi Vendor
1. Logout dari Super Admin
2. Dari halaman login, klik "Daftar"
3. Isi form registrasi vendor:
   - **Data Akun:**
     - Email: `vendor1@perusahaan.com`
     - Password: `Password123!`
     - Konfirmasi Password: `Password123!`
   - **Data Perusahaan:**
     - Nama Perusahaan: `PT. Contoh Vendor`
     - Nama PIC: `Budi Santoso`
     - Nomor Telepon PIC: `08123456789`
     - Alamat Perusahaan: `Jl. Contoh No. 123, Jakarta`
4. Klik "Daftar"
5. ✅ Seharusnya otomatis login dan redirect ke `/vendor/dashboard`
6. ✅ Seharusnya melihat "Dashboard Vendor" dengan informasi perusahaan

### 9. Test Login Approver
1. Logout dari Vendor
2. Login dengan credentials Approver yang dibuat di step 2:
   - Email: `approver.dept@mall.com`
   - Password: `Password123!`
3. ✅ Seharusnya redirect ke `/approver/dashboard`
4. ✅ Seharusnya melihat "Dashboard Approval - Department"

### 10. Test Login Security
1. Logout dari Approver
2. Login dengan credentials Security yang dibuat di step 3:
   - Email: `security@mall.com`
   - Password: `Password123!`
3. ✅ Seharusnya redirect ke `/security/dashboard`
4. ✅ Seharusnya melihat "Dashboard Security"

### 11. Test Logout
1. Dari dashboard manapun, klik tombol "Logout"
2. ✅ Seharusnya redirect ke halaman login dengan flash message "Anda berhasil logout"

## 🐛 Troubleshooting

### Error: Route not defined
**Solusi:** Clear cache Laravel
```bash
docker exec -it laravel_app php artisan optimize:clear
```

### Error: SQLSTATE connection refused
**Solusi:** Pastikan Docker containers sudah running
```bash
docker-compose up -d
```

### Error: Class not found
**Solusi:** Regenerate autoload
```bash
docker exec -it laravel_app composer dump-autoload
```

### Halaman blank atau error 500
**Solusi:** Cek log Laravel
```bash
docker exec -it laravel_app tail -f storage/logs/laravel.log
```

## 📊 Checklist Testing

- [ ] Login Super Admin berhasil
- [ ] Create user Approver berhasil
- [ ] Create user Security berhasil
- [ ] Edit user berhasil
- [ ] Deactivate user berhasil
- [ ] Login dengan user nonaktif ditolak
- [ ] Activate user berhasil
- [ ] Registrasi vendor berhasil
- [ ] Login Approver redirect ke dashboard yang benar
- [ ] Login Security redirect ke dashboard yang benar
- [ ] Logout berhasil dari semua role

## 🎯 Next Steps Setelah Testing Berhasil

1. **Approval Workflow** - Implementasi multi-level approval
2. **Document Management** - Upload dan manage surat
3. **QR Code** - Generate dan scan QR code
4. **Notifications** - Email notification untuk approval
5. **Reports** - Dashboard analytics

---

**Catatan:** Semua dashboard selain Super Admin masih placeholder. Fitur lengkap akan dikembangkan setelah testing autentikasi berhasil.
