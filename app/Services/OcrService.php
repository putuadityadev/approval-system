<?php

namespace App\Services;

use thiagoalessio\TesseractOCR\TesseractOCR;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;

/**
 * OcrService
 *
 * Service untuk ekstraksi teks dari gambar menggunakan Tesseract OCR.
 *
 * Fungsi utama:
 * - Ekstrak teks dari gambar surat (SIK/SIKMB)
 * - Parse teks hasil OCR menjadi structured data
 * - Pre-fill form data dari hasil OCR
 *
 * Cara kerja:
 * 1. Terima file gambar (JPG/PNG)
 * 2. Jalankan Tesseract OCR untuk ekstrak teks
 * 3. Parse teks dengan regex pattern untuk field-field tertentu
 * 4. Return array data yang bisa digunakan untuk pre-fill form
 *
 * Digunakan oleh: RequestController
 */
class OcrService
{
    /**
     * Ekstrak data dari gambar surat SIKMB
     *
     * Apa yang dilakukan:
     * Ekstrak teks dari gambar surat SIKMB dan parse menjadi structured data
     *
     * Cara kerja:
     * 1. Jalankan OCR pada gambar
     * 2. Parse teks untuk field: document_serial_no, start_date, end_date, 
     *    start_time, end_time, dest_address, dest_phone, items
     * 3. Return array data yang sudah di-parse
     *
     * @param UploadedFile $image — File gambar surat
     * @return array — Data hasil ekstraksi
     * @throws \Exception — Jika OCR gagal
     */
    public function extractSikmData(UploadedFile $image): array
    {
        Log::info('OCR_EXTRACT_SIKM_START', [
            'filename' => $image->getClientOriginalName(),
            'size' => $image->getSize(),
        ]);

        try {
            // Ekstrak teks dari gambar
            $text = $this->performOcr($image);

            Log::info('OCR_EXTRACT_SIKM_TEXT_EXTRACTED', [
                'text_length' => strlen($text),
                'text_preview' => substr($text, 0, 200),
            ]);

            // Parse teks menjadi structured data
            $data = $this->parseSikmText($text);

            Log::info('OCR_EXTRACT_SIKM_SUCCESS', [
                'fields_extracted' => array_keys($data),
                'items_count' => count($data['items'] ?? []),
            ]);

            return $data;

        } catch (\Exception $e) {
            Log::error('OCR_EXTRACT_SIKM_FAILED', [
                'filename' => $image->getClientOriginalName(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal ekstrak data dari gambar. ' . $e->getMessage());
        }
    }

    /**
     * Ekstrak data dari gambar surat SIK
     *
     * Apa yang dilakukan:
     * Ekstrak teks dari gambar surat SIK dan parse menjadi structured data
     *
     * Cara kerja:
     * 1. Jalankan OCR pada gambar
     * 2. Parse teks untuk field: document_serial_no, worker_count, start_date,
     *    end_date, start_time, end_time, location, job_type, description
     * 3. Return array data yang sudah di-parse
     *
     * @param UploadedFile $image — File gambar surat
     * @return array — Data hasil ekstraksi
     * @throws \Exception — Jika OCR gagal
     */
    public function extractSikData(UploadedFile $image): array
    {
        Log::info('OCR_EXTRACT_SIK_START', [
            'filename' => $image->getClientOriginalName(),
            'size' => $image->getSize(),
        ]);

        try {
            // Ekstrak teks dari gambar
            $text = $this->performOcr($image);

            Log::info('OCR_EXTRACT_SIK_TEXT_EXTRACTED', [
                'text_length' => strlen($text),
                'text_preview' => substr($text, 0, 200),
            ]);

            // Parse teks menjadi structured data
            $data = $this->parseSikText($text);

            Log::info('OCR_EXTRACT_SIK_SUCCESS', [
                'fields_extracted' => array_keys($data),
            ]);

            return $data;

        } catch (\Exception $e) {
            Log::error('OCR_EXTRACT_SIK_FAILED', [
                'filename' => $image->getClientOriginalName(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception('Gagal ekstrak data dari gambar. ' . $e->getMessage());
        }
    }

    /**
     * Perform OCR pada gambar
     *
     * Apa yang dilakukan:
     * Jalankan Tesseract OCR untuk ekstrak teks dari gambar
     *
     * Cara kerja:
     * 1. Simpan uploaded file ke temporary path
     * 2. Jalankan Tesseract dengan bahasa Indonesia
     * 3. Return teks hasil OCR
     * 4. Hapus temporary file
     *
     * @param UploadedFile $image
     * @return string — Teks hasil OCR
     * @throws \Exception — Jika OCR gagal
     */
    protected function performOcr(UploadedFile $image): string
    {
        // Simpan ke temporary file
        $tempPath = $image->getRealPath();

        try {
            // Jalankan OCR dengan bahasa Indonesia
            $ocr = new TesseractOCR($tempPath);
            $ocr->lang('ind', 'eng'); // Indonesia + English
            $ocr->psm(6); // Assume uniform block of text
            
            $text = $ocr->run();

            if (empty($text)) {
                throw new \Exception('Tidak ada teks yang berhasil diekstrak dari gambar.');
            }

            return $text;

        } catch (\Exception $e) {
            Log::error('OCR_PERFORM_FAILED', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Parse teks hasil OCR untuk surat SIKMB
     *
     * Apa yang dilakukan:
     * Parse teks mentah menjadi structured data untuk form SIKMB
     *
     * Cara kerja:
     * 1. Cari pattern untuk setiap field dengan regex
     * 2. Extract value dari pattern yang match
     * 3. Clean dan format value
     * 4. Return array data
     *
     * Pattern yang dicari:
     * - No. Seri / Serial No / Nomor Dokumen
     * - Tanggal Mulai / Start Date
     * - Tanggal Selesai / End Date
     * - Jam Mulai / Start Time
     * - Jam Selesai / End Time
     * - Alamat Tujuan / Destination
     * - Telepon / Phone
     * - Daftar Barang / Items (table format)
     *
     * @param string $text — Teks hasil OCR
     * @return array — Data yang sudah di-parse
     */
    protected function parseSikmText(string $text): array
    {
        $data = [
            'document_serial_no' => null,
            'start_date' => null,
            'end_date' => null,
            'start_time' => null,
            'end_time' => null,
            'dest_address' => null,
            'dest_phone' => null,
            'origin_floor' => null,
            'origin_unit' => null,
            'dest_floor' => null,
            'items' => [],
        ];

        // Normalize text (lowercase untuk matching)
        $textLower = strtolower($text);

        // Extract document serial number
        // Pattern: "no. seri: ABC123" atau "serial no: ABC123"
        if (preg_match('/(?:no\.?\s*seri|serial\s*no|nomor\s*dokumen)[:\s]+([A-Z0-9\-\/]+)/i', $text, $matches)) {
            $data['document_serial_no'] = trim($matches[1]);
        }

        // Extract dates (format: DD/MM/YYYY atau DD-MM-YYYY)
        // Start date
        if (preg_match('/(?:tanggal\s*mulai|start\s*date|dari\s*tanggal)[:\s]+(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i', $text, $matches)) {
            $data['start_date'] = $this->formatDate($matches[1]);
        }

        // End date
        if (preg_match('/(?:tanggal\s*selesai|end\s*date|sampai\s*tanggal)[:\s]+(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i', $text, $matches)) {
            $data['end_date'] = $this->formatDate($matches[1]);
        }

        // Extract times (format: HH:MM)
        // Start time
        if (preg_match('/(?:jam\s*mulai|start\s*time|dari\s*jam)[:\s]+(\d{1,2}:\d{2})/i', $text, $matches)) {
            $data['start_time'] = $this->formatTime($matches[1]);
        }

        // End time
        if (preg_match('/(?:jam\s*selesai|end\s*time|sampai\s*jam)[:\s]+(\d{1,2}:\d{2})/i', $text, $matches)) {
            $data['end_time'] = $this->formatTime($matches[1]);
        }

        // Extract destination address
        if (preg_match('/(?:alamat\s*tujuan|destination|tujuan)[:\s]+([^\n]+)/i', $text, $matches)) {
            $data['dest_address'] = trim($matches[1]);
        }

        // Extract phone number
        if (preg_match('/(?:telepon|phone|telp|hp)[:\s]+([\d\-\+\s]+)/i', $text, $matches)) {
            $data['dest_phone'] = preg_replace('/[^\d\+]/', '', $matches[1]);
        }

        // Extract floor/unit info
        if (preg_match('/(?:lantai\s*asal|origin\s*floor|dari\s*lantai)[:\s]+([^\n]+)/i', $text, $matches)) {
            $data['origin_floor'] = trim($matches[1]);
        }

        if (preg_match('/(?:unit\s*asal|origin\s*unit|dari\s*unit)[:\s]+([^\n]+)/i', $text, $matches)) {
            $data['origin_unit'] = trim($matches[1]);
        }

        if (preg_match('/(?:lantai\s*tujuan|dest\s*floor|ke\s*lantai)[:\s]+([^\n]+)/i', $text, $matches)) {
            $data['dest_floor'] = trim($matches[1]);
        }

        // Extract items (table format)
        // Cari section "Daftar Barang" atau "Items"
        $data['items'] = $this->extractItemsFromText($text);

        return $data;
    }

    /**
     * Parse teks hasil OCR untuk surat SIK
     *
     * Apa yang dilakukan:
     * Parse teks mentah menjadi structured data untuk form SIK
     *
     * Cara kerja:
     * 1. Cari pattern untuk setiap field dengan regex
     * 2. Extract value dari pattern yang match
     * 3. Clean dan format value
     * 4. Return array data
     *
     * Pattern yang dicari:
     * - No. Seri / Serial No
     * - Jumlah Pekerja / Worker Count
     * - Tanggal Mulai / Start Date
     * - Tanggal Selesai / End Date
     * - Jam Mulai / Start Time
     * - Jam Selesai / End Time
     * - Lokasi / Location
     * - Jenis Pekerjaan / Job Type
     * - Deskripsi / Description
     *
     * @param string $text — Teks hasil OCR
     * @return array — Data yang sudah di-parse
     */
    protected function parseSikText(string $text): array
    {
        $data = [
            'document_serial_no' => null,
            'worker_count' => null,
            'start_date' => null,
            'end_date' => null,
            'start_time' => null,
            'end_time' => null,
            'location' => null,
            'job_type' => null,
            'description' => null,
        ];

        // Extract document serial number
        if (preg_match('/(?:no\.?\s*seri|serial\s*no|nomor\s*dokumen)[:\s]+([A-Z0-9\-\/]+)/i', $text, $matches)) {
            $data['document_serial_no'] = trim($matches[1]);
        }

        // Extract worker count
        if (preg_match('/(?:jumlah\s*pekerja|worker\s*count|pekerja)[:\s]+(\d+)/i', $text, $matches)) {
            $data['worker_count'] = (int) $matches[1];
        }

        // Extract dates
        if (preg_match('/(?:tanggal\s*mulai|start\s*date|dari\s*tanggal)[:\s]+(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i', $text, $matches)) {
            $data['start_date'] = $this->formatDate($matches[1]);
        }

        if (preg_match('/(?:tanggal\s*selesai|end\s*date|sampai\s*tanggal)[:\s]+(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i', $text, $matches)) {
            $data['end_date'] = $this->formatDate($matches[1]);
        }

        // Extract times
        if (preg_match('/(?:jam\s*mulai|start\s*time|dari\s*jam)[:\s]+(\d{1,2}:\d{2})/i', $text, $matches)) {
            $data['start_time'] = $this->formatTime($matches[1]);
        }

        if (preg_match('/(?:jam\s*selesai|end\s*time|sampai\s*jam)[:\s]+(\d{1,2}:\d{2})/i', $text, $matches)) {
            $data['end_time'] = $this->formatTime($matches[1]);
        }

        // Extract location
        if (preg_match('/(?:lokasi|location|tempat)[:\s]+([^\n]+)/i', $text, $matches)) {
            $data['location'] = trim($matches[1]);
        }

        // Extract job type
        if (preg_match('/(?:jenis\s*pekerjaan|job\s*type|pekerjaan)[:\s]+([^\n]+)/i', $text, $matches)) {
            $data['job_type'] = trim($matches[1]);
        }

        // Extract description (biasanya di bagian akhir atau setelah "Deskripsi:")
        if (preg_match('/(?:deskripsi|description|keterangan)[:\s]+([^\n]+(?:\n[^\n]+)*)/i', $text, $matches)) {
            $data['description'] = trim($matches[1]);
        }

        return $data;
    }

    /**
     * Extract items dari teks (untuk SIKMB)
     *
     * Apa yang dilakukan:
     * Parse tabel barang dari teks OCR
     *
     * Cara kerja:
     * 1. Cari section "Daftar Barang" atau "Items"
     * 2. Parse setiap baris sebagai item
     * 3. Extract: nama barang, jumlah, satuan, keterangan
     * 4. Return array items
     *
     * Format yang diharapkan:
     * No | Nama Barang | Jumlah | Satuan | Keterangan
     * 1  | Laptop      | 2      | Unit   | Untuk meeting
     *
     * @param string $text
     * @return array
     */
    protected function extractItemsFromText(string $text): array
    {
        $items = [];

        // Cari section daftar barang
        if (preg_match('/(?:daftar\s*barang|items|barang)[:\s]*\n(.*?)(?:\n\n|$)/is', $text, $matches)) {
            $itemSection = $matches[1];
            $lines = explode("\n", $itemSection);

            foreach ($lines as $line) {
                $line = trim($line);
                
                // Skip header atau empty lines
                if (empty($line) || 
                    stripos($line, 'nama barang') !== false || 
                    stripos($line, 'jumlah') !== false ||
                    stripos($line, 'satuan') !== false) {
                    continue;
                }

                // Parse line dengan delimiter | atau tab atau multiple spaces
                $parts = preg_split('/[\|\t]\s*|\s{2,}/', $line);
                
                if (count($parts) >= 3) {
                    // Skip nomor urut jika ada
                    if (is_numeric($parts[0])) {
                        array_shift($parts);
                    }

                    $items[] = [
                        'item_name' => trim($parts[0] ?? ''),
                        'quantity' => (int) ($parts[1] ?? 1),
                        'unit' => trim($parts[2] ?? 'Unit'),
                        'remarks' => trim($parts[3] ?? ''),
                    ];
                }
            }
        }

        // Jika tidak ada items yang berhasil di-parse, return empty array
        return $items;
    }

    /**
     * Format date dari berbagai format ke Y-m-d
     *
     * @param string $date — Date string (DD/MM/YYYY atau DD-MM-YYYY)
     * @return string — Formatted date (Y-m-d)
     */
    protected function formatDate(string $date): string
    {
        // Replace / atau - dengan -
        $date = str_replace('/', '-', $date);
        
        // Parse DD-MM-YYYY ke Y-m-d
        $parts = explode('-', $date);
        
        if (count($parts) === 3) {
            // Assume DD-MM-YYYY
            return sprintf('%04d-%02d-%02d', $parts[2], $parts[1], $parts[0]);
        }

        return $date;
    }

    /**
     * Format time ke HH:MM
     *
     * @param string $time — Time string
     * @return string — Formatted time (HH:MM)
     */
    protected function formatTime(string $time): string
    {
        $parts = explode(':', $time);
        
        if (count($parts) === 2) {
            return sprintf('%02d:%02d', $parts[0], $parts[1]);
        }

        return $time;
    }
}
