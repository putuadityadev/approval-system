<?php

namespace App\Services;

use App\Models\Request;
use App\Models\ApprovalLog;
use App\Services\Auth\AuditLogService;
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

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
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
     * @param int $requestId
     * @param string $notes — Catatan approver (optional)
     * @return Request
     * @throws \Exception — Jika approval gagal
     */
    public function approveRequest(int $requestId, ?string $notes = null): Request
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

            Log::info('APPROVAL_APPROVE_SUCCESS', [
                'request_id' => $request->id,
                'from_status' => $currentStatus,
                'to_status' => $nextStatus,
                'approver_id' => $approver->id,
            ]);

            // TODO: Jika status APPROVED, trigger QR code generation (Sprint 4)
            if ($nextStatus === 'APPROVED') {
                Log::info('APPROVAL_FINAL_APPROVED', [
                    'request_id' => $request->id,
                    'message' => 'Request fully approved, ready for QR code generation',
                ]);
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
     * @param int $requestId
     * @param string $reason — Alasan reject (required)
     * @return Request
     * @throws \Exception — Jika reject gagal
     */
    public function rejectRequest(int $requestId, string $reason): Request
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
     * @param string $approverRole — Role approver (approver_dept, approver_ops, dll)
     * @param int $perPage — Jumlah per halaman
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPendingRequests(string $approverRole, int $perPage = 15)
    {
        // Mapping role ke status yang harus di-approve
        $statusMap = [
            'approver_dept' => 'SUBMITTED',
            'approver_ops' => 'PENDING_DEPT',
            'approver_finance' => 'PENDING_OPS',
            'approver_gm' => 'PENDING_FINANCE',
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
     * @param int $approverId — ID approver
     * @param int $perPage — Jumlah per halaman
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getApprovalHistory(int $approverId, int $perPage = 15)
    {
        return ApprovalLog::with(['request.vendor', 'request.sikmDetail', 'request.sikDetail'])
            ->where('approver_id', $approverId)
            ->whereIn('action', ['APPROVED', 'REJECTED'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Validasi apakah approver role sesuai dengan status request
     *
     * @param Request $request
     * @param \App\Models\User $approver
     * @throws \Exception — Jika role tidak sesuai
     */
    protected function validateApproverRole(Request $request, $approver): void
    {
        $validRoleMap = [
            'SUBMITTED' => 'approver_dept',
            'PENDING_DEPT' => 'approver_ops',
            'PENDING_OPS' => 'approver_finance',
            'PENDING_FINANCE' => 'approver_gm',
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
     * @param string $currentStatus
     * @return string
     * @throws \Exception — Jika status tidak valid
     */
    protected function getNextStatus(string $currentStatus): string
    {
        $statusFlow = [
            'SUBMITTED' => 'PENDING_DEPT',
            'PENDING_DEPT' => 'PENDING_OPS',
            'PENDING_OPS' => 'PENDING_FINANCE',
            'PENDING_FINANCE' => 'PENDING_GM',
            'PENDING_GM' => 'APPROVED',
        ];

        $nextStatus = $statusFlow[$currentStatus] ?? null;

        if (!$nextStatus) {
            throw new \Exception('Invalid status transition from: ' . $currentStatus);
        }

        return $nextStatus;
    }
}
