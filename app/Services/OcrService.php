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
    protected ?AiOcrService $aiOcrService;

    public function __construct(?AiOcrService $aiOcrService = null)
    {
        $this->aiOcrService = $aiOcrService;
    }

    /**
     * Ekstrak data dari gambar surat SIKMB
     *
     * Apa yang dilakukan:
     * Ekstrak teks dari gambar surat SIKMB dan parse menjadi structured data
     *
     * Cara kerja:
     * 1. Coba AI Vision API (akurasi tinggi untuk tulisan tangan)
     * 2. Jika AI gagal atau tidak tersedia, fallback ke Tesseract + regex
     * 3. Return array data yang sudah di-parse
     *
     * @param UploadedFile $image — File gambar surat
     * @return array — Data hasil ekstraksi
     * @throws \Exception — Jika semua engine OCR gagal
     */
    public function extractSikmData(UploadedFile $image): array
    {
        Log::info('OCR_EXTRACT_SIKM_START', [
            'filename' => $image->getClientOriginalName(),
            'size' => $image->getSize(),
        ]);

        // Strategy 1: AI Vision API (tulisan tangan + cetak)
        if ($this->aiOcrService && $this->aiOcrService->isAvailable()) {
            try {
                $data = $this->aiOcrService->extractSikmData($image);
                if ($data !== null) {
                    Log::info('OCR_EXTRACT_SIKM_SUCCESS', [
                        'engine' => 'ai',
                        'fields_extracted' => array_keys($data),
                        'items_count' => count($data['items'] ?? []),
                    ]);
                    return $data;
                }
                Log::warning('OCR_AI_RETURNED_NULL_SIKM', [
                    'filename' => $image->getClientOriginalName(),
                ]);
            } catch (\Exception $e) {
                Log::warning('OCR_AI_FALLBACK_SIKM', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Strategy 2: Tesseract + regex (fallback)
        try {
            $text = $this->performOcr($image);

            Log::info('OCR_EXTRACT_SIKM_TEXT_EXTRACTED', [
                'engine' => 'tesseract',
                'text_length' => strlen($text),
                'text_preview' => substr($text, 0, 200),
            ]);

            $data = $this->parseSikmText($text);

            Log::info('OCR_EXTRACT_SIKM_SUCCESS', [
                'engine' => 'tesseract',
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

        // Strategy 1: AI Vision API
        if ($this->aiOcrService && $this->aiOcrService->isAvailable()) {
            try {
                $data = $this->aiOcrService->extractSikData($image);
                if ($data !== null) {
                    Log::info('OCR_EXTRACT_SIK_SUCCESS', [
                        'engine' => 'ai',
                        'fields_extracted' => array_keys($data),
                    ]);
                    return $data;
                }
                Log::warning('OCR_AI_RETURNED_NULL_SIK', [
                    'filename' => $image->getClientOriginalName(),
                ]);
            } catch (\Exception $e) {
                Log::warning('OCR_AI_FALLBACK_SIK', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Strategy 2: Tesseract + regex (fallback)
        try {
            $text = $this->performOcr($image);

            Log::info('OCR_EXTRACT_SIK_TEXT_EXTRACTED', [
                'engine' => 'tesseract',
                'text_length' => strlen($text),
                'text_preview' => substr($text, 0, 200),
            ]);

            $data = $this->parseSikText($text);

            Log::info('OCR_EXTRACT_SIK_SUCCESS', [
                'engine' => 'tesseract',
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
     * 2. Jalankan Tesseract dengan bahasa Indonesia + English
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
            // Jalankan OCR dengan bahasa English (Indonesia language pack belum terinstall)
            $ocr = new TesseractOCR($tempPath);
            $ocr->lang('eng'); // English only (ind belum terinstall)
            $ocr->psm(6); // Assume uniform block of text
            $ocr->oem(3); // Default OCR Engine Mode
            
            // Whitelist characters (optional - untuk improve accuracy)
            // $ocr->whitelist(range('A','Z'), range('a','z'), range(0,9), [' ', '.', ',', '-', '/', ':', '(', ')']);
            
            $text = $ocr->run();

            if (empty($text)) {
                throw new \Exception('Tidak ada teks yang berhasil diekstrak dari gambar.');
            }

            Log::info('OCR_PERFORM_SUCCESS', [
                'text_length' => strlen($text),
                'text_preview' => substr($text, 0, 300),
            ]);

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
     * 1. Cari pattern untuk setiap field dengan regex yang disesuaikan dengan format surat Indonesia
     * 2. Extract value dari pattern yang match
     * 3. Clean dan format value
     * 4. Return array data
     *
     * Pattern yang dicari (berdasarkan format surat SIKMB Indonesia):
     * - No. Dokumen (format: 001518 /SIKMB/HT/TD/20...)
     * - Tanggal (format: 20 Maret - 5 April 26)
     * - Waktu (format: 22.00 - 05.00)
     * - Lantai (format: GF, Lt. 3, dll)
     * - Unit (format: Unit A, GF, dll)
     * - Alamat tujuan (format: Market GF, dll)
     * - Telepon (format: 0861-3161-251)
     * - Nama Barang (table format)
     *
     * @param string $text — Teks hasil OCR
     * @return array — Data yang sudah di-parse
     */
    protected function parseSikmText(string $text): array
    {
        $data = [
            'sop_form_code' => null,
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

        // Log raw text untuk debugging
        Log::debug('OCR_PARSE_SIKM_RAW_TEXT', [
            'text' => $text,
        ]);

        // Extract document serial number (format: 001518 /SIKMB/HT/TD/20... atau No. 001518)
        // Pattern 1: Cari 6 digit diikuti /SIKMB
        if (preg_match('/(\d{6})\s*\/\s*SIKMB/i', $text, $matches)) {
            $data['document_serial_no'] = $matches[1];
        }
        // Pattern 2: Cari "No." diikuti 6 digit
        elseif (preg_match('/No\.?\s*[:\s]*(\d{6})/i', $text, $matches)) {
            $data['document_serial_no'] = $matches[1];
        }
        // Pattern 3: Cari 6 digit standalone di awal dokumen
        elseif (preg_match('/^.*?(\d{6})/m', $text, $matches)) {
            $data['document_serial_no'] = $matches[1];
        }

        // Extract SOP Form Code (format: SM-ICB001)
        if (preg_match('/([A-Z]{2,3}-[A-Z]{3}\d{3})/i', $text, $matches)) {
            $data['sop_form_code'] = strtoupper($matches[1]);
        }

        // Extract dates - Format Indonesia: "20 Maret - 5 April 26"
        // Cari pattern: DD Bulan - DD Bulan YY
        if (preg_match('/(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s*[-\s]+\s*(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s+(\d{2,4})/i', $text, $matches)) {
            $startDay = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $startMonth = $this->convertMonthToNumber($matches[2]);
            $endDay = str_pad($matches[3], 2, '0', STR_PAD_LEFT);
            $endMonth = $this->convertMonthToNumber($matches[4]);
            $year = strlen($matches[5]) == 2 ? '20' . $matches[5] : $matches[5];
            
            $data['start_date'] = sprintf('%s-%02d-%s', $year, $startMonth, $startDay);
            $data['end_date'] = sprintf('%s-%02d-%s', $year, $endMonth, $endDay);
        }
        // Fallback: Cari single date
        elseif (preg_match('/(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s+(\d{2,4})/i', $text, $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $month = $this->convertMonthToNumber($matches[2]);
            $year = strlen($matches[3]) == 2 ? '20' . $matches[3] : $matches[3];
            
            $data['start_date'] = sprintf('%s-%02d-%s', $year, $month, $day);
        }

        // Extract times (format: 22.00 - 05.00 atau 22:00 - 05:00)
        if (preg_match('/(\d{1,2})[\.:]\s*(\d{2})\s*[-\s]+\s*(\d{1,2})[\.:]\s*(\d{2})/i', $text, $matches)) {
            $data['start_time'] = sprintf('%02d:%02d', $matches[1], $matches[2]);
            $data['end_time'] = sprintf('%02d:%02d', $matches[3], $matches[4]);
        }

        // Extract floor info (format: GF, LG, UG, Lt. 3, Lantai 2, dll)
        // Cari semua kemunculan lantai
        $floors = [];
        if (preg_match_all('/(GF|LG|UG|Lt\.?\s*\d+|Lantai\s*\d+|\bLt\s+\d+)/i', $text, $floorMatches)) {
            $floors = array_map('trim', $floorMatches[0]);
        }
        
        // Assign first occurrence as origin, second as dest
        if (count($floors) >= 1) {
            $data['origin_floor'] = strtoupper($floors[0]);
        }
        if (count($floors) >= 2) {
            $data['dest_floor'] = strtoupper($floors[1]);
        }

        // Extract unit (format: Unit A, A, GF, dll)
        // Cari pattern "Unit" diikuti huruf/angka
        if (preg_match('/Unit\s*[:\s]*([A-Z0-9\-]+)/i', $text, $matches)) {
            $data['origin_unit'] = strtoupper(trim($matches[1]));
        }

        // Extract destination address
        // Cari pattern setelah "Alamat tujuan" atau standalone address
        if (preg_match('/Alamat\s*tujuan[:\s]*([^\n]{5,100})/i', $text, $matches)) {
            $data['dest_address'] = trim($matches[1]);
        }
        // Fallback: Cari pattern "Market" atau nama tempat lain
        elseif (preg_match('/(Market|Plaza|Mall|Gedung|Tower)\s+[A-Z0-9\s]+/i', $text, $matches)) {
            $data['dest_address'] = trim($matches[0]);
        }

        // Extract phone number (format: 0861-3161-251, 08613161251, dll)
        // Cari pattern telepon Indonesia (08xx atau 02xx)
        if (preg_match('/(0\d{2,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/i', $text, $matches)) {
            $data['dest_phone'] = preg_replace('/[^\d]/', '', $matches[1]);
        }
        // Fallback: Cari setelah kata "Telepon" atau "Telp"
        elseif (preg_match('/(?:Telepon|Telp|HP)[:\s]*([\d\-\s]{8,20})/i', $text, $matches)) {
            $data['dest_phone'] = preg_replace('/[^\d]/', '', $matches[1]);
        }

        // Extract items from table
        $data['items'] = $this->extractItemsFromText($text);

        // Log parsed data untuk debugging
        Log::debug('OCR_PARSE_SIKM_RESULT', [
            'data' => $data,
        ]);

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
     * Parse tabel barang dari teks OCR dengan format Indonesia
     *
     * Cara kerja:
     * 1. Cari section table antara "NAMA BARANG" dan "REKOMENDASI"
     * 2. Filter hanya baris yang valid (bukan header, bukan catatan)
     * 3. Parse setiap baris sebagai item
     * 4. Extract: nama barang, jumlah, satuan
     * 5. Return array items
     *
     * Format yang diharapkan (dari surat SIKMB):
     * NO | NAMA BARANG | JUMLAH | NO | NAMA BARANG | JUMLAH | KETERANGAN
     * 1  | Donat 2 Pcs Susu | 2 Lotek | ...
     *
     * @param string $text
     * @return array
     */
    protected function extractItemsFromText(string $text): array
    {
        $items = [];

        // Log untuk debugging
        Log::debug('OCR_EXTRACT_ITEMS_START', [
            'text_length' => strlen($text),
        ]);

        // Cari section table barang - HANYA antara "NAMA BARANG" dan "REKOMENDASI"
        // Pattern yang lebih strict untuk avoid capturing CATATAN section
        if (preg_match('/NAMA\s+BARANG.*?\n(.*?)(?:REKOMENDASI|Diijinkan untuk dibawa|Call Hunting|KONTRAKTOR)/is', $text, $matches)) {
            $itemSection = $matches[1];
            
            Log::debug('OCR_EXTRACT_ITEMS_SECTION_FOUND', [
                'section' => substr($itemSection, 0, 300),
            ]);

            $lines = explode("\n", $itemSection);

            foreach ($lines as $line) {
                $line = trim($line);
                
                // Skip empty lines atau lines yang terlalu pendek
                if (empty($line) || strlen($line) < 3) {
                    continue;
                }

                // Skip header lines
                if (stripos($line, 'NAMA BARANG') !== false || 
                    stripos($line, 'JUMLAH') !== false ||
                    stripos($line, 'KETERANGAN') !== false ||
                    stripos($line, 'NO') === 0 && strlen($line) < 10) {
                    continue;
                }

                // Skip lines yang jelas bukan item (dari CATATAN atau footer)
                if (stripos($line, 'Diijinkan') !== false ||
                    stripos($line, 'Tidak diijinkan') !== false ||
                    stripos($line, 'Call Hunting') !== false ||
                    stripos($line, 'KONTRAKTOR') !== false ||
                    stripos($line, 'CATATAN') !== false ||
                    stripos($line, 'Surat ijin') !== false ||
                    stripos($line, 'Security') !== false ||
                    stripos($line, 'Petugas') !== false ||
                    stripos($line, 'WITA') !== false ||
                    stripos($line, 'Libur') !== false ||
                    stripos($line, 'Date') !== false ||
                    stripos($line, 'HP') !== false ||
                    stripos($line, 'Penohon') !== false ||
                    stripos($line, 'Departemen') !== false ||
                    stripos($line, 'Operation') !== false ||
                    stripos($line, 'Finance') !== false) {
                    continue;
                }

                // Parse line - Format: "1 | Donat 2 Pcs Susu | 2 Lotek | ..."
                // atau: "Donat 2 Pcs Susu 2 Lotek"
                
                // Remove leading number (nomor urut) - hanya 1-2 digit
                $line = preg_replace('/^[12]\s*[\|\s]+/', '', $line);
                
                // Split by | atau multiple spaces
                $parts = preg_split('/\s*\|\s*|\s{3,}/', $line);
                
                if (count($parts) >= 1 && !empty(trim($parts[0]))) {
                    $itemName = trim($parts[0]);
                    
                    // Skip jika item name terlalu pendek atau terlalu panjang
                    if (strlen($itemName) < 3 || strlen($itemName) > 100) {
                        continue;
                    }
                    
                    // Skip jika item name mengandung kata-kata yang jelas bukan barang
                    if (preg_match('/(gedung|alasan|keluar|masuk|berlaku|hari|jam|wita|security|petugas|catatan|kontraktor|management|penohon|departemen|operation|finance)/i', $itemName)) {
                        continue;
                    }
                    
                    $quantity = 1;
                    $unit = 'Unit';
                    
                    // Try to extract quantity from item name or next part
                    // Pattern: "Donat 2 Pcs" atau "2 Lotek"
                    if (preg_match('/(\d+)\s*(pcs|lotek|unit|box|kg|liter|buah|dus|karton|pack|lembar)/i', $itemName, $qtyMatch)) {
                        $quantity = (int) $qtyMatch[1];
                        $unit = ucfirst(strtolower($qtyMatch[2]));
                    } elseif (isset($parts[1]) && preg_match('/(\d+)\s*(pcs|lotek|unit|box|kg|liter|buah|dus|karton|pack|lembar)?/i', $parts[1], $qtyMatch)) {
                        $quantity = (int) $qtyMatch[1];
                        $unit = isset($qtyMatch[2]) ? ucfirst(strtolower($qtyMatch[2])) : 'Unit';
                    }

                    $items[] = [
                        'item_name' => $itemName,
                        'quantity' => $quantity,
                        'unit' => $unit,
                        'remarks' => isset($parts[2]) ? trim($parts[2]) : '',
                    ];
                    
                    // Limit to max 10 items untuk avoid capturing junk data
                    if (count($items) >= 10) {
                        break;
                    }
                }
            }
        }

        Log::debug('OCR_EXTRACT_ITEMS_RESULT', [
            'items_count' => count($items),
            'items' => $items,
        ]);

        // Jika tidak ada items yang berhasil di-parse, return array dengan 1 empty item
        // Agar user bisa isi manual
        if (empty($items)) {
            return [[
                'item_name' => '',
                'quantity' => 1,
                'unit' => 'Unit',
                'remarks' => '',
            ]];
        }

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

    /**
     * Convert nama bulan Indonesia/English ke angka
     *
     * @param string $month — Nama bulan (Januari, Jan, January, dll)
     * @return int — Nomor bulan (1-12)
     */
    protected function convertMonthToNumber(string $month): int
    {
        $months = [
            'januari' => 1, 'jan' => 1, 'january' => 1,
            'februari' => 2, 'feb' => 2, 'february' => 2,
            'maret' => 3, 'mar' => 3, 'march' => 3,
            'april' => 4, 'apr' => 4,
            'mei' => 5, 'may' => 5,
            'juni' => 6, 'jun' => 6, 'june' => 6,
            'juli' => 7, 'jul' => 7, 'july' => 7,
            'agustus' => 8, 'agu' => 8, 'august' => 8, 'aug' => 8,
            'september' => 9, 'sep' => 9,
            'oktober' => 10, 'okt' => 10, 'october' => 10, 'oct' => 10,
            'november' => 11, 'nov' => 11,
            'desember' => 12, 'des' => 12, 'december' => 12, 'dec' => 12,
        ];

        $monthLower = strtolower(trim($month));
        
        return $months[$monthLower] ?? 1;
    }
}
