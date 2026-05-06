<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Services\OcrService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * OcrController
 *
 * Controller untuk handle OCR (Optical Character Recognition) dari gambar surat.
 *
 * Fungsi utama:
 * - Extract data dari gambar surat SIKMB
 * - Extract data dari gambar surat SIK
 * - Return JSON data untuk pre-fill form
 *
 * Cara kerja:
 * 1. Terima upload gambar dari frontend
 * 2. Validasi file (image, max 5MB)
 * 3. Panggil OcrService untuk ekstrak data
 * 4. Return JSON response dengan data hasil ekstraksi
 *
 * Digunakan oleh: Vendor saat upload contoh surat
 */
class OcrController extends Controller
{
    protected $ocrService;

    public function __construct(OcrService $ocrService)
    {
        $this->ocrService = $ocrService;
    }

    /**
     * Extract data dari gambar surat SIKMB
     *
     * Apa yang dilakukan:
     * Terima upload gambar surat SIKMB, ekstrak data, return JSON
     *
     * Cara kerja:
     * 1. Validasi file upload
     * 2. Panggil OcrService->extractSikmData()
     * 3. Return JSON response dengan data hasil ekstraksi
     * 4. Frontend akan gunakan data ini untuk pre-fill form
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function extractSikmData(Request $request): JsonResponse
    {
        try {
            // Validasi file upload
            $request->validate([
                'image' => ['required', 'image', 'mimes:jpeg,jpg,png', 'max:5120'], // 5MB
            ], [
                'image.required' => 'Gambar surat wajib diupload.',
                'image.image' => 'File harus berupa gambar.',
                'image.mimes' => 'Format gambar harus JPG atau PNG.',
                'image.max' => 'Ukuran gambar maksimal 5MB.',
            ]);

            // Extract data dari gambar
            $data = $this->ocrService->extractSikmData($request->file('image'));

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diekstrak dari gambar.',
                'data' => $data,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('OCR_CONTROLLER_EXTRACT_SIKM_EXCEPTION', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal ekstrak data dari gambar. Silakan coba lagi atau isi form secara manual.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Extract data dari gambar surat SIK
     *
     * Apa yang dilakukan:
     * Terima upload gambar surat SIK, ekstrak data, return JSON
     *
     * Cara kerja:
     * 1. Validasi file upload
     * 2. Panggil OcrService->extractSikData()
     * 3. Return JSON response dengan data hasil ekstraksi
     * 4. Frontend akan gunakan data ini untuk pre-fill form
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function extractSikData(Request $request): JsonResponse
    {
        try {
            // Validasi file upload
            $request->validate([
                'image' => ['required', 'image', 'mimes:jpeg,jpg,png', 'max:5120'], // 5MB
            ], [
                'image.required' => 'Gambar surat wajib diupload.',
                'image.image' => 'File harus berupa gambar.',
                'image.mimes' => 'Format gambar harus JPG atau PNG.',
                'image.max' => 'Ukuran gambar maksimal 5MB.',
            ]);

            // Extract data dari gambar
            $data = $this->ocrService->extractSikData($request->file('image'));

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diekstrak dari gambar.',
                'data' => $data,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('OCR_CONTROLLER_EXTRACT_SIK_EXCEPTION', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal ekstrak data dari gambar. Silakan coba lagi atau isi form secara manual.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
