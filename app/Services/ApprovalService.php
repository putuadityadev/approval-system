<?php

namespace App\Services;

use App\Models\Request;
use App\Models\ApprovalLog;
use App\Events\RequestApproved;
use App\Events\RequestRejected;
use App\Services\Auth\AuditLogService;
use App\Services\QrCodeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * ApprovalService
 *
 * Service untuk mengelola approval workflow (state machine).
 *
 * Fungsi utama:
 * - Approve request (sequential: Dept → Ops → Finance → GM)
 * - Reject request (bisa di level manapun)
 * - Get pending requests untuk approver tertentu
 * - Get approval history
 *
 * Business rules:
 * - Approval harus sequential (tidak bisa skip level)
 * - Setiap approver hanya bisa approve request di level mereka
 * - Reject bisa dilakukan di level manapun
 * - Setelah reject, request tidak bisa di-approve lagi
 * - Setelah APPROVED (GM approve), QR code akan di-generate
 *
 * State Flow:
 * SUBMITTED → PENDING_DEPT → PENDING_OPS → PENDING_FINANCE → PENDING_GM → APPROVED
 *
 * Digunakan oleh: ApprovalController
 */
class ApprovalService
{
    protected $auditLogService;
    protected $qrCodeService;

    public function __construct(AuditLogService $auditLogService, QrCodeService $qrCodeService)
    {
        $this->auditLogService = $auditLogService;
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Approve request
     *
     * Apa yang dilakukan:
     * Approver menyetujui request dan memindahkan ke level berikutnya
     *
     * Cara kerja:
     * 1. Validasi approver role sesuai dengan status request
     * 2. Tentukan next status berdasarkan current status
     * 3. Update request status
     * 4. Create approval_log (APPROVED)
     * 5. Log audit trail
     * 6. Jika sudah APPROVED (GM approve), trigger QR code generation
     *
     * @param string $requestId — UUID request
     * @param string $notes — Catatan approver (optional)
     * @return Request
     * @throws \Exception — Jika approval gagal
     */
    public function approveRequest(string $requestId, ?string $notes = null): Request
    {
        Log::info('APPROVAL_APPROVE_START', [
            'request_id' => $requestId,
            'approver_id' => Auth::id(),
            'approver_role' => Auth::user()->role,
        ]);

        DB::beginTransaction();

        try {
            $request = Request::findOrFail($requestId);
            $approver = Auth::user();
            $currentStatus = $request->status;

            // Validasi: Apakah approver role sesuai dengan status request?
            $this->validateApproverRole($request, $approver);

            // Tentukan next status
            $nextStatus = $this->getNextStatus($currentStatus);

            // Update request status
            $request->update([
                'status' => $nextStatus,
            ]);

            // Create approval log
            ApprovalLog::create([
                'request_id' => $request->id,
                'approver_id' => $approver->id,
                'approver_role' => $approver->role,
                'action' => 'APPROVED',
                'from_status' => $currentStatus,
                'to_status' => $nextStatus,
                'notes' => $notes,
            ]);

            DB::commit();

            // Log audit trail
            $this->auditLogService->logApproveRequest($request, $approver, $notes);

            // Dispatch event untuk mailing system
            RequestApproved::dispatch($request, $approver, $currentStatus, $nextStatus, $notes);

            Log::info('APPROVAL_APPROVE_SUCCESS', [
                'request_id' => $request->id,
                'from_status' => $currentStatus,
                'to_status' => $nextStatus,
                'approver_id' => $approver->id,
            ]);

            // Jika status APPROVED, trigger QR code generation
            if ($nextStatus === 'APPROVED') {
                try {
                    $qrCodePath = $this->qrCodeService->generateQrCode($request->id);
                    
                    Log::info('APPROVAL_QR_CODE_GENERATED', [
                        'request_id' => $request->id,
                        'qr_code_path' => $qrCodePath,
                        'message' => 'Request fully approved, QR code generated successfully',
                    ]);
                } catch (\Exception $e) {
                    // QR generation failure tidak boleh mengganggu approval flow
                    // Log error tapi tetap return success
                    Log::error('APPROVAL_QR_CODE_GENERATION_FAILED', [
                        'request_id' => $request->id,
                        'error' => $e->getMessage(),
                        'message' => 'Approval success but QR code generation failed',
                    ]);
                }
            }

            return $request->load(['approvalLogs.approver', 'vendor']);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('APPROVAL_APPROVE_FAILED', [
                'request_id' => $requestId,
                'approver_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Reject request
     *
     * Apa yang dilakukan:
     * Approver menolak request dengan alasan
     *
     * Cara kerja:
     * 1. Validasi approver role sesuai dengan status request
     * 2. Update request status ke REJECTED
     * 3. Create approval_log (REJECTED)
     * 4. Log audit trail
     *
     * @param string $requestId — UUID request
     * @param string $reason — Alasan reject (required)
     * @return Request
     * @throws \Exception — Jika reject gagal
     */
    public function rejectRequest(string $requestId, string $reason): Request
    {
        Log::info('APPROVAL_REJECT_START', [
            'request_id' => $requestId,
            'approver_id' => Auth::id(),
            'approver_role' => Auth::user()->role,
        ]);

        DB::beginTransaction();

        try {
            $request = Request::findOrFail($requestId);
            $approver = Auth::user();
            $currentStatus = $request->status;

            // Validasi: Apakah approver role sesuai dengan status request?
            $this->validateApproverRole($request, $approver);

            // Update request status ke REJECTED
            $request->update([
                'status' => 'REJECTED',
            ]);

            // Create approval log
            ApprovalLog::create([
                'request_id' => $request->id,
                'approver_id' => $approver->id,
                'approver_role' => $approver->role,
                'action' => 'REJECTED',
                'from_status' => $currentStatus,
                'to_status' => 'REJECTED',
                'notes' => $reason,
            ]);

            DB::commit();

            // Log audit trail
            $this->auditLogService->logRejectRequest($request, $approver, $reason);

            // Dispatch event untuk mailing system
            RequestRejected::dispatch($request, $approver, $currentStatus, $reason);

            Log::info('APPROVAL_REJECT_SUCCESS', [
                'request_id' => $request->id,
                'from_status' => $currentStatus,
                'approver_id' => $approver->id,
                'reason' => $reason,
            ]);

            return $request->load(['approvalLogs.approver', 'vendor']);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('APPROVAL_REJECT_FAILED', [
                'request_id' => $requestId,
                'approver_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Get pending requests untuk approver tertentu
     *
     * Cara kerja:
     * 1. Tentukan status yang harus di-filter berdasarkan approver role
     * 2. Query requests dengan status tersebut
     * 3. Return dengan pagination
     *
     * Status mapping yang benar:
     * - approver_dept: approve request dengan status SUBMITTED
     * - approver_ops: approve request dengan status PENDING_OPS
     * - approver_finance: approve request dengan status PENDING_FINANCE
     * - approver_gm: approve request dengan status PENDING_GM
     *
     * @param string $approverRole — Role approver (approver_dept, approver_ops, dll)
     * @param int $perPage — Jumlah per halaman
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPendingRequests(string $approverRole, int $perPage = 15)
    {
        // Mapping role ke status yang harus di-approve
        $statusMap = [
            'approver_dept' => 'SUBMITTED',
            'approver_ops' => 'PENDING_OPS',
            'approver_finance' => 'PENDING_FINANCE',
            'approver_gm' => 'PENDING_GM',
        ];

        $status = $statusMap[$approverRole] ?? null;

        if (!$status) {
            throw new \Exception('Invalid approver role: ' . $approverRole);
        }

        return Request::with(['vendor', 'sikmDetail', 'sikDetail', 'approvalLogs'])
            ->where('status', $status)
            ->orderBy('created_at', 'asc') // FIFO: First In First Out
            ->paginate($perPage);
    }

    /**
     * Get approval history (semua request yang sudah di-approve/reject oleh approver)
     *
     * @param string $approverId — UUID approver
     * @param int $perPage — Jumlah per halaman
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getApprovalHistory(string $approverId, int $perPage = 15)
    {
        return ApprovalLog::with(['request.vendor', 'request.sikmDetail', 'request.sikDetail'])
            ->where('approver_id', $approverId)
            ->whereIn('action', ['APPROVED', 'REJECTED'])
            ->orderBy('action_date', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get statistics untuk approver dashboard
     *
     * Apa yang dilakukan:
     * Menghitung jumlah pending, approved, rejected, dan total approval
     *
     * Cara kerja:
     * 1. Hitung pending requests berdasarkan role approver
     * 2. Hitung approved count dari approval_logs
     * 3. Hitung rejected count dari approval_logs
     * 4. Total = approved + rejected
     *
     * @param string $approverId — UUID approver
     * @param string $approverRole — Role approver
     * @return array — ['pending' => int, 'approved' => int, 'rejected' => int, 'total' => int]
     */
    public function getApproverStatistics(string $approverId, string $approverRole): array
    {
        try {
            // Mapping role ke status untuk pending count
            $statusMap = [
                'approver_dept' => 'SUBMITTED',
                'approver_ops' => 'PENDING_OPS',
                'approver_finance' => 'PENDING_FINANCE',
                'approver_gm' => 'PENDING_GM',
            ];
            
            $pendingStatus = $statusMap[$approverRole] ?? null;
            
            // Count pending requests
            $pendingCount = $pendingStatus 
                ? Request::where('status', $pendingStatus)->count()
                : 0;
            
            // Count approved & rejected by this approver
            $approvedCount = ApprovalLog::where('approver_id', $approverId)
                ->where('action', 'APPROVED')
                ->count();
            
            $rejectedCount = ApprovalLog::where('approver_id', $approverId)
                ->where('action', 'REJECTED')
                ->count();
            
            $totalCount = $approvedCount + $rejectedCount;
            
            return [
                'pending' => $pendingCount,
                'approved' => $approvedCount,
                'rejected' => $rejectedCount,
                'total' => $totalCount,
            ];

        } catch (\Exception $e) {
            Log::error('APPROVAL_GET_STATISTICS_FAILED', [
                'approver_id' => $approverId,
                'approver_role' => $approverRole,
                'error' => $e->getMessage(),
            ]);

            return [
                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
                'total' => 0,
            ];
        }
    }

    /**
     * Validasi apakah approver role sesuai dengan status request
     *
     * Mapping yang benar:
     * - SUBMITTED → approver_dept
     * - PENDING_OPS → approver_ops
     * - PENDING_FINANCE → approver_finance
     * - PENDING_GM → approver_gm
     *
     * @param Request $request
     * @param \App\Models\User $approver
     * @throws \Exception — Jika role tidak sesuai
     */
    protected function validateApproverRole(Request $request, $approver): void
    {
        $validRoleMap = [
            'SUBMITTED' => 'approver_dept',
            'PENDING_OPS' => 'approver_ops',
            'PENDING_FINANCE' => 'approver_finance',
            'PENDING_GM' => 'approver_gm',
        ];

        $expectedRole = $validRoleMap[$request->status] ?? null;

        if (!$expectedRole) {
            throw new \Exception('Request tidak bisa di-approve. Status saat ini: ' . $request->status);
        }

        if ($approver->role !== $expectedRole) {
            throw new \Exception(
                'Anda tidak memiliki akses untuk approve request ini. ' .
                'Expected role: ' . $expectedRole . ', Your role: ' . $approver->role
            );
        }
    }

    /**
     * Tentukan next status berdasarkan current status
     *
     * Status Flow yang benar:
     * SUBMITTED → (Dept approve) → PENDING_OPS → (Ops approve) → PENDING_FINANCE → (Finance approve) → PENDING_GM → (GM approve) → APPROVED
     *
     * @param string $currentStatus
     * @return string
     * @throws \Exception — Jika status tidak valid
     */
    protected function getNextStatus(string $currentStatus): string
    {
        $statusFlow = [
            'SUBMITTED' => 'PENDING_OPS',           // Dept approve → Ops
            'PENDING_OPS' => 'PENDING_FINANCE',     // Ops approve → Finance
            'PENDING_FINANCE' => 'PENDING_GM',      // Finance approve → GM
            'PENDING_GM' => 'APPROVED',             // GM approve → Final
        ];

        $nextStatus = $statusFlow[$currentStatus] ?? null;

        if (!$nextStatus) {
            throw new \Exception('Invalid status transition from: ' . $currentStatus);
        }

        return $nextStatus;
    }
}
