<?php

namespace App\Services;

use App\Models\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * DocumentSerialService
 *
 * Service untuk generate document serial number otomatis.
 *
 * Format:
 * - SIKMB (LOADING_IN/OUT): D{counter}/SM-ICB/SIKMB/{year}
 * - SIK (IJIN_KERJA): D{counter}/SIK-ICB/TBD/{year}
 *
 * Counter auto-increment per type surat per tahun.
 *
 * Cara kerja:
 * 1. Lock table untuk prevent race condition
 * 2. Get counter terakhir untuk type + year
 * 3. Increment counter
 * 4. Generate serial number dengan format
 * 5. Return serial number dan counter
 *
 * Digunakan oleh: RequestController saat store
 */
class DocumentSerialService
{
    /**
     * Generate document serial number
     *
     * Apa yang dilakukan:
     * Generate serial number otomatis dengan format sesuai type surat
     *
     * Cara kerja:
     * 1. Tentukan year dari tanggal dibuat
     * 2. Lock table untuk atomic operation
     * 3. Get last counter untuk type + year
     * 4. Increment counter
     * 5. Format serial number
     *
     * @param string $requestType — LOADING_IN, LOADING_OUT, IJIN_KERJA
     * @return array — ['serial_no' => 'D000001/SM-ICB/SIKMB/2026', 'counter' => 1]
     */
    public function generateSerialNumber(string $requestType): array
    {
        $year = date('Y');
        
        Log::info('DOCUMENT_SERIAL_GENERATE_START', [
            'request_type' => $requestType,
            'year' => $year,
        ]);

        try {
            // Use transaction with lock untuk prevent race condition
            return DB::transaction(function () use ($requestType, $year) {
                // Get last counter untuk type ini di year ini
                $lastRequest = Request::where('request_type', $requestType)
                    ->whereYear('created_at', $year)
                    ->whereNotNull('document_counter')
                    ->lockForUpdate() // Lock untuk atomic operation
                    ->orderBy('document_counter', 'desc')
                    ->first();

                // Increment counter
                $counter = $lastRequest ? $lastRequest->document_counter + 1 : 1;

                // Format counter dengan leading zeros (6 digit)
                $counterFormatted = str_pad($counter, 6, '0', STR_PAD_LEFT);

                // Generate serial number sesuai format
                $serialNo = $this->formatSerialNumber($requestType, $counterFormatted, $year);

                Log::info('DOCUMENT_SERIAL_GENERATE_SUCCESS', [
                    'request_type' => $requestType,
                    'year' => $year,
                    'counter' => $counter,
                    'serial_no' => $serialNo,
                ]);

                return [
                    'serial_no' => $serialNo,
                    'counter' => $counter,
                ];
            });

        } catch (\Exception $e) {
            Log::error('DOCUMENT_SERIAL_GENERATE_FAILED', [
                'request_type' => $requestType,
                'year' => $year,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal generate nomor dokumen. Silakan coba lagi.');
        }
    }

    /**
     * Format serial number sesuai type surat
     *
     * Format:
     * - LOADING_IN/OUT (SIKMB): D{counter}/SM-ICB/SIKMB/{year}
     * - IJIN_KERJA (SIK): D{counter}/SIK-ICB/TBD/{year}
     *
     * @param string $requestType
     * @param string $counterFormatted — Counter dengan leading zeros (e.g. "000001")
     * @param int $year
     * @return string — Serial number lengkap
     */
    private function formatSerialNumber(string $requestType, string $counterFormatted, int $year): string
    {
        if (in_array($requestType, ['LOADING_IN', 'LOADING_OUT'])) {
            // Format SIKMB: D{counter}/SM-ICB/SIKMB/{year}
            return "D{$counterFormatted}/SM-ICB/SIKMB/{$year}";
        } elseif ($requestType === 'IJIN_KERJA') {
            // Format SIK: D{counter}/SIK-ICB/TBD/{year}
            return "D{$counterFormatted}/SIK-ICB/TBD/{$year}";
        }

        throw new \Exception("Unknown request type: {$requestType}");
    }

    /**
     * Validate serial number format
     *
     * Helper untuk check apakah serial number valid
     *
     * @param string $serialNo
     * @param string $requestType
     * @return bool
     */
    public function validateSerialNumber(string $serialNo, string $requestType): bool
    {
        if (in_array($requestType, ['LOADING_IN', 'LOADING_OUT'])) {
            // Format SIKMB: D{6 digits}/SM-ICB/SIKMB/{4 digits year}
            return preg_match('/^D\d{6}\/SM-ICB\/SIKMB\/\d{4}$/', $serialNo) === 1;
        } elseif ($requestType === 'IJIN_KERJA') {
            // Format SIK: D{6 digits}/SIK-ICB/TBD/{4 digits year}
            return preg_match('/^D\d{6}\/SIK-ICB\/TBD\/\d{4}$/', $serialNo) === 1;
        }

        return false;
    }
}
