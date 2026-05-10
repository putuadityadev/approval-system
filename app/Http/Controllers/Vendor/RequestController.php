<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\SubmitSikmRequest;
use App\Http\Requests\Vendor\SubmitSikRequest;
use App\Services\RequestService;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
    protected $qrCodeService;

    public function __construct(RequestService $requestService, QrCodeService $qrCodeService)
    {
        $this->requestService = $requestService;
        $this->qrCodeService = $qrCodeService;
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
     * Upload surat dan scan dengan OCR
     *
     * Apa yang dilakukan:
     * 1. Terima upload file surat (PDF/image) dan jenis surat
     * 2. Simpan file temporary ke session
     * 3. Jalankan OCR untuk ekstrak data
     * 4. Redirect ke form page dengan data pre-filled
     *
     * Cara kerja:
     * 1. Validasi file upload dan request_type
     * 2. Simpan file ke temporary storage
     * 3. Panggil OcrService untuk ekstrak data
     * 4. Store file path dan OCR data ke session
     * 5. Redirect ke form page sesuai request type
     *
     * POST /vendor/requests/upload-and-scan
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function uploadAndScan(Request $request)
    {
        try {
            // Validasi input
            $request->validate([
                'request_type' => ['required', 'in:LOADING_IN,LOADING_OUT,IJIN_KERJA'],
                'form_image' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'], // 10MB
            ], [
                'request_type.required' => 'Jenis surat wajib dipilih.',
                'request_type.in' => 'Jenis surat tidak valid.',
                'form_image.required' => 'File surat wajib diupload.',
                'form_image.mimes' => 'Format file harus JPG, PNG, atau PDF.',
                'form_image.max' => 'Ukuran file maksimal 10MB.',
            ]);

            $requestType = $request->input('request_type');
            $file = $request->file('form_image');

            Log::info('VENDOR_UPLOAD_AND_SCAN_START', [
                'user_id' => Auth::id(),
                'request_type' => $requestType,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
            ]);

            // Generate unique filename untuk user ini
            $userId = Auth::id();
            $timestamp = time();
            $extension = $file->getClientOriginalExtension();
            $uniqueFileName = "user_{$userId}_{$timestamp}.{$extension}";
            
            // Simpan file menggunakan Storage facade
            $fileContent = file_get_contents($file->getRealPath());
            $tempPath = 'temp/forms/' . $uniqueFileName;
            Storage::disk('local')->put($tempPath, $fileContent);

            // Jalankan OCR (hanya untuk image, skip untuk PDF)
            $ocrData = [];
            $fileExtension = $file->getClientOriginalExtension();
            
            if (in_array($fileExtension, ['jpg', 'jpeg', 'png'])) {
                try {
                    $ocrService = app(\App\Services\OcrService::class);
                    
                    // Gunakan Storage path untuk OCR
                    $ocrFilePath = Storage::disk('local')->path($tempPath);
                    
                    // Pass file path ke OCR service
                    if (in_array($requestType, ['LOADING_IN', 'LOADING_OUT'])) {
                        $savedFile = new \Illuminate\Http\UploadedFile(
                            $ocrFilePath,
                            $file->getClientOriginalName(),
                            $file->getClientMimeType(),
                            null,
                            true
                        );
                        $ocrData = $ocrService->extractSikmData($savedFile);
                    } else {
                        $savedFile = new \Illuminate\Http\UploadedFile(
                            $ocrFilePath,
                            $file->getClientOriginalName(),
                            $file->getClientMimeType(),
                            null,
                            true
                        );
                        $ocrData = $ocrService->extractSikData($savedFile);
                    }

                    Log::info('VENDOR_OCR_SUCCESS', [
                        'user_id' => Auth::id(),
                        'fields_extracted' => count($ocrData),
                    ]);

                } catch (\Exception $ocrError) {
                    Log::warning('VENDOR_OCR_FAILED', [
                        'user_id' => Auth::id(),
                        'error' => $ocrError->getMessage(),
                    ]);
                    // OCR gagal tidak masalah, user bisa isi manual
                }
            }

            // Store data ke session (TIDAK pakai flash agar bertahan sampai submit)
            // Session akan di-clear saat submit berhasil
            session([
                'upload_temp_path' => $tempPath,
                'upload_file_name' => $file->getClientOriginalName(),
                'upload_request_type' => $requestType,
                'upload_ocr_data' => $ocrData,
            ]);

            // Tentukan redirect URL berdasarkan request type
            $redirectUrl = match($requestType) {
                'LOADING_IN' => route('vendor.requests.create.sikmb', ['type' => 'LOADING_IN']),
                'LOADING_OUT' => route('vendor.requests.create.sikmb', ['type' => 'LOADING_OUT']),
                'IJIN_KERJA' => route('vendor.requests.create.sik'),
            };

            Log::info('VENDOR_UPLOAD_AND_SCAN_SUCCESS', [
                'user_id' => Auth::id(),
                'redirect_url' => $redirectUrl,
            ]);

            // Redirect ke form page (Inertia akan handle otomatis)
            return redirect($redirectUrl)
                ->with('success', 'File berhasil diupload dan di-scan. Silakan lengkapi form di bawah.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation error - return back dengan error messages
            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            Log::error('VENDOR_UPLOAD_AND_SCAN_EXCEPTION', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['form_image' => 'Gagal upload dan scan file. Silakan coba lagi.'])
                ->withInput();
        }
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

        // Ambil data dari session (jika ada dari upload & scan)
        $ocrData = session('upload_ocr_data', []);
        $uploadedFileName = session('upload_file_name');
        $tempPath = session('upload_temp_path');
        
        // Gunakan Storage::path() untuk mendapatkan path yang benar
        $fullPath = $tempPath ? Storage::disk('local')->path($tempPath) : null;
        $fileExists = $fullPath && file_exists($fullPath);

        // Generate preview URL jika ada file
        $previewUrl = null;
        if ($fileExists) {
            try {
                // Convert to base64 untuk preview
                $fileContent = file_get_contents($fullPath);
                $mimeType = mime_content_type($fullPath);
                $previewUrl = 'data:' . $mimeType . ';base64,' . base64_encode($fileContent);
            } catch (\Exception $e) {
                Log::error('VENDOR_CREATE_SIKMB_PREVIEW_ERROR', [
                    'temp_path' => $tempPath,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return Inertia::render('Vendor/Requests/CreateSikmb', [
            'vendor' => $vendor,
            'requestType' => $requestType,
            'ocrData' => $ocrData,
            'uploadedFileName' => $uploadedFileName,
            'previewUrl' => $previewUrl,
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
            Log::info('VENDOR_STORE_SIKMB_START', [
                'user_id' => Auth::id(),
                'request_data' => $request->all(),
            ]);

            $vendor = Auth::user()->vendor;
            
            if (!$vendor) {
                Log::error('VENDOR_STORE_SIKMB_NO_VENDOR', [
                    'user_id' => Auth::id(),
                ]);
                return back()->withErrors([
                    'vendor' => 'Data vendor tidak ditemukan. Silakan hubungi admin.',
                ])->withInput();
            }

            // Merge vendor_id ke request data
            $data = array_merge($request->validated(), [
                'vendor_id' => $vendor->id,
            ]);

            // Ambil temporary file dari session dan convert ke UploadedFile
            $tempPath = session('upload_temp_path');
            if ($tempPath && Storage::disk('local')->exists($tempPath)) {
                $fullPath = Storage::disk('local')->path($tempPath);
                $originalFileName = session('upload_file_name', 'uploaded_form.jpg');
                
                // Create UploadedFile instance dari temporary file
                $uploadedFile = new \Illuminate\Http\UploadedFile(
                    $fullPath,
                    $originalFileName,
                    mime_content_type($fullPath),
                    null,
                    true // test mode = true (tidak validasi is_uploaded_file)
                );
                
                $data['original_form_image'] = $uploadedFile;
                
                Log::info('VENDOR_STORE_SIKMB_FILE_ATTACHED', [
                    'user_id' => Auth::id(),
                    'temp_path' => $tempPath,
                    'file_name' => $originalFileName,
                ]);
            }

            Log::info('VENDOR_STORE_SIKMB_BEFORE_SERVICE', [
                'user_id' => Auth::id(),
                'vendor_id' => $vendor->id,
                'data_keys' => array_keys($data),
            ]);

            $submittedRequest = $this->requestService->submitSikmb($data);

            Log::info('VENDOR_STORE_SIKMB_SUCCESS', [
                'user_id' => Auth::id(),
                'request_id' => $submittedRequest->id,
            ]);

            // Hapus temporary file dan clear session setelah submit berhasil
            if ($tempPath && Storage::disk('local')->exists($tempPath)) {
                Storage::disk('local')->delete($tempPath);
            }
            session()->forget(['upload_temp_path', 'upload_file_name', 'upload_request_type', 'upload_ocr_data']);

            return redirect()->route('vendor.requests.show', $submittedRequest->id)
                ->with('success', 'Surat SIKMB berhasil diajukan! Menunggu approval dari Departemen.');

        } catch (\Exception $e) {
            Log::error('VENDOR_STORE_SIKMB_EXCEPTION', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
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

        // Ambil data dari session (jika ada dari upload & scan)
        $ocrData = session('upload_ocr_data', []);
        $uploadedFileName = session('upload_file_name');
        $tempPath = session('upload_temp_path');

        // Gunakan Storage::path() untuk mendapatkan path yang benar
        $fullPath = $tempPath ? Storage::disk('local')->path($tempPath) : null;
        $fileExists = $fullPath && file_exists($fullPath);

        // Generate preview URL jika ada file
        $previewUrl = null;
        if ($fileExists) {
            try {
                $fileContent = file_get_contents($fullPath);
                $mimeType = mime_content_type($fullPath);
                $previewUrl = 'data:' . $mimeType . ';base64,' . base64_encode($fileContent);
            } catch (\Exception $e) {
                Log::error('VENDOR_CREATE_SIK_PREVIEW_ERROR', [
                    'temp_path' => $tempPath,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return Inertia::render('Vendor/Requests/CreateSik', [
            'vendor' => $vendor,
            'ocrData' => $ocrData,
            'uploadedFileName' => $uploadedFileName,
            'previewUrl' => $previewUrl,
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

            // Ambil temporary file dari session dan convert ke UploadedFile
            $tempPath = session('upload_temp_path');
            if ($tempPath && Storage::disk('local')->exists($tempPath)) {
                $fullPath = Storage::disk('local')->path($tempPath);
                $originalFileName = session('upload_file_name', 'uploaded_form.jpg');
                
                // Create UploadedFile instance dari temporary file
                $uploadedFile = new \Illuminate\Http\UploadedFile(
                    $fullPath,
                    $originalFileName,
                    mime_content_type($fullPath),
                    null,
                    true // test mode = true (tidak validasi is_uploaded_file)
                );
                
                $data['original_form_image'] = $uploadedFile;
                
                Log::info('VENDOR_STORE_SIK_FILE_ATTACHED', [
                    'user_id' => Auth::id(),
                    'temp_path' => $tempPath,
                    'file_name' => $originalFileName,
                ]);
            }

            $submittedRequest = $this->requestService->submitSik($data);

            // Hapus temporary file dan clear session setelah submit berhasil
            if ($tempPath && Storage::disk('local')->exists($tempPath)) {
                Storage::disk('local')->delete($tempPath);
            }
            session()->forget(['upload_temp_path', 'upload_file_name', 'upload_request_type', 'upload_ocr_data']);

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

            // Generate QR code URL jika status APPROVED atau EXECUTED
            $qrCodeUrl = null;
            if (in_array($request->status, ['APPROVED', 'EXECUTED'])) {
                $qrCodeUrl = $this->qrCodeService->getQrCodeUrl($id);
            }

            return Inertia::render('Vendor/Requests/Detail', [
                'request' => $request,
                'vendor' => $vendor,
                'qrCodeUrl' => $qrCodeUrl,
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
