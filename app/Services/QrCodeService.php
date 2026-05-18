<?php

namespace App\Services;

use App\Models\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/**
 * QrCodeService
 *
 * Service untuk generate dan manage QR code untuk approved requests.
 *
 * Fungsi utama:
 * - Generate QR code setelah request APPROVED
 * - Store QR code image ke MinIO
 * - Validate QR code saat security scan
 *
 * Business rules:
 * - QR code hanya di-generate untuk status APPROVED
 * - QR code berisi: request_id, vendor_name, document_serial_no, signature
 * - QR code valid selama 7 hari dari approved_at
 * - Signature untuk prevent tampering
 *
 * QR Content Format:
 * {
 *   "request_id": "uuid",
 *   "vendor_name": "PT Example",
 *   "request_type": "LOADING_IN",
 *   "document_serial_no": "001518RHU",
 *   "approved_at": "2026-05-09 15:30:00",
 *   "valid_until": "2026-05-16 15:30:00",
 *   "signature": "sha256_hash"
 * }
 *
 * Digunakan oleh: ApprovalService, SecurityService
 */
class QrCodeService
{
    protected $storageService;

    public function __construct(StorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * Generate QR code untuk request yang sudah APPROVED
     *
     * Apa yang dilakukan:
     * Generate QR code dengan data request dan signature untuk security.
     *
     * Cara kerja:
     * 1. Validate request status (must be APPROVED)
     * 2. Prepare QR content dengan signature
     * 3. Generate QR code image
     * 4. Upload ke MinIO
     * 5. Update request.qr_code field dengan path
     * 6. Log success/failure
     *
     * @param string $requestId — UUID request
     * @return string — Path QR code di MinIO
     * @throws \Exception — Jika generate gagal
     */
    public function generateQrCode(string $requestId): string
    {
        Log::info('QR_CODE_GENERATE_START', [
            'request_id' => $requestId,
        ]);

        try {
            // Get request dengan vendor relation
            $request = Request::with('vendor')->findOrFail($requestId);

            // Validate status
            if (!in_array($request->status, ['APPROVED', 'EXECUTED'])) {
                throw new \Exception('QR code hanya bisa di-generate untuk request dengan status APPROVED atau EXECUTED.');
            }

            // Prepare QR content
            // Keep payload minimal to reduce QR density — backend looks up details from request_id
            $qrContent = [
                'request_id' => $request->id,
            ];

            // Generate signature to prevent tampering
            $qrContent['sig'] = $this->generateSignature($qrContent);

            // Convert to JSON (short key names to reduce character count)
            $qrContentJson = json_encode($qrContent, JSON_UNESCAPED_UNICODE);

            // Generate QR code image (SVG format - tidak perlu imagick)
            // Error correction M = 15% recovery (balanced), lower than H so QR is less dense & easier to scan
            $qrCodeImage = QrCode::format('svg')
                ->size(600)
                ->errorCorrection('M') // Medium error correction — less dense, faster to scan
                ->margin(3)
                ->generate($qrContentJson);

            // Upload ke MinIO
            $qrCodePath = "requests/{$request->id}/qr_code.svg";
            Storage::disk('minio')->put($qrCodePath, $qrCodeImage);

            // Update request.qr_code field
            $request->update([
                'qr_code' => $qrCodePath,
            ]);

            Log::info('QR_CODE_GENERATE_SUCCESS', [
                'request_id' => $request->id,
                'qr_code_path' => $qrCodePath,
            ]);

            return $qrCodePath;

        } catch (\Exception $e) {
            Log::error('QR_CODE_GENERATE_FAILED', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal generate QR code. ' . $e->getMessage());
        }
    }

    /**
     * Decode dan validate QR code dari scan
     *
     * Apa yang dilakukan:
     * Decode QR code content dan validate signature + expiry.
     *
     * Cara kerja:
     * 1. Decode QR content (JSON)
     * 2. Validate signature
     * 3. Validate expiry date
     * 4. Validate request exists dan status APPROVED
     * 5. Return request data jika valid
     *
     * @param string $qrContent — QR code content (JSON string)
     * @return array — Decoded QR data
     * @throws \Exception — Jika QR invalid
     */
    public function validateQrCode(string $qrContent): array
    {
        Log::info('QR_CODE_VALIDATE_START');

        try {
            // Decode JSON
            $qrData = json_decode($qrContent, true);

            if (!$qrData) {
                throw new \Exception('QR code format tidak valid.');
            }

            // Validate required fields
            $requiredFields = ['request_id', 'sig'];
            foreach ($requiredFields as $field) {
                if (!isset($qrData[$field])) {
                    throw new \Exception("QR code tidak lengkap. Field '{$field}' tidak ditemukan.");
                }
            }

            // Validate signature
            $signature = $qrData['sig'];
            unset($qrData['sig']); // Remove signature untuk verify

            $expectedSignature = $this->generateSignature($qrData);

            if ($signature !== $expectedSignature) {
                throw new \Exception('QR code tidak valid. Signature tidak cocok.');
            }

            // Validate request exists dan status APPROVED
            $request = Request::find($qrData['request_id']);

            if (!$request) {
                throw new \Exception('Request tidak ditemukan.');
            }

            if (!in_array($request->status, ['APPROVED', 'EXECUTED'])) {
                throw new \Exception('Request belum approved atau sudah diproses. Status: ' . $request->status);
            }

            Log::info('QR_CODE_VALIDATE_SUCCESS', [
                'request_id' => $qrData['request_id'],
                'document_serial_no' => $request->document_serial_no,
            ]);

            // Add signature back untuk return
            $qrData['sig'] = $signature;

            return $qrData;

        } catch (\Exception $e) {
            Log::error('QR_CODE_VALIDATE_FAILED', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Get QR code URL untuk display
     *
     * Apa yang dilakukan:
     * Generate presigned URL untuk akses QR code image dari MinIO.
     *
     * @param string $requestId — UUID request
     * @return string|null — URL QR code atau null jika tidak ada
     */
    public function getQrCodeUrl(string $requestId): ?string
    {
        try {
            $request = Request::findOrFail($requestId);

            if (!$request->qr_code) {
                return null;
            }

            return $this->storageService->getFileUrl($request->qr_code);

        } catch (\Exception $e) {
            Log::error('QR_CODE_GET_URL_FAILED', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Generate signature untuk QR content
     *
     * Menggunakan HMAC SHA256 dengan app key sebagai secret.
     *
     * @param array $data — QR content data
     * @return string — Signature hash
     */
    protected function generateSignature(array $data): string
    {
        // Sort array by key untuk consistent signature
        ksort($data);

        // Convert to string
        $dataString = json_encode($data);

        // Generate HMAC SHA256
        $secret = config('app.key');
        $signature = hash_hmac('sha256', $dataString, $secret);

        return $signature;
    }
}
