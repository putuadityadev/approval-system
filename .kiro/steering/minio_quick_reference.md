---
inclusion: auto
---

# 🚀 MinIO Quick Reference

**Object Storage untuk Mall Approval System**

---

## 📦 BASIC INFO

- **Type:** S3-compatible object storage (self-hosted)
- **Container:** `minio` (Docker)
- **API Port:** 9000
- **Console Port:** 9001
- **Bucket:** `approval-system`
- **Storage:** `./storage/minio/` (persistent)

---

## 🔑 CREDENTIALS (Development)

```env
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
```

**Console URL:** http://localhost:9001

---

## 📁 FOLDER STRUCTURE

```
approval-system/
├── requests/{request_id}/
│   └── form_{timestamp}.jpg          # Form fisik image (max 5MB)
├── evidences/{request_id}/
│   ├── {timestamp}_0.jpg             # Evidence photo 1 (max 5MB)
│   ├── {timestamp}_1.jpg             # Evidence photo 2
│   └── ...                           # Max 5 photos total
└── qrcodes/
    └── {request_id}.png              # QR code (~10KB)
```

---

## 💻 COMMON COMMANDS

### Start/Stop MinIO

```bash
# Start MinIO
docker-compose up -d minio

# Stop MinIO
docker-compose stop minio

# Restart MinIO
docker-compose restart minio

# Check status
docker ps --filter "name=minio"

# View logs
docker logs minio --tail 50
```

### Laravel Storage Operations

```php
use Illuminate\Support\Facades\Storage;

// Upload file
Storage::disk('minio')->put('path/file.jpg', $fileContent);

// Check if exists
Storage::disk('minio')->exists('path/file.jpg');

// Download file
$content = Storage::disk('minio')->get('path/file.jpg');

// Delete file
Storage::disk('minio')->delete('path/file.jpg');

// Get temporary URL (60 minutes)
$url = Storage::disk('minio')->temporaryUrl('path/file.jpg', now()->addMinutes(60));

// List files in folder
$files = Storage::disk('minio')->files('requests/123');

// Delete folder
Storage::disk('minio')->deleteDirectory('requests/123');
```

### Using StorageService

```php
use App\Services\StorageService;

$storageService = app(StorageService::class);

// Upload request form
$path = $storageService->uploadRequestForm($uploadedFile, $requestId);

// Upload evidence photos
$paths = $storageService->uploadEvidencePhotos($filesArray, $requestId);

// Upload QR code
$path = $storageService->uploadQrCode($qrCodeContent, $requestId);

// Download file
$content = $storageService->downloadFile($path);

// Get temporary URL
$url = $storageService->getTemporaryUrl($path, 60);

// Delete file
$storageService->deleteFile($path);

// Delete folder
$storageService->deleteFolder("requests/{$requestId}");

// Check if exists
$exists = $storageService->fileExists($path);

// Get file size
$size = $storageService->getFileSize($path);
```

---

## 📊 FILE LIMITS

```php
// From config/filesystems.php
MAX_IMAGE_SIZE=5120        // 5MB in KB
MAX_DOCUMENT_SIZE=10240    // 10MB in KB
MAX_EVIDENCE_PHOTOS=5      // Max 5 photos per evidence
```

**Validation:**
- Form images: max 5MB, JPG/PNG only
- Evidence photos: max 5MB each, max 5 photos total, JPG/PNG only
- QR codes: auto-generated, ~10KB

---

## 🔧 TROUBLESHOOTING

### Cannot connect to MinIO

```bash
# Check MinIO is running
docker ps --filter "name=minio"

# Check MinIO logs
docker logs minio

# Test connection from Laravel container
docker exec -it laravel_app ping minio

# Verify .env configuration
docker exec -it laravel_app cat .env | Select-String MINIO

# Clear Laravel config cache
docker exec laravel_app php artisan config:clear
```

### Upload fails with "Access Denied"

```bash
# Check bucket exists
# Open http://localhost:9001 and verify bucket "approval-system" exists

# If bucket doesn't exist, create it via console
# Or via Laravel:
docker exec -it laravel_app php artisan tinker
Storage::disk('minio')->makeDirectory('approval-system');
```

### Storage full

```bash
# Check storage usage
docker exec minio du -sh /data

# Run cleanup command (after implementing)
docker exec laravel_app php artisan storage:cleanup-old

# Or manually delete old files via console
# Open http://localhost:9001 → Buckets → approval-system → Browse
```

---

## 💾 BACKUP COMMANDS

### Quick Backup (Docker Volume)

```bash
# Stop MinIO
docker-compose stop minio

# Backup
tar -czf minio-backup-$(date +%Y%m%d).tar.gz -C ./storage/minio .

# Restart MinIO
docker-compose start minio
```

### Restore from Backup

```bash
# Stop MinIO
docker-compose stop minio

# Restore
tar -xzf minio-backup-20260504.tar.gz -C ./storage/minio

# Restart MinIO
docker-compose start minio
```

---

## 📝 LOGGING PATTERNS

StorageService menggunakan logging pattern:

```
STORAGE_UPLOAD_REQUEST_FORM_START
STORAGE_UPLOAD_REQUEST_FORM_SUCCESS
STORAGE_UPLOAD_REQUEST_FORM_FAILED

STORAGE_UPLOAD_EVIDENCE_START
STORAGE_UPLOAD_EVIDENCE_SUCCESS
STORAGE_UPLOAD_EVIDENCE_FAILED

STORAGE_UPLOAD_QR_CODE_START
STORAGE_UPLOAD_QR_CODE_SUCCESS
STORAGE_UPLOAD_QR_CODE_FAILED

STORAGE_DOWNLOAD_FILE_FAILED
STORAGE_GET_TEMPORARY_URL_FAILED

STORAGE_DELETE_FILE_START
STORAGE_DELETE_FILE_SUCCESS
STORAGE_DELETE_FILE_FAILED
STORAGE_DELETE_FILE_NOT_FOUND

STORAGE_DELETE_FOLDER_START
STORAGE_DELETE_FOLDER_SUCCESS
STORAGE_DELETE_FOLDER_FAILED
STORAGE_DELETE_FOLDER_EMPTY
```

**Context yang di-log:**
- `request_id` — ID request
- `path` — File path di MinIO
- `file_name` — Original filename
- `file_size` — File size in bytes
- `error` — Error message jika gagal
- `trace` — Stack trace untuk debugging

---

## 🎯 BEST PRACTICES

1. **Always use StorageService** — Jangan langsung pakai `Storage::disk('minio')`
2. **Validate before upload** — StorageService sudah handle validation
3. **Handle exceptions** — Semua methods throw exception jika gagal
4. **Log operations** — StorageService sudah auto-log semua operations
5. **Use temporary URLs** — Untuk display images, jangan expose direct path
6. **Cleanup old files** — Run cleanup command monthly
7. **Backup regularly** — Daily incremental, weekly full backup

---

## 📚 REFERENCES

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [Laravel Filesystem](https://laravel.com/docs/11.x/filesystem)
- [Setup Guide](../../MINIO_SETUP_GUIDE.md)
- [Sprint 0 Complete](../../SPRINT_0_INFRASTRUCTURE_COMPLETE.md)

---

**Last Updated:** 4 Mei 2026  
**Status:** ✅ Ready for use in Phase 2
