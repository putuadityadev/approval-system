# Testing Credentials - Mall Approval System

## 🔐 Kredensial untuk Testing

Berikut adalah kredensial default untuk testing semua role dalam sistem:

### Super Admin
```
Email: superadmin@mall.com
Password: SuperAdmin123!
Dashboard: /admin/dashboard
```

**Akses:**
- Manage semua user (CRUD)
- Activate/deactivate user
- View audit logs
- Full system access

---

### Approver Departemen
```
Email: approverdept@mall.com
Password: Approver123!
Dashboard: /approver/dashboard
```

**Akses:**
- Approve/reject surat level 1 (Departemen)
- View surat yang perlu di-approve
- Add notes/comments
- View history approval

---

### Approver Operasional
```
Email: approverops@mall.com
Password: Approver123!
Dashboard: /approver/dashboard
```

**Akses:**
- Approve/reject surat level 2 (Operasional)
- View surat yang perlu di-approve
- Add notes/comments
- View history approval

---

### Approver Finance
```
Email: approverfinance@mall.com
Password: Approver123!
Dashboard: /approver/dashboard
```

**Akses:**
- Approve/reject surat level 3 (Finance)
- View surat yang perlu di-approve
- Add notes/comments
- View history approval

---

### Approver GM Operation
```
Email: approvergm@mall.com
Password: Approver123!
Dashboard: /approver/dashboard
```

**Akses:**
- Approve/reject surat level 4 (GM Operation)
- View surat yang perlu di-approve
- Add notes/comments
- View history approval

---

### Security
```
Email: security@mall.com
Password: Security123!
Dashboard: /security/dashboard
```

**Akses:**
- Scan QR code surat
- Verifikasi lapangan
- Record status masuk/keluar vendor
- View history scan

---

## 🧪 Skenario Testing

### Test 1: Login dengan Setiap Role
1. Logout dari akun yang sedang login
2. Login dengan salah satu kredensial di atas
3. Verifikasi redirect ke dashboard yang sesuai
4. Verifikasi menu navigasi sesuai role

### Test 2: Role-Based Access Control
1. Login sebagai Approver
2. Coba akses `/admin/dashboard` (harus 403 Forbidden)
3. Coba akses `/vendor/dashboard` (harus 403 Forbidden)
4. Akses `/approver/dashboard` (harus 200 OK)

### Test 3: Active Status Check
1. Login sebagai Super Admin
2. Nonaktifkan salah satu user approver
3. Logout
4. Login dengan user approver yang dinonaktifkan
5. Harus mendapat error "Akun Anda telah dinonaktifkan"

### Test 4: Session Persistence
1. Login dengan salah satu role
2. Refresh halaman
3. Verifikasi tetap login dan tidak redirect ke login page

---

## 🔧 Troubleshooting

### Jika Login Gagal
1. Clear browser cache dan cookies
2. Clear Laravel cache:
   ```bash
   docker exec laravel_app php artisan optimize:clear
   ```
3. Restart container:
   ```bash
   docker-compose restart
   ```

### Jika Mendapat 403 Forbidden
1. Verifikasi user aktif di database
2. Verifikasi role user sesuai dengan route yang diakses
3. Clear Laravel cache
4. Cek Laravel log:
   ```bash
   docker exec laravel_app tail -f storage/logs/laravel.log
   ```

### Jika Lupa Password
Reset password via Tinker:
```bash
docker exec -it laravel_app php artisan tinker
```

```php
$user = User::where('email', 'approverdept@mall.com')->first();
$user->password = Hash::make('NewPassword123!');
$user->save();
exit
```

---

## 📝 Catatan Penting

⚠️ **SECURITY WARNING:**
- Kredensial ini hanya untuk development dan testing
- **JANGAN** gunakan password ini di production
- Ganti semua password setelah deployment
- Gunakan password yang kuat dan unik untuk setiap user

⚠️ **USER LAMA:**
- User dengan email `@gmail.com` (ID 2-6) adalah user lama yang dibuat manual
- User dengan email `@mall.com` (ID 7-11) adalah user baru dari seeder
- Gunakan user baru (`@mall.com`) untuk testing karena password-nya jelas

---

## 🚀 Quick Start Testing

1. **Clear cache:**
   ```bash
   docker exec laravel_app php artisan optimize:clear
   ```

2. **Akses aplikasi:**
   ```
   http://localhost:8000
   ```

3. **Login dengan Approver Finance:**
   ```
   Email: approverfinance@mall.com
   Password: Approver123!
   ```

4. **Verifikasi:**
   - Harus redirect ke `/approver/dashboard`
   - Harus melihat "Approver Dashboard"
   - Harus melihat role label "Finance"

---

## 📊 Status Testing

- ✅ Super Admin login & dashboard
- ⏳ Approver login & dashboard (perlu testing manual)
- ⏳ Security login & dashboard (perlu testing manual)
- ⏳ Vendor registration & login (belum ada vendor)
- ⏳ Role-based access control (perlu testing manual)
- ⏳ Active status check (perlu testing manual)
