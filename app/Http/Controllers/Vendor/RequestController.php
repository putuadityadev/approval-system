<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\SubmitSikmRequest;
use App\Http\Requests\Vendor\SubmitSikRequest;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * RequestController
 *
 * Controller untuk mengelola request/surat vendor.
 *
 * Fungsi controller ini:
 * - Handle HTTP request untuk submit surat
 * - Delegasi business logic ke RequestService
 * - Return Inertia response untuk frontend
 *
 * Cara kerja:
 * 1. Terima HTTP request dari frontend
 * 2. Validasi via Form Request
 * 3. Delegasi ke RequestService
 * 4. Return response (redirect atau Inertia page)
 *
 * Routes:
 * - GET /vendor/requests — List requests
 * - GET /vendor/requests/create — Form pilih tipe surat
 * - GET /vendor/requests/create/sikmb — Form SIKMB
 * - POST /vendor/requests/sikmb — Submit SIKMB
 * - GET /vendor/requests/create/sik — Form SIK
 * - POST /vendor/requests/sik — Submit SIK
 * - GET /vendor/requests/{id} — Detail request
 * - POST /vendor/requests/{id}/cancel — Cancel request
 *
 * Digunakan oleh: Vendor role
 */
class RequestController extends Controller
{
    protected $requestService;

    public function __construct(RequestService $requestService)
    {
        $this->requestService = $requestService;
    }

    /**
     * Vendor Dashboard
     *
     * Menampilkan dashboard vendor dengan statistik dan recent submissions.
     *
     * Cara kerja:
     * 1. Ambil data vendor dari user yang login
     * 2. Hitung statistik request berdasarkan status
     * 3. Ambil 5 request terakhir
     * 4. Return Inertia page dengan data statistik dan recent requests
     *
     * GET /vendor/dashboard
     */
    public function dashboard()
    {
        try {
            $vendor = Auth::user()->vendor;
            
            if (!$vendor) {
                return redirect()->route('login')
                    ->with('error', 'Data vendor tidak ditemukan. Silakan hubungi admin.');
            }

            // Hitung statistik berdasarkan status
            $statistics = [
                'pending' => \App\Models\Request::byVendor($vendor->id)
                    ->whereIn('status', ['SUBMITTED', 'PENDING_DEPT', 'PENDING_OPS', 'PENDING_FINANCE', 'PENDING_GM'])
                    ->count(),
                'approved' => \App\Models\Request::byVendor($vendor->id)
                    ->where('status', 'APPROVED')
                    ->count(),
                'rejected' => \App\Models\Request::byVendor($vendor->id)
                    ->where('status', 'REJECTED')
                    ->count(),
                'total' => \App\Models\Request::byVendor($vendor->id)->count(),
            ];

            // Ambil 5 request terakhir
            $recentRequests = \App\Models\Request::with(['sikmDetail', 'sikDetail'])
                ->byVendor($vendor->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return Inertia::render('Vendor/Dashboard', [
                'auth' => [
                    'user' => Auth::user()->load('vendor'),
                ],
                'statistics' => $statistics,
                'recentRequests' => $recentRequests,
            ]);

        } catch (\Exception $e) {
            Log::error('VENDOR_DASHBOARD_EXCEPTION', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('login')
                ->with('error', 'Terjadi kesalahan saat memuat dashboard. Silakan coba lagi.');
        }
    }

    /**
     * Display list of vendor's requests
     *
     * GET /vendor/requests
     */
    public function index(Request $request)
    {
        try {
            $vendor = Auth::user()->vendor;
            
            if (!$vendor) {
                return redirect()->route('vendor.dashboard')
                    ->with('error', 'Data vendor tidak ditemukan. Silakan hubungi admin.');
            }

            $requests = $this->requestService->getVendorRequests($vendor->id, 15);

            return Inertia::render('Vendor/Requests/Index', [
                'requests' => $requests,
                'vendor' => $vendor,
            ]);

        } catch (\Exception $e) {
            Log::error('VENDOR_REQUEST_INDEX_EXCEPTION', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('vendor.dashboard')
                ->with('error', 'Terjadi kesalahan saat memuat data. Silakan coba lagi.');
        }
    }

    /**
     * Show form to choose request type
     *
     * GET /vendor/requests/create
     */
    public function create()
    {
        $vendor = Auth::user()->vendor;
        
        if (!$vendor) {
            return redirect()->route('vendor.dashboard')
                ->with('error', 'Data vendor tidak ditemukan. Silakan hubungi admin.');
        }

        return Inertia::render('Vendor/Requests/Create', [
            'vendor' => $vendor,
        ]);
    }

    /**
     * Show SIKMB form
     *
     * GET /vendor/requests/create/sikmb
     */
    public function createSikmb(Request $request)
    {
        $vendor = Auth::user()->vendor;
        
        if (!$vendor) {
            return redirect()->route('vendor.dashboard')
                ->with('error', 'Data vendor tidak ditemukan. Silakan hubungi admin.');
        }

        $requestType = $request->query('type', 'LOADING_IN');

        return Inertia::render('Vendor/Requests/CreateSikmb', [
            'vendor' => $vendor,
            'requestType' => $requestType,
        ]);
    }

    /**
     * Submit SIKMB
     *
     * POST /vendor/requests/sikmb
     */
    public function storeSikmb(SubmitSikmRequest $request)
    {
        try {
            $vendor = Auth::user()->vendor;
            
            if (!$vendor) {
                return back()->withErrors([
                    'vendor' => 'Data vendor tidak ditemukan. Silakan hubungi admin.',
                ])->withInput();
            }

            // Merge vendor_id ke request data
            $data = array_merge($request->validated(), [
                'vendor_id' => $vendor->id,
            ]);

            $submittedRequest = $this->requestService->submitSikmb($data);

            return redirect()->route('vendor.requests.show', $submittedRequest->id)
                ->with('success', 'Surat SIKMB berhasil diajukan! Menunggu approval dari Departemen.');

        } catch (\Exception $e) {
            Log::error('VENDOR_STORE_SIKMB_EXCEPTION', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'submit' => 'Gagal submit surat. ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Show SIK form
     *
     * GET /vendor/requests/create/sik
     */
    public function createSik()
    {
        $vendor = Auth::user()->vendor;
        
        if (!$vendor) {
            return redirect()->route('vendor.dashboard')
                ->with('error', 'Data vendor tidak ditemukan. Silakan hubungi admin.');
        }

        return Inertia::render('Vendor/Requests/CreateSik', [
            'vendor' => $vendor,
        ]);
    }

    /**
     * Submit SIK
     *
     * POST /vendor/requests/sik
     */
    public function storeSik(SubmitSikRequest $request)
    {
        try {
            $vendor = Auth::user()->vendor;
            
            if (!$vendor) {
                return back()->withErrors([
                    'vendor' => 'Data vendor tidak ditemukan. Silakan hubungi admin.',
                ])->withInput();
            }

            // Merge vendor_id ke request data
            $data = array_merge($request->validated(), [
                'vendor_id' => $vendor->id,
            ]);

            $submittedRequest = $this->requestService->submitSik($data);

            return redirect()->route('vendor.requests.show', $submittedRequest->id)
                ->with('success', 'Surat SIK berhasil diajukan! Menunggu approval dari Departemen.');

        } catch (\Exception $e) {
            Log::error('VENDOR_STORE_SIK_EXCEPTION', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'submit' => 'Gagal submit surat. ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Show request detail
     *
     * GET /vendor/requests/{id}
     */
    public function show($id)
    {
        try {
            $request = $this->requestService->getRequestDetail($id);
            $vendor = Auth::user()->vendor;

            // Check authorization: vendor hanya bisa lihat request sendiri
            if ($request->vendor_id !== $vendor->id) {
                return redirect()->route('vendor.requests.index')
                    ->with('error', 'Anda tidak memiliki akses ke surat ini.');
            }

            return Inertia::render('Vendor/Requests/Detail', [
                'request' => $request,
                'vendor' => $vendor,
            ]);

        } catch (\Exception $e) {
            Log::error('VENDOR_REQUEST_SHOW_EXCEPTION', [
                'user_id' => Auth::id(),
                'request_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('vendor.requests.index')
                ->with('error', 'Request tidak ditemukan atau terjadi kesalahan.');
        }
    }

    /**
     * Cancel request
     *
     * POST /vendor/requests/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:500'],
        ], [
            'reason.required' => 'Alasan pembatalan wajib diisi.',
            'reason.min' => 'Alasan pembatalan minimal 10 karakter.',
            'reason.max' => 'Alasan pembatalan maksimal 500 karakter.',
        ]);

        try {
            $vendor = Auth::user()->vendor;
            $requestModel = $this->requestService->getRequestDetail($id);

            // Check authorization
            if ($requestModel->vendor_id !== $vendor->id) {
                return back()->withErrors([
                    'cancel' => 'Anda tidak memiliki akses untuk membatalkan surat ini.',
                ]);
            }

            $this->requestService->cancelRequest($id, $request->input('reason'));

            return redirect()->route('vendor.requests.show', $id)
                ->with('success', 'Surat berhasil dibatalkan.');

        } catch (\Exception $e) {
            Log::error('VENDOR_CANCEL_REQUEST_EXCEPTION', [
                'user_id' => Auth::id(),
                'request_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'cancel' => 'Gagal membatalkan surat. ' . $e->getMessage(),
            ]);
        }
    }
}
