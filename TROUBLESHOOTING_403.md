# Troubleshooting 403 Forbidden - Approver Dashboard

## Status Saat Ini

✅ **Database**: User approver sudah ada dan aktif
✅ **Middleware Logic**: CheckRole middleware sudah benar (dengan trim)
✅ **Routes**: Route approver.dashboard sudah terdaftar dengan middleware yang benar
✅ **Model Helper**: Method `isApprover()` dan `getDashboardRoute()` sudah benar
✅ **Cache**: Laravel cache sudah di-clear

## Data User Approver di Database

```
ID: 2 | Email: adminfinance@gmail.com | Role: approver_finance | Active: Yes
ID: 3 | Email: admindepartement@gmail.com | Role: approver_dept | Active: Yes
ID: 4 | Email: adminoperations@gmail.com | Role: approver_ops | Active: Yes
ID: 5 | Email: admingm@gmail.com | Role: approver_gm | Active: Yes
```

## Test yang Sudah Dilakukan

1. ✅ Verifikasi data user di database
2. ✅ Test helper methods (isApprover, getDashboardRoute)
3. ✅ Test middleware logic (role matching)
4. ✅ Verifikasi route exists
5. ✅ Clear Laravel cache

## Kemungkinan Penyebab 403

### 1. Session Tidak Tersinkronisasi
Setelah clear cache, session mungkin perlu di-refresh.

**Solusi:**
- Logout dari semua akun
- Clear browser cache dan cookies
- Login ulang dengan akun approver

### 2. Middleware Order Issue
Middleware `active` mungkin dijalankan sebelum user ter-authenticate dengan benar.

**Solusi:**
- Sudah benar di routes: `['auth', 'active', 'role:...']`
- Auth middleware dijalankan pertama, baru active, baru role

### 3. Browser Cache
Browser mungkin masih menggunakan JavaScript bundle lama.

**Solusi:**
- Hard refresh browser (Ctrl+Shift+R atau Cmd+Shift+R)
- Clear browser cache
- Restart Vite dev server jika perlu

## Langkah Testing Manual

### Test 1: Login dengan Super Admin (Baseline)
```
Email: superadmin@mall.com
Password: SuperAdmin123!
Expected: Redirect ke /admin/dashboard (200 OK)
```

### Test 2: Login dengan Approver Finance
```
Email: adminfinance@gmail.com
Password: [password yang diset saat create user]
Expected: Redirect ke /approver/dashboard (200 OK)
```

### Test 3: Cek Network Tab di Browser
1. Buka Developer Tools (F12)
2. Buka tab Network
3. Login dengan approver
4. Lihat request ke `/approver/dashboard`
5. Cek response status dan headers

**Yang perlu dicek:**
- Status code: Harus 200, bukan 403
- Request headers: Cookie session harus ada
- Response headers: Cek X-Inertia header

### Test 4: Cek Laravel Log
```bash
docker exec laravel_app tail -f storage/logs/laravel.log
```

Lalu login dengan approver dan lihat apakah ada error log.

## Debugging Commands

### 1. Cek Route List
```bash
docker exec laravel_app php artisan route:list --name=approver
```

### 2. Cek Middleware Registered
```bash
docker exec laravel_app php artisan route:list --name=approver.dashboard
```

### 3. Clear All Cache (Lagi)
```bash
docker exec laravel_app php artisan optimize:clear
docker exec laravel_app php artisan config:clear
docker exec laravel_app php artisan route:clear
docker exec laravel_app php artisan view:clear
```

### 4. Restart Container
```bash
docker-compose restart
```

## Jika Masih 403

### Debug Mode: Tambahkan Logging di Middleware

Edit `app/Http/Middleware/CheckRole.php`, tambahkan logging:

```php
public function handle(Request $request, Closure $next, string $roles): Response
{
    $user = $request->user();
    
    // DEBUG: Log untuk troubleshooting
    \Log::info('CheckRole Middleware', [
        'user_id' => $user?->id,
        'user_role' => $user?->role,
        'required_roles' => $roles,
        'url' => $request->url(),
    ]);

    if (!$user) {
        \Log::warning('CheckRole: User not authenticated');
        abort(403, 'Anda tidak memiliki akses ke halaman ini.');
    }

    $allowedRoles = array_map('trim', explode(',', $roles));
    
    \Log::info('CheckRole: Role check', [
        'user_role' => $user->role,
        'allowed_roles' => $allowedRoles,
        'match' => in_array($user->role, $allowedRoles),
    ]);

    if (!in_array($user->role, $allowedRoles)) {
        \Log::warning('CheckRole: Role mismatch', [
            'user_role' => $user->role,
            'allowed_roles' => $allowedRoles,
        ]);
        abort(403, 'Anda tidak memiliki akses ke halaman ini.');
    }

    return $next($request);
}
```

Lalu cek log:
```bash
docker exec laravel_app tail -f storage/logs/laravel.log
```

## Password Default untuk Testing

Jika user approver dibuat via UserController (Super Admin), password default biasanya:
- Sesuai yang diinput saat create user
- Atau cek di `database/seeders/` jika ada seeder khusus

**Cara reset password manual via Tinker:**
```bash
docker exec -it laravel_app php artisan tinker
```

```php
$user = User::where('email', 'adminfinance@gmail.com')->first();
$user->password = Hash::make('Password123!');
$user->save();
exit
```

## Next Steps

1. **Test manual login** dengan approver account
2. **Cek browser console** untuk error JavaScript
3. **Cek network tab** untuk melihat request/response detail
4. **Tambahkan logging** di middleware jika masih 403
5. **Report hasil** testing untuk debugging lebih lanjut
