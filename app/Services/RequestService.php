<?php

namespace App\Services;

use App\Models\Request;
use App\Models\SikmDetail;
use App\Models\SikmItem;
use App\Models\SikDetail;
use App\Models\ApprovalLog;
use App\Events\RequestSubmitted;
use App\Events\RequestCancelled;
use App\Services\Auth\AuditLogService;
use App\Services\StorageService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * RequestService
 *
 * Service untuk mengelola request/surat (SIK & SIKMB).
 *
 * Fungsi utama:
 * - Submit surat SIKMB (barang masuk/keluar)
 * - Submit surat SIK (izin kerja)
 * - View own requests (vendor)
 * - Cancel request (vendor)
 *
 * Business rules:
 * - Vendor hanya bisa submit jika punya vendor record
 * - Document serial number harus unique
 * - SIKMB harus punya minimal 1 item
 * - Status awal: SUBMITTED (langsung masuk approval flow)
 *
 * Digunakan oleh: RequestController
 */
class RequestService
{
    protected $auditLogService;
    protected $storageService;

    public function __construct(
        AuditLogService $auditLogService,
        StorageService $storageService
    ) {
        $this->auditLogService = $auditLogService;
        $this->storageService = $storageService;
    }

    /**
     * Submit surat SIKMB (Surat Izin Keluar/Masuk Barang)
     *
     * Apa yang dilakukan:
     * Submit surat untuk barang masuk/keluar dengan detail barang
     *
     * Cara kerja:
     * 1. Validasi vendor_id dari user yang login
     * 2. Upload foto form fisik ke MinIO (jika ada)
     * 3. Create request dengan status SUBMITTED
     * 4. Create sikmb_details
     * 5. Create sikmb_items (loop untuk setiap barang)
     * 6. Create approval_log (SUBMITTED)
     * 7. Log audit trail
     * 8. Return request object
     *
     * @param array $data — Data dari SubmitSikmRequest
     * @return Request
     * @throws \Exception — Jika submit gagal
     */
    public function submitSikmb(array $data): Request
    {
        Log::info('REQUEST_SUBMIT_SIKMB_START', [
            'user_id' => Auth::id(),
            'vendor_id' => $data['vendor_id'],
            'request_type' => $data['request_type'],
        ]);

        DB::beginTransaction();

        try {
            // Upload form image jika ada
            $formImagePath = null;
            if (isset($data['original_form_image'])) {
                $formImagePath = $this->storageService->uploadRequestForm(
                    $data['original_form_image'],
                    0 // Temporary, akan diupdate setelah request dibuat
                );
            }

            // Create request
            $request = Request::create([
                'vendor_id' => $data['vendor_id'],
                'request_type' => $data['request_type'],
                'status' => 'SUBMITTED',
                'sop_form_code' => $data['sop_form_code'] ?? null,
                'document_serial_no' => $data['document_serial_no'],
                'original_form_image' => $formImagePath,
            ]);

            // Update form image path dengan request_id yang benar
            if ($formImagePath) {
                $newPath = $this->storageService->uploadRequestForm(
                    $data['original_form_image'],
                    $request->id
                );
                $request->update(['original_form_image' => $newPath]);
                
                // Delete temporary file
                if ($formImagePath !== $newPath) {
                    $this->storageService->deleteFile($formImagePath);
                }
            }

            // Create SIKMB details
            $sikmDetail = SikmDetail::create([
                'request_id' => $request->id,
                'origin_floor' => $data['origin_floor'] ?? null,
                'origin_unit' => $data['origin_unit'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'dest_address' => $data['dest_address'],
                'dest_floor' => $data['dest_floor'] ?? null,
                'dest_phone' => $data['dest_phone'],
            ]);

            // Create SIKMB items
            foreach ($data['items'] as $itemData) {
                SikmItem::create([
                    'sikmb_detail_id' => $sikmDetail->id,
                    'item_name' => $itemData['item_name'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'],
                    'remarks' => $itemData['remarks'] ?? null,
                ]);
            }

            // Create approval log (SUBMITTED)
            ApprovalLog::create([
                'request_id' => $request->id,
                'approver_id' => Auth::id(),
                'approver_role' => 'vendor',
                'action' => 'SUBMITTED',
                'from_status' => 'DRAFT',
                'to_status' => 'SUBMITTED',
                'notes' => 'Surat diajukan oleh vendor',
            ]);

            DB::commit();

            // Log audit trail (tidak throw exception jika gagal)
            $this->auditLogService->logSubmitRequest($request, Auth::user());

            // Dispatch event untuk mailing system
            RequestSubmitted::dispatch($request);

            Log::info('REQUEST_SUBMIT_SIKMB_SUCCESS', [
                'request_id' => $request->id,
                'vendor_id' => $request->vendor_id,
                'document_serial_no' => $request->document_serial_no,
                'items_count' => count($data['items']),
            ]);

            return $request->load(['sikmDetail.items', 'vendor']);

        } catch (\Exception $e) {
            DB::rollBack();

            // Delete uploaded file jika ada
            if (isset($formImagePath) && $formImagePath) {
                try {
                    $this->storageService->deleteFile($formImagePath);
                } catch (\Exception $deleteError) {
                    Log::warning('REQUEST_DELETE_FORM_IMAGE_FAILED', [
                        'path' => $formImagePath,
                        'error' => $deleteError->getMessage(),
                    ]);
                }
            }

            Log::error('REQUEST_SUBMIT_SIKMB_FAILED', [
                'user_id' => Auth::id(),
                'vendor_id' => $data['vendor_id'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal submit surat SIKMB. ' . $e->getMessage());
        }
    }

    /**
     * Submit surat SIK (Surat Izin Kerja)
     *
     * Apa yang dilakukan:
     * Submit surat untuk izin kerja dengan detail pekerjaan
     *
     * Cara kerja:
     * 1. Validasi vendor_id dari user yang login
     * 2. Upload foto form fisik ke MinIO (jika ada)
     * 3. Create request dengan status SUBMITTED
     * 4. Create sik_details
     * 5. Create approval_log (SUBMITTED)
     * 6. Log audit trail
     * 7. Return request object
     *
     * @param array $data — Data dari SubmitSikRequest
     * @return Request
     * @throws \Exception — Jika submit gagal
     */
    public function submitSik(array $data): Request
    {
        Log::info('REQUEST_SUBMIT_SIK_START', [
            'user_id' => Auth::id(),
            'vendor_id' => $data['vendor_id'],
        ]);

        DB::beginTransaction();

        try {
            // Upload form image jika ada
            $formImagePath = null;
            if (isset($data['original_form_image'])) {
                $formImagePath = $this->storageService->uploadRequestForm(
                    $data['original_form_image'],
                    0 // Temporary
                );
            }

            // Create request
            $request = Request::create([
                'vendor_id' => $data['vendor_id'],
                'request_type' => 'IJIN_KERJA',
                'status' => 'SUBMITTED',
                'sop_form_code' => $data['sop_form_code'] ?? null,
                'document_serial_no' => $data['document_serial_no'],
                'original_form_image' => $formImagePath,
            ]);

            // Update form image path
            if ($formImagePath) {
                $newPath = $this->storageService->uploadRequestForm(
                    $data['original_form_image'],
                    $request->id
                );
                $request->update(['original_form_image' => $newPath]);
                
                if ($formImagePath !== $newPath) {
                    $this->storageService->deleteFile($formImagePath);
                }
            }

            // Create SIK details
            SikDetail::create([
                'request_id' => $request->id,
                'worker_count' => $data['worker_count'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'location' => $data['location'],
                'job_type' => $data['job_type'],
                'description' => $data['description'] ?? null,
            ]);

            // Create approval log
            ApprovalLog::create([
                'request_id' => $request->id,
                'approver_id' => Auth::id(),
                'approver_role' => 'vendor',
                'action' => 'SUBMITTED',
                'from_status' => 'DRAFT',
                'to_status' => 'SUBMITTED',
                'notes' => 'Surat diajukan oleh vendor',
            ]);

            DB::commit();

            // Log audit trail
            $this->auditLogService->logSubmitRequest($request, Auth::user());

            // Dispatch event untuk mailing system
            RequestSubmitted::dispatch($request);

            Log::info('REQUEST_SUBMIT_SIK_SUCCESS', [
                'request_id' => $request->id,
                'vendor_id' => $request->vendor_id,
                'document_serial_no' => $request->document_serial_no,
                'worker_count' => $data['worker_count'],
            ]);

            return $request->load(['sikDetail', 'vendor']);

        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($formImagePath) && $formImagePath) {
                try {
                    $this->storageService->deleteFile($formImagePath);
                } catch (\Exception $deleteError) {
                    Log::warning('REQUEST_DELETE_FORM_IMAGE_FAILED', [
                        'path' => $formImagePath,
                        'error' => $deleteError->getMessage(),
                    ]);
                }
            }

            Log::error('REQUEST_SUBMIT_SIK_FAILED', [
                'user_id' => Auth::id(),
                'vendor_id' => $data['vendor_id'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal submit surat SIK. ' . $e->getMessage());
        }
    }

    /**
     * Get vendor's own requests dengan pagination
     *
     * @param string $vendorId — UUID vendor
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getVendorRequests(string $vendorId, int $perPage = 15)
    {
        return Request::with(['sikmDetail', 'sikDetail', 'approvalLogs'])
            ->byVendor($vendorId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get request detail by ID
     *
     * @param string $requestId — UUID request
     * @return Request
     * @throws \Exception — Jika request tidak ditemukan
     */
    public function getRequestDetail(string $requestId): Request
    {
        $request = Request::with([
            'vendor.user',
            'sikmDetail.items',
            'sikDetail',
            'approvalLogs.approver',
            'evidences.uploader'
        ])->find($requestId);

        if (!$request) {
            throw new \Exception('Request tidak ditemukan.');
        }

        return $request;
    }

    /**
     * Cancel request (vendor only)
     *
     * Apa yang dilakukan:
     * Vendor membatalkan surat yang sudah disubmit
     *
     * Cara kerja:
     * 1. Check apakah request bisa dicancel (status SUBMITTED atau PENDING_*)
     * 2. Update status ke CANCELLED
     * 3. Create approval_log (CANCELLED)
     * 4. Log audit trail
     *
     * @param string $requestId — UUID request
     * @param string $reason
     * @return Request
     * @throws \Exception — Jika cancel gagal
     */
    public function cancelRequest(string $requestId, string $reason): Request
    {
        Log::info('REQUEST_CANCEL_START', [
            'request_id' => $requestId,
            'user_id' => Auth::id(),
        ]);

        DB::beginTransaction();

        try {
            $request = Request::findOrFail($requestId);

            // Check if can cancel
            if (!$request->canCancel()) {
                throw new \Exception('Request tidak bisa dibatalkan. Status saat ini: ' . $request->status);
            }

            $oldStatus = $request->status;

            // Update status
            $request->update([
                'status' => 'CANCELLED',
                'cancelled_reason' => $reason,
            ]);

            // Create approval log
            ApprovalLog::create([
                'request_id' => $request->id,
                'approver_id' => Auth::id(),
                'approver_role' => 'vendor',
                'action' => 'CANCELLED',
                'from_status' => $oldStatus,
                'to_status' => 'CANCELLED',
                'notes' => $reason,
            ]);

            DB::commit();

            // Log audit trail
            $this->auditLogService->logCancelRequest($request, Auth::user(), $reason);

            // Dispatch event untuk mailing system
            RequestCancelled::dispatch($request, $oldStatus, $reason);

            Log::info('REQUEST_CANCEL_SUCCESS', [
                'request_id' => $request->id,
                'from_status' => $oldStatus,
                'reason' => $reason,
            ]);

            return $request->load(['approvalLogs']);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('REQUEST_CANCEL_FAILED', [
                'request_id' => $requestId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal cancel request. ' . $e->getMessage());
        }
    }
}
