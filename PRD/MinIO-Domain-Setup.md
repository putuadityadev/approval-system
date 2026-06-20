# 🔧 MinIO Domain Setup - Production Fix

## 📋 Masalah yang Ditemukan

**Tanggal**: 20 Juni 2026

### Symptoms
- ✅ Domain `storage.seviraku.cloud` sudah dikonfigurasi di Dokploy
- ❌ Akses `https://storage.seviraku.cloud` → **404 Not Found**
- ❌ UI aplikasi gagal memuat gambar dari MinIO
- ❌ Network request ke storage endpoint gagal dengan 404
- ✅ File/gambar sudah ter-upload dan ada di MinIO (terlihat di Console)

### Root Cause
MinIO service **tidak terhubung ke `dokploy-network`**, sehingga Traefik/Dokploy tidak bisa routing domain `storage.seviraku.cloud` ke MinIO container port 9000 (API).

---

## 🛠️ Solusi yang Diterapkan

### 1. Update `docker-compose.prod.yml`

**Perubahan pada MinIO service:**

```yaml
minio:
  image: minio/minio:latest
  restart: unless-stopped
  environment:
    MINIO_ROOT_USER:     ${MINIO_ROOT_USER}
    MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    MINIO_SERVER_URL:    https://storage.seviraku.cloud  # ← TAMBAHAN
  networks:
    - approval_network
    - dokploy-network  # ← TAMBAHAN (agar Traefik bisa routing)
  # ... konfigurasi lainnya tetap sama
```

**Yang berubah:**
- ✅ Tambah network `dokploy-network` ke MinIO service
- ✅ Tambah environment variable `MINIO_SERVER_URL`

### 2. Update `.env.production`

**Perubahan pada MinIO environment variables:**

```env
# SEBELUM
MINIO_PUBLIC_ENDPOINT=https://approval.seviraku.cloud/storage
MINIO_USE_PATH_STYLE_ENDPOINT=true

# SESUDAH
MINIO_PUBLIC_ENDPOINT=https://storage.seviraku.cloud
MINIO_USE_PATH_STYLE_ENDPOINT=false
MINIO_SERVER_URL=https://storage.seviraku.cloud
```

**Penjelasan:**
- `MINIO_PUBLIC_ENDPOINT`: URL yang dipakai frontend untuk akses file (ganti dari `/storage` path ke dedicated domain)
- `MINIO_USE_PATH_STYLE_ENDPOINT`: Ubah ke `false` karena pakai subdomain, bukan path
- `MINIO_SERVER_URL`: URL yang dipakai MinIO server untuk generate presigned URLs

---

## 🚀 Deployment Steps

### Step 1: Push Changes ke Git

```bash
git add docker-compose.prod.yml .env.production PRD/MinIO-Domain-Setup.md
git commit -m "fix: MinIO domain routing untuk storage.seviraku.cloud"
git push origin main
```

### Step 2: Update Environment Variables di Dokploy

1. Login ke **Dokploy Dashboard**
2. Pilih project **"Mall Approval System"**
3. Buka tab **Environment Variables**
4. Update environment variables berikut:

```env
MINIO_PUBLIC_ENDPOINT=https://storage.seviraku.cloud
MINIO_USE_PATH_STYLE_ENDPOINT=false
MINIO_SERVER_URL=https://storage.seviraku.cloud
```

5. **Save Changes**

### Step 3: Konfigurasi Domain di Dokploy

**Pastikan domain `storage.seviraku.cloud` sudah dikonfigurasi dengan benar:**

1. Buka tab **Domains** di Dokploy
2. Klik domain **`storage.seviraku.cloud`**
3. Pastikan konfigurasi:
   - **Service**: `minio` (bukan `app`)
   - **Port**: `9000` (bukan 9001)
   - **Path**: `/`
   - **HTTPS**: Enabled dengan Let's Encrypt
4. Klik **Validate DNS** untuk cek DNS record
5. **Save**

### Step 4: Redeploy Application

```bash
# Di Dokploy Dashboard
1. Buka tab "Deployments"
2. Klik "Redeploy"
3. Wait for deployment success

# Atau via CLI (jika ada akses SSH ke Dokploy server)
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Step 5: Set MinIO Bucket Policy (Public Read)

**Login ke MinIO Console** (`http://72.60.78.155:9001`):

1. Pilih bucket **`approval-system`**
2. Buka tab **Access Rules** atau **Buckets → approval-system → Manage**
3. Set bucket policy untuk public read:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::approval-system/*"
      ]
    }
  ]
}
```

**Atau via MinIO Console UI:**
- Set **Access Policy** ke **`public`** atau **`download`**

### Step 6: Restart MinIO Container (Optional)

Jika perlu restart manual:

```bash
# SSH ke Dokploy server
docker restart <minio-container-name>
```

---

## ✅ Verifikasi

### 1. Test Domain Accessibility

```bash
# Test dari browser atau curl
curl -I https://storage.seviraku.cloud/minio/health/live

# Expected: HTTP 200 OK
```

### 2. Test Image URL di Browser

Ambil salah satu URL gambar yang gagal dari Network tab, contoh:

```
https://storage.seviraku.cloud/approval-system/requests/a1cdda73-fc83-4b4c-9e2d-ac1501909eb1/form_1779699299.jpeg
```

Buka di browser → harus bisa tampil gambar.

### 3. Test dari Aplikasi

1. Login ke `https://approval.seviraku.cloud`
2. Buka halaman **Pending Request** yang punya dokumen
3. Klik **Preview Dokumen Asli**
4. Gambar harus muncul (tidak lagi "Gagal memuat gambar")

---

## 🔍 Troubleshooting

### Issue 1: Domain masih 404

**Kemungkinan:**
- DNS record belum propagate
- Dokploy routing belum update

**Solusi:**
```bash
# Cek DNS record
nslookup storage.seviraku.cloud

# Harus pointing ke IP server Dokploy (72.60.78.155)
```

Jika DNS sudah benar, coba restart Traefik di Dokploy atau redeploy ulang.

### Issue 2: Gambar masih gagal load

**Kemungkinan:**
- Bucket policy belum public
- MinIO CORS belum dikonfigurasi

**Solusi:**

1. **Set Bucket Policy ke Public** (lihat Step 5 di atas)

2. **Set CORS Policy di MinIO:**

Login ke MinIO Console → Configuration → API → CORS:

```json
[
  {
    "AllowedOrigins": ["https://approval.seviraku.cloud"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Issue 3: Mixed Content Error (HTTP vs HTTPS)

**Kemungkinan:**
- MinIO generate HTTP URLs padahal frontend butuh HTTPS

**Solusi:**
Pastikan `MINIO_SERVER_URL=https://storage.seviraku.cloud` sudah di-set di environment variables.

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Dokploy + Traefik (Reverse Proxy)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Domain: approval.seviraku.cloud                             │
│    ↓                                                         │
│  Container: app (port 80) ──→ Laravel + Inertia + React     │
│                                                              │
│  Domain: storage.seviraku.cloud                              │
│    ↓                                                         │
│  Container: minio (port 9000) ──→ MinIO Object Storage      │
│                                                              │
│  Internal Network: approval_network                          │
│    ├── app ←→ minio (http://minio:9000)                     │
│    └── app ←→ db (mysql://db:3306)                          │
│                                                              │
│  External Network: dokploy-network                           │
│    ├── Traefik ←→ app                                        │
│    └── Traefik ←→ minio                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Checklist Deployment

- [ ] Update `docker-compose.prod.yml` (add dokploy-network + MINIO_SERVER_URL)
- [ ] Update `.env.production` (fix MINIO_PUBLIC_ENDPOINT)
- [ ] Push changes ke Git
- [ ] Update environment variables di Dokploy dashboard
- [ ] Pastikan domain `storage.seviraku.cloud` pointing ke MinIO service (port 9000)
- [ ] Validate DNS di Dokploy
- [ ] Redeploy application
- [ ] Set bucket policy ke public read di MinIO Console
- [ ] Test akses `https://storage.seviraku.cloud/minio/health/live`
- [ ] Test gambar dari UI aplikasi
- [ ] Monitor logs untuk error

---

## 🎯 Expected Result

Setelah fix ini diterapkan:

✅ Domain `storage.seviraku.cloud` accessible (return MinIO health check response)  
✅ Gambar di UI aplikasi bisa dimuat dengan benar  
✅ URL gambar berubah dari path-style ke subdomain-style:
   - **Sebelum**: `https://approval.seviraku.cloud/storage/approval-system/...`
   - **Sesudah**: `https://storage.seviraku.cloud/approval-system/...`

---

**Updated**: 20 Juni 2026  
**Author**: Mall Approval System Dev Team
