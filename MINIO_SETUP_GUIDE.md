# 📦 MinIO Setup & Backup Strategy

**Last Updated:** 4 Mei 2026  
**VPS Storage:** 100GB Total  
**MinIO Allocation:** ~20GB untuk file storage

---

## 🎯 OVERVIEW

MinIO adalah S3-compatible object storage yang self-hosted di VPS. Digunakan untuk menyimpan:
- **Request Forms** — Gambar form fisik yang di-scan vendor (max 5MB per file)
- **Evidence Photos** — Foto verifikasi dari Security (max 5MB per foto, max 5 foto per request)
- **QR Codes** — QR code untuk approved requests (kecil, ~10KB per file)

---

## 📊 STORAGE ESTIMATION

### Asumsi:
- **Requests per bulan:** ~100 requests
- **Requests per tahun:** ~1,200 requests
- **Form size:** 5MB per request
- **Evidence photos:** 5 photos x 5MB = 25MB per request
- **QR code:** 10KB per request (negligible)

### Perhitungan:
```
Per Request:
- Form: 5MB
- Evidence: 25MB (5 photos x 5MB)
- QR Code: 0.01MB
- Total: ~30MB per request

Per Tahun:
- 1,200 requests x 30MB = 36GB per tahun

VPS 100GB:
- System + Laravel: ~10GB
- MySQL Database: ~5GB
- MinIO Storage: ~20GB (cukup untuk ~666 requests atau ~6 bulan)
- Logs & Cache: ~5GB
- Free Space: ~60GB (untuk backup & growth)
```

### Kesimpulan:
- **20GB MinIO storage cukup untuk ~6 bulan operasional**
- **Backup strategy WAJIB** untuk avoid data loss
- **Cleanup old files** setelah 6 bulan (archive ke external storage)

---

## 🚀 SETUP MINIO

### 1. Start MinIO Container

```bash
# Start semua containers termasuk MinIO
docker-compose up -d

# Verify MinIO running
docker ps | grep minio

# Check MinIO logs
docker logs minio
```

### 2. Access MinIO Console

**URL:** http://localhost:9001  
**Username:** minioadmin  
**Password:** minioadmin123

### 3. Create Bucket

1. Login ke MinIO Console (http://localhost:9001)
2. Klik **"Buckets"** di sidebar
3. Klik **"Create Bucket"**
4. Bucket Name: `approval-system`
5. Versioning: **Disabled** (untuk save space)
6. Object Locking: **Disabled**
7. Klik **"Create Bucket"**

### 4. Set Bucket Policy (Public Read untuk QR Codes)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::approval-system/qrcodes/*"]
    }
  ]
}
```

**Cara apply:**
1. Klik bucket `approval-system`
2. Tab **"Access"**
3. Klik **"Add Access Rule"**
4. Prefix: `qrcodes/`
5. Access: **readonly**
6. Save

### 5. Test Upload dari Laravel

```bash
# Masuk ke Laravel container
docker exec -it laravel_app bash

# Test MinIO connection
php artisan tinker

# Di tinker:
use Illuminate\Support\Facades\Storage;
Storage::disk('minio')->put('test.txt', 'Hello MinIO!');
Storage::disk('minio')->exists('test.txt'); // Should return true
Storage::disk('minio')->get('test.txt'); // Should return "Hello MinIO!"
Storage::disk('minio')->delete('test.txt');
```

---

## 💾 BACKUP STRATEGY

### Backup Schedule

| Frequency | What | Where | Retention |
|-----------|------|-------|-----------|
| **Daily** | Incremental backup (new files only) | External HDD / NAS | 7 days |
| **Weekly** | Full backup (all files) | External HDD / NAS | 4 weeks |
| **Monthly** | Full backup + archive | Cloud Storage (Google Drive / Dropbox) | 12 months |

### Backup Methods

#### Method 1: MinIO Client (mc) — RECOMMENDED

```bash
# Install MinIO Client di VPS
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# Configure MinIO alias
mc alias set local http://localhost:9000 minioadmin minioadmin123

# Test connection
mc ls local

# Backup bucket to external storage
mc mirror local/approval-system /mnt/backup/minio/approval-system

# Restore from backup
mc mirror /mnt/backup/minio/approval-system local/approval-system
```

#### Method 2: Docker Volume Backup

```bash
# Stop MinIO container
docker-compose stop minio

# Backup volume
sudo tar -czf minio-backup-$(date +%Y%m%d).tar.gz -C ./storage/minio .

# Restart MinIO
docker-compose start minio

# Restore from backup
docker-compose stop minio
sudo tar -xzf minio-backup-20260504.tar.gz -C ./storage/minio
docker-compose start minio
```

#### Method 3: Automated Backup Script

```bash
#!/bin/bash
# File: backup-minio.sh

BACKUP_DIR="/mnt/backup/minio"
DATE=$(date +%Y%m%d)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup using mc mirror (incremental)
mc mirror local/approval-system $BACKUP_DIR/approval-system-$DATE

# Delete old backups (older than 7 days)
find $BACKUP_DIR -type d -name "approval-system-*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/approval-system-$DATE"
```

**Setup Cron Job:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-minio.sh >> /var/log/minio-backup.log 2>&1
```

---

## 🗑️ CLEANUP STRATEGY

### Auto-Cleanup Old Files (After 6 Months)

```php
// File: app/Console/Commands/CleanupOldFiles.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request;
use App\Services\StorageService;
use Carbon\Carbon;

class CleanupOldFiles extends Command
{
    protected $signature = 'storage:cleanup-old';
    protected $description = 'Cleanup files older than 6 months';

    public function handle(StorageService $storageService)
    {
        $sixMonthsAgo = Carbon::now()->subMonths(6);
        
        // Get old completed requests
        $oldRequests = Request::where('status', 'COMPLETED')
            ->where('updated_at', '<', $sixMonthsAgo)
            ->get();

        $this->info("Found {$oldRequests->count()} old requests to cleanup");

        foreach ($oldRequests as $request) {
            try {
                // Delete request folder (form + evidences)
                $storageService->deleteFolder("requests/{$request->id}");
                $storageService->deleteFolder("evidences/{$request->id}");
                
                // Keep QR code (small size, useful for audit)
                
                $this->info("Cleaned up request #{$request->id}");
                
            } catch (\Exception $e) {
                $this->error("Failed to cleanup request #{$request->id}: {$e->getMessage()}");
            }
        }

        $this->info('Cleanup completed!');
    }
}
```

**Setup Cron Job:**
```php
// File: app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Run cleanup every month on 1st day at 3 AM
    $schedule->command('storage:cleanup-old')
        ->monthlyOn(1, '03:00')
        ->appendOutputTo(storage_path('logs/cleanup.log'));
}
```

---

## 📈 MONITORING

### Check MinIO Storage Usage

```bash
# Via MinIO Client
mc du local/approval-system

# Via Docker
docker exec minio du -sh /data

# Via Laravel
php artisan tinker
use Illuminate\Support\Facades\Storage;
$files = Storage::disk('minio')->allFiles();
$totalSize = 0;
foreach ($files as $file) {
    $totalSize += Storage::disk('minio')->size($file);
}
echo "Total: " . round($totalSize / 1024 / 1024, 2) . " MB";
```

### Alert Thresholds

- **Warning:** 15GB used (75% of 20GB allocation)
- **Critical:** 18GB used (90% of 20GB allocation)
- **Action:** Run cleanup or expand storage

---

## 🔒 SECURITY BEST PRACTICES

### 1. Change Default Credentials (PRODUCTION)

```bash
# Update .env
MINIO_ROOT_USER=your_secure_username
MINIO_ROOT_PASSWORD=your_secure_password_min_8_chars

# Restart MinIO
docker-compose restart minio
```

### 2. Enable HTTPS (PRODUCTION)

```yaml
# docker-compose.yml
minio:
  environment:
    MINIO_SERVER_URL: "https://minio.yourdomain.com"
  volumes:
    - ./certs:/root/.minio/certs
```

### 3. Restrict Network Access

```yaml
# docker-compose.yml
minio:
  ports:
    - "127.0.0.1:9000:9000"  # Only localhost
    - "127.0.0.1:9001:9001"  # Only localhost
```

### 4. Enable Audit Logging

```yaml
# docker-compose.yml
minio:
  environment:
    MINIO_AUDIT_WEBHOOK_ENABLE: "on"
    MINIO_AUDIT_WEBHOOK_ENDPOINT: "http://your-log-server"
```

---

## 🐛 TROUBLESHOOTING

### Issue: Cannot connect to MinIO from Laravel

**Solution:**
```bash
# Check MinIO is running
docker ps | grep minio

# Check MinIO logs
docker logs minio

# Test connection from Laravel container
docker exec -it laravel_app ping minio

# Verify .env configuration
docker exec -it laravel_app cat .env | grep MINIO
```

### Issue: Upload fails with "Access Denied"

**Solution:**
```bash
# Check bucket policy
mc policy get local/approval-system

# Set public read for qrcodes
mc policy set download local/approval-system/qrcodes

# Set private for other folders
mc policy set private local/approval-system/requests
mc policy set private local/approval-system/evidences
```

### Issue: Storage full

**Solution:**
```bash
# Check storage usage
mc du local/approval-system

# Run cleanup command
php artisan storage:cleanup-old

# Or manually delete old files
mc rm --recursive --force local/approval-system/requests/old-request-id
```

---

## 📋 CHECKLIST

### Initial Setup
- [x] MinIO container running
- [ ] Bucket `approval-system` created
- [ ] Bucket policy configured
- [ ] Test upload/download from Laravel
- [ ] StorageService tested

### Backup Setup
- [ ] MinIO Client (mc) installed
- [ ] Backup script created
- [ ] Cron job configured
- [ ] Test backup & restore
- [ ] External storage mounted

### Monitoring Setup
- [ ] Storage usage monitoring script
- [ ] Alert thresholds configured
- [ ] Cleanup command scheduled
- [ ] Log rotation configured

### Production Readiness
- [ ] Change default credentials
- [ ] Enable HTTPS
- [ ] Restrict network access
- [ ] Enable audit logging
- [ ] Document backup procedures

---

## 📚 REFERENCES

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [MinIO Client Guide](https://min.io/docs/minio/linux/reference/minio-mc.html)
- [Laravel Filesystem](https://laravel.com/docs/11.x/filesystem)
- [AWS S3 API](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html)

---

**Next Steps:**
1. Start MinIO container: `docker-compose up -d minio`
2. Create bucket via console: http://localhost:9001
3. Test StorageService: `php artisan tinker`
4. Setup backup script
5. Configure monitoring

**Status:** ✅ MinIO infrastructure ready for Phase 2 development
