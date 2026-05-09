<?php

namespace App\Http\Controllers\Approver;

use App\Http\Controllers\Controller;
use App\Http\Requests\Approver\ApproveRequestRequest;
use App\Http\Requests\Approver\RejectRequestRequest;
use App\Models\ApprovalLog;
use App\Services\ApprovalService;
use App\Services\RequestService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * ApprovalController
 *
 * Controller untuk mengelola approval workflow.
 *
 * Fungsi controller ini:
 * - Handle HTTP request untuk approve/reject surat
 * - Delegasi business logic ke ApprovalService
 * - Return Inertia response untuk frontend
 *
 * Cara kerja:
 * 1. Terima HTTP request dari frontend
 * 2. Validasi via Form Request
 * 3. Delegasi ke ApprovalService
 * 4. Return response (redirect atau Inertia page)
 *
 * Routes:
 * - GET /approver/requests — List pending requests
 * - GET /approver/requests/{id} — Detail request
 * - POST /approver/requests/{id}/approve — Approve request
 * - POST /approver/requests/{id}/reject — Reject request
 * - GET /approver/history — Approval history
 *
 * Digunakan oleh: Approver roles (dept, ops, finance, gm)
 */
class ApprovalController extends Controller
{
    protected $approvalService;
    protected $requestService;

    public function __construct(
        ApprovalService $approvalService,
        RequestService $requestService
    ) {
        $this->approvalService = $approvalService;
        $this->requestService = $requestService;
    }

    /**
     * Display list of pending requests untuk approver
     *
     * GET /approver/requests
     */
    public function index()
    {
        try {
            $approver = Auth::user();
            
            // Get pending requests berdasarkan approver role
            $requests = $this->approvalService->getPendingRequests($approver->role, 15);

            // Mapping role ke label yang lebih friendly
            $roleLabels = [
                'approver_dept' => 'Department',
                'approver_ops' => 'Operations',
                'approver_finance' => 'Finance',
                'approver_gm' => 'GM',
            ];
            
            $roleLabel = $roleLabels[$approver->role] ?? $approver->role;

            return Inertia::render('Approver/Requests/Index', [
                'requests' => $requests,
                'roleLabel' => $roleLabel,
            ]);

        } catch (\Exception $e) {
            Log::error('APPROVER_REQUEST_INDEX_EXCEPTION', [
                'approver_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('approver.dashboard')
                ->with('error', 'Terjadi kesalahan saat memuat data. Silakan coba lagi.');
        }
    }

    /**
     * Show request detail untuk approver
     *
     * GET /approver/requests/{id}
     */
    public function show($id)
    {
        try {
            $request = $this->requestService->getRequestDetail($id);
            $approver = Auth::user();

            // Mapping role ke label
            $roleLabels = [
                'approver_dept' => 'Department',
                'approver_ops' => 'Operations',
                'approver_finance' => 'Finance',
                'approver_gm' => 'GM',
            ];
            
            $roleLabel = $roleLabels[$approver->role] ?? $approver->role;

            // Check apakah approver bisa approve request ini
            $canApprove = $this->canApproveRequest($request, $approver);

            return Inertia::render('Approver/Requests/Detail', [
                'request' => $request,
                'roleLabel' => $roleLabel,
                'canApprove' => $canApprove,
            ]);

        } catch (\Exception $e) {
            Log::error('APPROVER_REQUEST_SHOW_EXCEPTION', [
                'approver_id' => Auth::id(),
                'request_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('approver.requests.index')
                ->with('error', 'Request tidak ditemukan atau terjadi kesalahan.');
        }
    }

    /**
     * Approve request
     *
     * POST /approver/requests/{id}/approve
     */
    public function approve(ApproveRequestRequest $request, $id)
    {
        try {
            $approvedRequest = $this->approvalService->approveRequest(
                $id,
                $request->input('notes')
            );

            return redirect()->route('approver.requests.show', $id)
                ->with('success', 'Surat berhasil disetujui dan diteruskan ke level berikutnya.');

        } catch (\Exception $e) {
            Log::error('APPROVER_APPROVE_EXCEPTION', [
                'approver_id' => Auth::id(),
                'request_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'approve' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Reject request
     *
     * POST /approver/requests/{id}/reject
     */
    public function reject(RejectRequestRequest $request, $id)
    {
        try {
            $rejectedRequest = $this->approvalService->rejectRequest(
                $id,
                $request->input('reason')
            );

            return redirect()->route('approver.requests.show', $id)
                ->with('success', 'Surat berhasil ditolak.');

        } catch (\Exception $e) {
            Log::error('APPROVER_REJECT_EXCEPTION', [
                'approver_id' => Auth::id(),
                'request_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'reject' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Show approval history
     *
     * GET /approver/history
     */
    public function history()
    {
        try {
            $approver = Auth::user();
            
            // Get approval history
            $approvals = $this->approvalService->getApprovalHistory($approver->id, 15);

            // Mapping role ke label
            $roleLabels = [
                'approver_dept' => 'Department',
                'approver_ops' => 'Operations',
                'approver_finance' => 'Finance',
                'approver_gm' => 'GM',
            ];
            
            $roleLabel = $roleLabels[$approver->role] ?? $approver->role;

            return Inertia::render('Approver/Requests/History', [
                'approvals' => $approvals,
                'roleLabel' => $roleLabel,
            ]);

        } catch (\Exception $e) {
            Log::error('APPROVER_HISTORY_EXCEPTION', [
                'approver_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('approver.dashboard')
                ->with('error', 'Terjadi kesalahan saat memuat data. Silakan coba lagi.');
        }
    }

    /**
     * Display approver dashboard dengan statistics dan recent activity
     *
     * GET /approver/dashboard
     */
    public function dashboard()
    {
        try {
            $user = Auth::user();
            
            // Mapping role ke label yang lebih friendly
            $roleLabels = [
                'approver_dept' => 'Department',
                'approver_ops' => 'Operations',
                'approver_finance' => 'Finance',
                'approver_gm' => 'GM',
            ];
            
            $roleLabel = $roleLabels[$user->role] ?? $user->role;
            
            // Get statistics
            $stats = $this->approvalService->getApproverStatistics($user->id, $user->role);
            
            // Get recent approvals (last 5)
            $recentApprovals = ApprovalLog::with(['request.vendor'])
                ->where('approver_id', $user->id)
                ->whereIn('action', ['APPROVED', 'REJECTED'])
                ->orderBy('action_date', 'desc')
                ->limit(5)
                ->get();
            
            return Inertia::render('Approver/Dashboard', [
                'roleLabel' => $roleLabel,
                'stats' => $stats,
                'recentApprovals' => $recentApprovals,
            ]);

        } catch (\Exception $e) {
            Log::error('APPROVER_DASHBOARD_EXCEPTION', [
                'approver_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return Inertia::render('Approver/Dashboard', [
                'roleLabel' => 'Approver',
                'stats' => [
                    'pending' => 0,
                    'approved' => 0,
                    'rejected' => 0,
                    'total' => 0,
                ],
                'recentApprovals' => [],
            ]);
        }
    }

    /**
     * Check apakah approver bisa approve request ini
     *
     * @param \App\Models\Request $request
     * @param \App\Models\User $approver
     * @return bool
     */
    protected function canApproveRequest($request, $approver): bool
    {
        $validRoleMap = [
            'SUBMITTED' => 'approver_dept',
            'PENDING_DEPT' => 'approver_ops',
            'PENDING_OPS' => 'approver_finance',
            'PENDING_FINANCE' => 'approver_gm',
        ];

        $expectedRole = $validRoleMap[$request->status] ?? null;

        return $expectedRole === $approver->role;
    }
}
