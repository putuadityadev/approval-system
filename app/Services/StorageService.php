<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * StorageService
 *
 * Service untuk mengelola file upload/download ke MinIO object storage.
 *
 * Fungsi utama:
 * - Upload file (images, documents) ke MinIO dengan validasi size
 * - Download file dari MinIO
 * - Delete file dari MinIO
 * - Generate signed URL untuk akses temporary
 *
 * Struktur folder di MinIO:
 * - approval-system/requests/{request_id}/form.jpg
 * - approval-system/evidences/{request_id}/{timestamp}_{filename}
 * - approval-system/qrcodes/{request_id}.png
 *
 * Digunakan oleh: RequestController, SecurityController
 */
class StorageService
{
    /**
     * Upload file form request ke MinIO
     *
     * Apa yang dilakukan:
     * Upload gambar form fisik yang di-scan vendor ke folder requests/
     *
     * Cara kerja:
     * 1. Validasi ukuran file (max 5MB untuk image)
     * 2. Generate nama file unik dengan timestamp
     * 3. Upload ke MinIO path: requests/{request_id}/form.jpg
     * 4. Return path file yang tersimpan
     *
     * @param UploadedFile $file — File yang diupload
     * @param int $requestId — ID request untuk folder structure
     * @return string — Path file di MinIO
     * @throws \Exception — Jika upload gagal
     */
    public function uploadRequestForm(UploadedFile $file, int $requestId): string
    {
        Log::info('STORAGE_UPLOAD_REQUEST_FORM_START', [
            'request_id' => $requestId,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
        ]);

        try {
            // Validasi ukuran file (5MB = 5120KB)
            $maxSize = config('filesystems.max_image_size', 5120) * 1024; // Convert KB to bytes
            if ($file->getSize() > $maxSize) {
                throw new \Exception('Ukuran file terlalu besar. Maksimal 5MB.');
            }

            // Validasi tipe file
            $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!in_array($file->getMimeType(), $allowedMimes)) {
                throw new \Exception('Tipe file tidak valid. Hanya JPG dan PNG yang diperbolehkan.');
            }

            // Generate path: requests/{request_id}/form_{timestamp}.jpg
            $extension = $file->getClientOriginalExtension();
            $filename = 'form_' . time() . '.' . $extension;
            $path = "requests/{$requestId}/{$filename}";

            // Upload ke MinIO
            $uploaded = Storage::disk('minio')->put($path, file_get_contents($file->getRealPath()));

            if (!$uploaded) {
                throw new \Exception('Gagal upload file ke storage.');
            }

            Log::info('STORAGE_UPLOAD_REQUEST_FORM_SUCCESS', [
                'request_id' => $requestId,
                'path' => $path,
                'file_size' => $file->getSize(),
            ]);

            return $path;

        } catch (\Exception $e) {
            Log::error('STORAGE_UPLOAD_REQUEST_FORM_FAILED', [
                'request_id' => $requestId,
                'file_name' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal upload form. ' . $e->getMessage());
        }
    }

    /**
     * Upload foto evidence dari Security
     *
     * Apa yang dilakukan:
     * Upload foto evidence yang diambil Security saat verifikasi barang
     *
     * Cara kerja:
     * 1. Validasi ukuran file (max 5MB per foto)
     * 2. Validasi jumlah foto (max 5 foto)
     * 3. Generate nama file unik dengan timestamp
     * 4. Upload ke MinIO path: evidences/{request_id}/{timestamp}_{filename}
     * 5. Return array paths file yang tersimpan
     *
     * @param array $files — Array of UploadedFile
     * @param int $requestId — ID request untuk folder structure
     * @return array — Array of paths file di MinIO
     * @throws \Exception — Jika upload gagal
     */
    public function uploadEvidencePhotos(array $files, int $requestId): array
    {
        Log::info('STORAGE_UPLOAD_EVIDENCE_START', [
            'request_id' => $requestId,
            'file_count' => count($files),
        ]);

        try {
            // Validasi jumlah foto (max 5)
            $maxPhotos = config('filesystems.max_evidence_photos', 5);
            if (count($files) > $maxPhotos) {
                throw new \Exception("Maksimal {$maxPhotos} foto evidence.");
            }

            $paths = [];
            $maxSize = config('filesystems.max_image_size', 5120) * 1024; // Convert KB to bytes

            foreach ($files as $index => $file) {
                // Validasi ukuran file
                if ($file->getSize() > $maxSize) {
                    throw new \Exception("Foto ke-" . ($index + 1) . " terlalu besar. Maksimal 5MB per foto.");
                }

                // Validasi tipe file
                $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!in_array($file->getMimeType(), $allowedMimes)) {
                    throw new \Exception("Foto ke-" . ($index + 1) . " tidak valid. Hanya JPG dan PNG yang diperbolehkan.");
                }

                // Generate path: evidences/{request_id}/{timestamp}_{index}.jpg
                $extension = $file->getClientOriginalExtension();
                $filename = time() . '_' . $index . '.' . $extension;
                $path = "evidences/{$requestId}/{$filename}";

                // Upload ke MinIO
                $uploaded = Storage::disk('minio')->put($path, file_get_contents($file->getRealPath()));

                if (!$uploaded) {
                    throw new \Exception("Gagal upload foto ke-" . ($index + 1));
                }

                $paths[] = $path;
            }

            Log::info('STORAGE_UPLOAD_EVIDENCE_SUCCESS', [
                'request_id' => $requestId,
                'uploaded_count' => count($paths),
                'paths' => $paths,
            ]);

            return $paths;

        } catch (\Exception $e) {
            Log::error('STORAGE_UPLOAD_EVIDENCE_FAILED', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal upload evidence. ' . $e->getMessage());
        }
    }

    /**
     * Upload QR code image
     *
     * Apa yang dilakukan:
     * Simpan QR code yang di-generate untuk request yang sudah approved
     *
     * Cara kerja:
     * 1. Terima QR code dalam bentuk binary/string
     * 2. Upload ke MinIO path: qrcodes/{request_id}.png
     * 3. Return path file yang tersimpan
     *
     * @param string $qrCodeContent — Binary content QR code
     * @param int $requestId — ID request
     * @return string — Path file di MinIO
     * @throws \Exception — Jika upload gagal
     */
    public function uploadQrCode(string $qrCodeContent, int $requestId): string
    {
        Log::info('STORAGE_UPLOAD_QR_CODE_START', [
            'request_id' => $requestId,
        ]);

        try {
            // Generate path: qrcodes/{request_id}.png
            $path = "qrcodes/{$requestId}.png";

            // Upload ke MinIO
            $uploaded = Storage::disk('minio')->put($path, $qrCodeContent);

            if (!$uploaded) {
                throw new \Exception('Gagal upload QR code ke storage.');
            }

            Log::info('STORAGE_UPLOAD_QR_CODE_SUCCESS', [
                'request_id' => $requestId,
                'path' => $path,
            ]);

            return $path;

        } catch (\Exception $e) {
            Log::error('STORAGE_UPLOAD_QR_CODE_FAILED', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal upload QR code. ' . $e->getMessage());
        }
    }

    /**
     * Download file dari MinIO
     *
     * Apa yang dilakukan:
     * Ambil file dari MinIO untuk ditampilkan atau didownload user
     *
     * Cara kerja:
     * 1. Cek apakah file exists di MinIO
     * 2. Ambil file content
     * 3. Return file content
     *
     * @param string $path — Path file di MinIO
     * @return string — File content
     * @throws \Exception — Jika file tidak ditemukan
     */
    public function downloadFile(string $path): string
    {
        try {
            if (!Storage::disk('minio')->exists($path)) {
                throw new \Exception('File tidak ditemukan.');
            }

            return Storage::disk('minio')->get($path);

        } catch (\Exception $e) {
            Log::error('STORAGE_DOWNLOAD_FILE_FAILED', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Gagal download file. ' . $e->getMessage());
        }
    }

    /**
     * Generate temporary signed URL untuk akses file
     *
     * Apa yang dilakukan:
     * Generate URL temporary (expired dalam X menit) untuk akses file tanpa auth
     *
     * Cara kerja:
     * 1. Generate signed URL dengan expiry time
     * 2. Return URL yang bisa diakses langsung
     *
     * @param string $path — Path file di MinIO
     * @param int $expiryMinutes — Berapa menit URL valid (default 60 menit)
     * @return string — Signed URL
     * @throws \Exception — Jika gagal generate URL
     */
    public function getTemporaryUrl(string $path, int $expiryMinutes = 60): string
    {
        try {
            if (!Storage::disk('minio')->exists($path)) {
                throw new \Exception('File tidak ditemukan.');
            }

            return Storage::disk('minio')->temporaryUrl($path, now()->addMinutes($expiryMinutes));

        } catch (\Exception $e) {
            Log::error('STORAGE_GET_TEMPORARY_URL_FAILED', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Gagal generate URL. ' . $e->getMessage());
        }
    }

    /**
     * Delete file dari MinIO
     *
     * Apa yang dilakukan:
     * Hapus file dari MinIO (misalnya saat request dibatalkan)
     *
     * Cara kerja:
     * 1. Cek apakah file exists
     * 2. Delete file dari MinIO
     * 3. Return true jika berhasil
     *
     * @param string $path — Path file di MinIO
     * @return bool — True jika berhasil delete
     * @throws \Exception — Jika gagal delete
     */
    public function deleteFile(string $path): bool
    {
        Log::info('STORAGE_DELETE_FILE_START', [
            'path' => $path,
        ]);

        try {
            if (!Storage::disk('minio')->exists($path)) {
                Log::warning('STORAGE_DELETE_FILE_NOT_FOUND', [
                    'path' => $path,
                ]);
                return true; // File sudah tidak ada, anggap berhasil
            }

            $deleted = Storage::disk('minio')->delete($path);

            if (!$deleted) {
                throw new \Exception('Gagal delete file dari storage.');
            }

            Log::info('STORAGE_DELETE_FILE_SUCCESS', [
                'path' => $path,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('STORAGE_DELETE_FILE_FAILED', [
                'path' => $path,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal delete file. ' . $e->getMessage());
        }
    }

    /**
     * Delete folder beserta isinya dari MinIO
     *
     * Apa yang dilakukan:
     * Hapus semua file dalam folder (misalnya saat request dibatalkan)
     *
     * Cara kerja:
     * 1. List semua file dalam folder
     * 2. Delete semua file
     * 3. Return true jika berhasil
     *
     * @param string $folderPath — Path folder di MinIO (e.g., "requests/123")
     * @return bool — True jika berhasil delete
     * @throws \Exception — Jika gagal delete
     */
    public function deleteFolder(string $folderPath): bool
    {
        Log::info('STORAGE_DELETE_FOLDER_START', [
            'folder_path' => $folderPath,
        ]);

        try {
            $files = Storage::disk('minio')->files($folderPath);

            if (empty($files)) {
                Log::warning('STORAGE_DELETE_FOLDER_EMPTY', [
                    'folder_path' => $folderPath,
                ]);
                return true; // Folder kosong, anggap berhasil
            }

            $deleted = Storage::disk('minio')->deleteDirectory($folderPath);

            if (!$deleted) {
                throw new \Exception('Gagal delete folder dari storage.');
            }

            Log::info('STORAGE_DELETE_FOLDER_SUCCESS', [
                'folder_path' => $folderPath,
                'deleted_files_count' => count($files),
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('STORAGE_DELETE_FOLDER_FAILED', [
                'folder_path' => $folderPath,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal delete folder. ' . $e->getMessage());
        }
    }

    /**
     * Check apakah file exists di MinIO
     *
     * @param string $path — Path file di MinIO
     * @return bool — True jika file exists
     */
    public function fileExists(string $path): bool
    {
        return Storage::disk('minio')->exists($path);
    }

    /**
     * Get file size dalam bytes
     *
     * @param string $path — Path file di MinIO
     * @return int — File size dalam bytes
     * @throws \Exception — Jika file tidak ditemukan
     */
    public function getFileSize(string $path): int
    {
        try {
            if (!Storage::disk('minio')->exists($path)) {
                throw new \Exception('File tidak ditemukan.');
            }

            return Storage::disk('minio')->size($path);

        } catch (\Exception $e) {
            Log::error('STORAGE_GET_FILE_SIZE_FAILED', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Gagal get file size. ' . $e->getMessage());
        }
    }
}
