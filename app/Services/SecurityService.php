<?php

namespace App\Services;

use App\Models\Request;
use App\Models\RequestEvidence;
use App\Events\RequestExecuted;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * SecurityService
 *
 * Service untuk mengelola security verification workflow.
 *
 * Fungsi utama:
 * - Scan dan validate QR code
 * - Upload evidence photos
 * - Update request status ke EXECUTED
 *
 * Business rules:
 * - QR code harus valid (not expired, signature match)
 * - Request status harus APPROVED
 * - Max 5 evidence photos per request
 * - Each photo max 5MB
 * - Setelah upload evidence, status → EXECUTED
 *
 * Digunakan oleh: SecurityController
 */
class SecurityService
{
    protected $qrCodeService;
    protected $storageService;

    public function __construct(
        QrCodeService $qrCodeService,
        StorageService $storageService
    ) {
        $this->qrCodeService = $qrCodeService;
        $this->storageService = $storageService;
    }

    /**
     * Scan dan validate QR code
     *
     * Apa yang dilakukan:
     * Decode QR content, validate, dan return request detail.
     *
     * Cara kerja:
     * 1. Validate QR code (signature + expiry)
     * 2. Get request detail dengan relasi
     * 3. Validate request status (must be APPROVED)
     * 4. Log scan activity
     * 5. Return request data
     *
     * @param string $qrContent — QR code content (JSON string)
     * @return Request
     * @throws \Exception — Jika QR invalid atau request tidak valid
     */
    public function scanQrCode(string $qrContent): Request
    {
        Log::info('SECURITY_SCAN_QR_START', [
            'security_id' => Auth::id(),
        ]);

        try {
            // Validate QR code
            $qrData = $this->qrCodeService->validateQrCode($qrContent);

            // Get request dengan relasi lengkap
            $request = Request::with([
                'vendor',
                'sikmDetail.items',
                'sikDetail',
                'approvalLogs.approver',
                'evidences'
            ])->findOrFail($qrData['request_id']);

            // Double check status (sudah di-check di validateQrCode, tapi untuk safety)
            if ($request->status !== 'APPROVED') {
                throw new \Exception('Request tidak bisa diproses. Status: ' . $request->status);
            }

            Log::info('SECURITY_SCAN_QR_SUCCESS', [
                'security_id' => Auth::id(),
                'request_id' => $request->id,
                'document_serial_no' => $request->document_serial_no,
            ]);

            return $request;

        } catch (\Exception $e) {
            Log::error('SECURITY_SCAN_QR_FAILED', [
                'security_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Scan by document serial number (manual input untuk testing)
     *
     * Apa yang dilakukan:
     * Cari request berdasarkan nomor seri dokumen dan validate status.
     *
     * Cara kerja:
     * 1. Cari request by document_serial_no
     * 2. Validate request exists
     * 3. Validate status APPROVED
     * 4. Log scan activity
     * 5. Return request data
     *
     * @param string $documentSerialNo — Nomor seri dokumen (contoh: 001518DD)
     * @return Request
     * @throws \Exception — Jika request tidak ditemukan atau status invalid
     */
    public function scanByDocumentSerialNo(string $documentSerialNo): Request
    {
        Log::info('SECURITY_SCAN_BY_SERIAL_START', [
            'security_id' => Auth::id(),
            'document_serial_no' => $documentSerialNo,
        ]);

        try {
            // Cari request by document_serial_no
            $request = Request::with([
                'vendor',
                'sikmDetail.items',
                'sikDetail',
                'approvalLogs.approver',
                'evidences'
            ])->where('document_serial_no', $documentSerialNo)->first();

            if (!$request) {
                throw new \Exception('Surat dengan nomor seri "' . $documentSerialNo . '" tidak ditemukan.');
            }

            // Validate status
            if ($request->status !== 'APPROVED') {
                throw new \Exception('Surat tidak bisa diproses. Status saat ini: ' . $request->status . '. Hanya surat dengan status APPROVED yang bisa di-scan.');
            }

            Log::info('SECURITY_SCAN_BY_SERIAL_SUCCESS', [
                'security_id' => Auth::id(),
                'request_id' => $request->id,
                'document_serial_no' => $request->document_serial_no,
            ]);

            return $request;

        } catch (\Exception $e) {
            Log::error('SECURITY_SCAN_BY_SERIAL_FAILED', [
                'security_id' => Auth::id(),
                'document_serial_no' => $documentSerialNo,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Upload evidence photos
     *
     * Apa yang dilakukan:
     * Upload foto evidence ke MinIO dan create records di request_evidences.
     *
     * Cara kerja:
     * 1. Validate request status (must be APPROVED)
     * 2. Validate max 5 photos
     * 3. Upload each photo ke MinIO
     * 4. Create request_evidence records
     * 5. Update request status ke EXECUTED
     * 6. Log activity
     *
     * @param string $requestId — UUID request
     * @param array $photos — Array of UploadedFile
     * @return array — Array of uploaded evidence paths
     * @throws \Exception — Jika upload gagal
     */
    public function uploadEvidence(string $requestId, array $photos): array
    {
        Log::info('SECURITY_UPLOAD_EVIDENCE_START', [
            'security_id' => Auth::id(),
            'request_id' => $requestId,
            'photo_count' => count($photos),
        ]);

        DB::beginTransaction();

        try {
            // Get request
            $request = Request::findOrFail($requestId);

            // Validate status
            if ($request->status !== 'APPROVED') {
                throw new \Exception('Request tidak bisa diproses. Status harus APPROVED.');
            }

            // Validate max 5 photos
            if (count($photos) > 5) {
                throw new \Exception('Maksimal 5 foto evidence per request.');
            }

            $uploadedPaths = [];
            $security = Auth::user();

            // Determine evidence type based on request type
            $evidenceType = match($request->request_type) {
                'LOADING_IN' => 'SECURITY_LOADING_IN',
                'LOADING_OUT' => 'SECURITY_LOADING_OUT',
                'IJIN_KERJA' => 'SIK_WORK_PROOF',
                default => 'SECURITY_LOADING_IN',
            };

            // Upload each photo
            foreach ($photos as $index => $photo) {
                // Upload ke MinIO
                $path = $this->storageService->uploadEvidencePhotos([$photo], $requestId);
                
                // Create evidence record
                RequestEvidence::create([
                    'request_id' => $request->id,
                    'uploaded_by' => $security->id,
                    'evidence_type' => $evidenceType,
                    'image_url' => $path[0], // uploadEvidencePhotos return array
                    'notes' => null,
                    'uploaded_at' => now(),
                ]);

                $uploadedPaths[] = $path[0];
            }

            // Update request status ke EXECUTED
            $request->update([
                'status' => 'EXECUTED',
            ]);

            DB::commit();

            // Dispatch event untuk mailing system
            RequestExecuted::dispatch($request, $security);

            Log::info('SECURITY_UPLOAD_EVIDENCE_SUCCESS', [
                'security_id' => $security->id,
                'request_id' => $request->id,
                'photo_count' => count($photos),
                'status_updated' => 'EXECUTED',
            ]);

            return $uploadedPaths;

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('SECURITY_UPLOAD_EVIDENCE_FAILED', [
                'security_id' => Auth::id(),
                'request_id' => $requestId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal upload evidence. ' . $e->getMessage());
        }
    }

    /**
     * Get request detail untuk security
     *
     * @param string $requestId — UUID request
     * @return Request
     */
    public function getRequestDetail(string $requestId): Request
    {
        try {
            return Request::with([
                'vendor',
                'sikmDetail.items',
                'sikDetail',
                'approvalLogs.approver',
                'evidences.uploader'
            ])->findOrFail($requestId);

        } catch (\Exception $e) {
            Log::error('SECURITY_GET_REQUEST_DETAIL_FAILED', [
                'security_id' => Auth::id(),
                'request_id' => $requestId,
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Request tidak ditemukan.');
        }
    }

    /**
     * Get scanned requests history untuk security
     *
     * @param int $perPage — Jumlah per halaman
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getScannedRequests(int $perPage = 15)
    {
        try {
            $security = Auth::user();

            // Get requests yang sudah di-scan oleh security ini (ada evidence)
            return Request::with(['vendor', 'evidences'])
                ->whereHas('evidences', function ($query) use ($security) {
                    $query->where('uploaded_by', $security->id);
                })
                ->orderBy('updated_at', 'desc')
                ->paginate($perPage);

        } catch (\Exception $e) {
            Log::error('SECURITY_GET_SCANNED_REQUESTS_FAILED', [
                'security_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            // Return empty paginator instead of collection
            return new \Illuminate\Pagination\LengthAwarePaginator(
                [],
                0,
                $perPage,
                1,
                ['path' => request()->url()]
            );
        }
    }

    /**
     * Get statistics untuk security dashboard
     *
     * @return array
     */
    public function getSecurityStatistics(): array
    {
        try {
            $security = Auth::user();

            // Count requests yang sudah di-scan hari ini
            $todayCount = RequestEvidence::where('uploaded_by', $security->id)
                ->whereDate('uploaded_at', today())
                ->distinct('request_id')
                ->count('request_id');

            // Count total requests yang sudah di-scan
            $totalCount = RequestEvidence::where('uploaded_by', $security->id)
                ->distinct('request_id')
                ->count('request_id');

            // Count requests yang ready untuk scan (status APPROVED)
            $readyCount = Request::where('status', 'APPROVED')->count();

            // Count requests yang sudah EXECUTED
            $executedCount = Request::where('status', 'EXECUTED')->count();

            return [
                'today' => $todayCount,
                'total' => $totalCount,
                'ready' => $readyCount,
                'executed' => $executedCount,
            ];

        } catch (\Exception $e) {
            Log::error('SECURITY_GET_STATISTICS_FAILED', [
                'security_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return [
                'today' => 0,
                'total' => 0,
                'ready' => 0,
                'executed' => 0,
            ];
        }
    }
}
