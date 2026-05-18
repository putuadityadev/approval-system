<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Services\SecurityService;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

/**
 * SecurityController
 *
 * Controller untuk mengelola security verification workflow.
 *
 * Fungsi controller ini:
 * - Handle HTTP request untuk QR scan dan evidence upload
 * - Delegasi business logic ke SecurityService
 * - Return Inertia response untuk frontend
 *
 * Routes:
 * - GET /security/scanner — QR scanner page
 * - POST /security/scan — Process QR scan
 * - GET /security/requests/{id} — Request detail after scan
 * - POST /security/requests/{id}/evidence — Upload evidence photos
 * - GET /security/requests — List scanned requests (history)
 *
 * Digunakan oleh: Security role
 */
class SecurityController extends Controller
{
    protected $securityService;
    protected $qrCodeService;

    public function __construct(SecurityService $securityService, QrCodeService $qrCodeService)
    {
        $this->securityService = $securityService;
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Display QR scanner page
     *
     * GET /security/scanner
     */
    public function scanner(): Response
    {
        return Inertia::render('Security/Scanner');
    }

    /**
     * Process QR code scan
     *
     * POST /security/scan
     */
    public function scan(Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'qr_content' => 'required|string',
            ]);

            // Scan QR code
            $requestData = $this->securityService->scanQrCode($request->input('qr_content'));

            // Get QR code URL untuk display
            $qrCodeUrl = $this->qrCodeService->getQrCodeUrl($requestData->id);

            // Redirect ke request detail page
            return redirect()->route('security.requests.show', $requestData->id)
                ->with('success', 'QR code berhasil di-scan. Silakan upload foto evidence.');

        } catch (\Exception $e) {
            Log::error('SECURITY_SCAN_EXCEPTION', [
                'security_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'qr_scan' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Process scan by document serial number (manual input untuk testing)
     *
     * POST /security/scan-by-serial
     */
    public function scanBySerial(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'document_serial_no' => 'required|string|max:50',
            ], [
                'document_serial_no.required' => 'Nomor seri dokumen wajib diisi.',
                'document_serial_no.max' => 'Nomor seri dokumen maksimal 50 karakter.',
            ]);

            // Scan by document serial number
            $requestData = $this->securityService->scanByDocumentSerialNo($validated['document_serial_no']);

            // Redirect ke request detail page
            return redirect()->route('security.requests.show', $requestData->id)
                ->with('success', 'Surat berhasil ditemukan. Silakan upload foto evidence.');

        } catch (\Exception $e) {
            Log::error('SECURITY_SCAN_BY_SERIAL_EXCEPTION', [
                'security_id' => Auth::id(),
                'document_serial_no' => $request->input('document_serial_no'),
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'document_serial_no' => $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Show request detail after scan
     *
     * GET /security/requests/{id}
     */
    public function show(string $id)
    {
        try {
            $request = $this->securityService->getRequestDetail($id);
            
            // Get QR code URL
            $qrCodeUrl = $this->qrCodeService->getQrCodeUrl($request->id);

            // Get form image URL untuk preview surat
            $formImageUrl = null;
            if ($request->original_form_image) {
                $storageService = app(\App\Services\StorageService::class);
                $formImageUrl = $storageService->getFileUrl($request->original_form_image);
            }

            // Generate presigned URL for each evidence photo
            // The model stores MinIO path in image_url, browser needs a real URL (photo_url)
            $storageService = app(\App\Services\StorageService::class);
            $request->evidences->each(function ($evidence) use ($storageService) {
                $evidence->photo_url = $evidence->image_url
                    ? $storageService->getFileUrl($evidence->image_url)
                    : null;
            });

            // Check apakah sudah ada evidence (sudah di-upload)
            $hasEvidence = $request->evidences->count() > 0;

            return Inertia::render('Security/RequestDetail', [
                'request' => $request,
                'qrCodeUrl' => $qrCodeUrl,
                'formImageUrl' => $formImageUrl,
                'hasEvidence' => $hasEvidence,
            ]);

        } catch (\Exception $e) {
            Log::error('SECURITY_SHOW_EXCEPTION', [
                'security_id' => Auth::id(),
                'request_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('security.scanner')
                ->with('error', 'Request tidak ditemukan atau terjadi kesalahan.');
        }
    }

    /**
     * Upload evidence photos
     *
     * POST /security/requests/{id}/evidence
     */
    public function uploadEvidence(Request $request, string $id)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'photos' => 'required|array|max:5',
                'photos.*' => 'required|image|mimes:jpeg,jpg,png|max:5120', // 5MB
            ], [
                'photos.required' => 'Minimal 1 foto evidence harus diupload.',
                'photos.max' => 'Maksimal 5 foto evidence per request.',
                'photos.*.image' => 'File harus berupa gambar.',
                'photos.*.mimes' => 'Format gambar harus JPEG, JPG, atau PNG.',
                'photos.*.max' => 'Ukuran gambar maksimal 5MB.',
            ]);

            // Upload evidence
            $uploadedPaths = $this->securityService->uploadEvidence($id, $validated['photos']);

            return redirect()->route('security.requests.show', $id)
                ->with('success', count($uploadedPaths) . ' foto evidence berhasil diupload. Status request diupdate ke EXECUTED.');

        } catch (\Exception $e) {
            Log::error('SECURITY_UPLOAD_EVIDENCE_EXCEPTION', [
                'security_id' => Auth::id(),
                'request_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'upload' => $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Display list of scanned requests (history)
     *
     * GET /security/requests
     */
    public function index(): Response
    {
        try {
            $requests = $this->securityService->getScannedRequests(15);

            return Inertia::render('Security/Requests/Index', [
                'requests' => $requests,
            ]);

        } catch (\Exception $e) {
            Log::error('SECURITY_INDEX_EXCEPTION', [
                'security_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            // Return empty paginator on error
            $emptyPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
                [],
                0,
                15,
                1,
                ['path' => request()->url()]
            );

            return Inertia::render('Security/Requests/Index', [
                'requests' => $emptyPaginator,
            ]);
        }
    }

    /**
     * Display security dashboard dengan statistics
     *
     * GET /security/dashboard
     */
    public function dashboard(): Response
    {
        try {
            $stats = $this->securityService->getSecurityStatistics();
            $recentScans = $this->securityService->getScannedRequests(3);

            return Inertia::render('Security/Dashboard', [
                'stats' => $stats,
                'recentScans' => $recentScans->items(),
            ]);

        } catch (\Exception $e) {
            Log::error('SECURITY_DASHBOARD_EXCEPTION', [
                'security_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return Inertia::render('Security/Dashboard', [
                'stats' => [
                    'today' => 0,
                    'total' => 0,
                    'ready' => 0,
                    'executed' => 0,
                ],
                'recentScans' => [],
            ]);
        }
    }

    /**
     * Display security profile
     *
     * GET /security/profile
     */
    public function profile(): Response
    {
        return Inertia::render('Security/Profile', [
            'user' => Auth::user()
        ]);
    }

    /**
     * Update password
     *
     * POST /security/profile/password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password berhasil diperbarui.');
    }
}
