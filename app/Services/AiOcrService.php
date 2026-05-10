<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;

/**
 * AiOcrService
 *
 * Service untuk ekstraksi data dari gambar dokumen menggunakan AI Vision API.
 *
 * Support 2 provider:
 * - 'gemini' — Google Gemini API langsung
 * - 'openrouter' — OpenRouter.ai (OpenAI-compatible, banyak model gratis)
 *
 * Fungsi utama:
 * - Kirim gambar dokumen ke Vision API untuk document understanding
 * - AI membaca tulisan tangan + teks cetak dengan akurat
 * - Output langsung dalam bentuk structured JSON
 * - Tidak perlu regex parsing yang fragile
 *
 * Keunggulan vs Tesseract:
 * - Akurasi baca tulisan tangan ~95%+ vs ~20%
 * - Paham konteks dokumen (label → value mapping)
 * - Output JSON terstruktur, bukan raw text
 *
 * Digunakan oleh: OcrService (sebagai primary engine, Tesseract sebagai fallback)
 */
class AiOcrService
{
    protected string $apiKey;
    protected string $model;
    protected string $provider;

    public function __construct()
    {
        $this->apiKey = config('services.ai_ocr.api_key', '');
        $this->model = config('services.ai_ocr.model', 'gemini-2.0-flash');
        $this->provider = config('services.ai_ocr.provider', 'gemini');
    }

    /**
     * Cek apakah AI OCR API tersedia (key terkonfigurasi)
     */
    public function isAvailable(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Ekstrak data SIKMB dari gambar menggunakan AI Vision
     *
     * @param UploadedFile $image
     * @return array|null — Data terstruktur, atau null jika gagal
     */
    public function extractSikmData(UploadedFile $image): ?array
    {
        $prompt = <<<'PROMPT'
Kamu adalah asisten document reader. Lihat gambar form "SURAT IJIN KELUAR/MASUK BARANG (SIKMB)" ini dan ekstrak SEMUA data yang tertulis, termasuk tulisan tangan.

Perhatikan layout form:
- Bagian atas: header perusahaan, nomor dokumen, dan kode form SOP
- Bagian tengah-atas: informasi vendor (perusahaan, penanggung jawab, alamat, lantai, unit, telepon)
- Pilihan: KELUAR atau MASUK (lihat mana yang dilingkari/dicoret)
- Tanggal: biasanya format "DD NamaBulan - DD NamaBulan YY" (contoh: "20 Maret - 6 April 26")
- Waktu: biasanya format "HH.MM - HH.MM" (contoh: "22.00 - 05.00")
- Alamat tujuan, lantai tujuan, telepon
- Tabel barang: kolom NO, NAMA BARANG, JUMLAH. Mungkin ada tulisan tangan.
- Bagian bawah: rekomendasi, tanda tangan, catatan (ABAIKAN bagian ini)

PENTING:
- Baca tulisan tangan dengan teliti
- Untuk tanggal, konversi ke format YYYY-MM-DD. Jika tahun 2-digit (misal "26"), asumsi 2026.
- Untuk waktu, konversi ke format HH:MM (24 jam).
- Untuk telepon, hanya digit (tanpa strip/spasi).
- Untuk item barang, baca dari tabel. Baris kosong = tidak ada item.
- JANGAN ambil data dari bagian "CATATAN" di bawah form.

Kembalikan HANYA JSON (tanpa markdown fence) dengan format:
{
  "sop_form_code": "kode form SOP di pojok kanan atas, misal SM-ICB/001",
  "document_serial_no": "nomor seri 6 digit, misal 001518",
  "origin_floor": "lantai asal (dari field Lantai di bagian atas)",
  "origin_unit": "unit asal (dari field Unit di bagian atas)",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "dest_address": "alamat tujuan",
  "dest_floor": "lantai tujuan",
  "dest_phone": "nomor telepon (digit saja)",
  "items": [
    {
      "item_name": "nama barang",
      "quantity": 1,
      "unit": "satuan (kotak/pcs/unit/dll)",
      "remarks": ""
    }
  ]
}

Jika suatu field tidak terbaca atau tidak ada, isi dengan null (bukan string kosong).
Untuk items, jika tidak ada barang tertulis, kembalikan array kosong [].
PROMPT;

        return $this->callVisionApi($image, $prompt, 'SIKM');
    }

    /**
     * Ekstrak data SIK dari gambar menggunakan AI Vision
     *
     * @param UploadedFile $image
     * @return array|null — Data terstruktur, atau null jika gagal
     */
    public function extractSikData(UploadedFile $image): ?array
    {
        $prompt = <<<'PROMPT'
Kamu adalah asisten document reader. Lihat gambar form "SURAT IZIN KERJA (SIK)" ini dan ekstrak SEMUA data yang tertulis, termasuk tulisan tangan.

Perhatikan layout form:
- Nomor seri dokumen
- Jumlah pekerja
- Tanggal mulai dan selesai
- Jam mulai dan selesai
- Lokasi pekerjaan
- Jenis pekerjaan
- Deskripsi pekerjaan

PENTING:
- Baca tulisan tangan dengan teliti
- Untuk tanggal, konversi ke format YYYY-MM-DD
- Untuk waktu, konversi ke format HH:MM (24 jam)
- JANGAN ambil data dari bagian catatan/footer form

Kembalikan HANYA JSON (tanpa markdown fence) dengan format:
{
  "document_serial_no": "nomor seri dokumen",
  "worker_count": 1,
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "location": "lokasi pekerjaan",
  "job_type": "jenis pekerjaan",
  "description": "deskripsi (jika ada)"
}

Jika suatu field tidak terbaca atau tidak ada, isi dengan null.
PROMPT;

        return $this->callVisionApi($image, $prompt, 'SIK');
    }

    /**
     * Panggil AI Vision API (routing ke provider yang dikonfigurasi)
     *
     * @param UploadedFile $image
     * @param string $prompt
     * @param string $docType — Untuk logging
     * @return array|null
     */
    protected function callVisionApi(UploadedFile $image, string $prompt, string $docType): ?array
    {
        Log::info('AI_OCR_START', [
            'doc_type' => $docType,
            'filename' => $image->getClientOriginalName(),
            'model' => $this->model,
            'provider' => $this->provider,
        ]);

        try {
            // Encode gambar ke base64
            $imageContent = file_get_contents($image->getRealPath());
            $base64Image = base64_encode($imageContent);
            $mimeType = $image->getMimeType() ?: 'image/jpeg';

            // Route ke provider yang sesuai
            if ($this->provider === 'openrouter') {
                $response = $this->callOpenRouter($base64Image, $mimeType, $prompt);
            } else {
                $response = $this->callGeminiDirect($base64Image, $mimeType, $prompt);
            }

            if (!$response->successful()) {
                Log::error('AI_OCR_API_ERROR', [
                    'doc_type' => $docType,
                    'provider' => $this->provider,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            // Extract text dari response sesuai provider
            if ($this->provider === 'openrouter') {
                $result = $response->json();
                $text = $result['choices'][0]['message']['content'] ?? null;
            } else {
                $result = $response->json();
                $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;
            }

            if (!$text) {
                Log::error('AI_OCR_EMPTY_RESPONSE', [
                    'doc_type' => $docType,
                    'result' => $result,
                ]);
                return null;
            }

            Log::debug('AI_OCR_RAW_RESPONSE', [
                'doc_type' => $docType,
                'text' => $text,
            ]);

            // Parse JSON response — clean up potential markdown fences
            $cleanText = trim($text);
            $cleanText = preg_replace('/^```(?:json)?\s*/i', '', $cleanText);
            $cleanText = preg_replace('/\s*```\s*$/i', '', $cleanText);

            $data = json_decode($cleanText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('AI_OCR_JSON_PARSE_ERROR', [
                    'doc_type' => $docType,
                    'json_error' => json_last_error_msg(),
                    'raw_text' => $cleanText,
                ]);
                return null;
            }

            // Sanitize dan validasi data
            $data = $this->sanitizeData($data, $docType);

            Log::info('AI_OCR_SUCCESS', [
                'doc_type' => $docType,
                'fields_extracted' => array_keys($data),
                'non_null_fields' => count(array_filter($data, fn($v) => $v !== null && $v !== '' && $v !== [])),
            ]);

            return $data;

        } catch (\Exception $e) {
            Log::error('AI_OCR_EXCEPTION', [
                'doc_type' => $docType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Sanitize data hasil AI — validasi format tanggal/waktu, trim string, dll.
     */
    protected function sanitizeData(array $data, string $docType): array
    {
        // Trim semua string values
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = trim($value);
                // Convert string "null" ke actual null
                if (strtolower($data[$key]) === 'null' || $data[$key] === '') {
                    $data[$key] = null;
                }
            }
        }

        // Validasi format tanggal (YYYY-MM-DD)
        foreach (['start_date', 'end_date'] as $dateField) {
            if (isset($data[$dateField]) && $data[$dateField] !== null) {
                if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data[$dateField])) {
                    Log::warning('AI_OCR_INVALID_DATE', [
                        'field' => $dateField,
                        'value' => $data[$dateField],
                    ]);
                    $data[$dateField] = null;
                }
            }
        }

        // Validasi format waktu (HH:MM)
        foreach (['start_time', 'end_time'] as $timeField) {
            if (isset($data[$timeField]) && $data[$timeField] !== null) {
                // Normalize dot to colon (22.00 → 22:00)
                $data[$timeField] = str_replace('.', ':', $data[$timeField]);
                if (!preg_match('/^\d{2}:\d{2}$/', $data[$timeField])) {
                    // Try padding
                    if (preg_match('/^(\d{1,2}):(\d{2})$/', $data[$timeField], $m)) {
                        $data[$timeField] = sprintf('%02d:%02d', $m[1], $m[2]);
                    } else {
                        $data[$timeField] = null;
                    }
                }
            }
        }

        // Sanitize phone (hanya digit)
        if (isset($data['dest_phone']) && $data['dest_phone'] !== null) {
            $data['dest_phone'] = preg_replace('/[^\d]/', '', $data['dest_phone']);
            if (strlen($data['dest_phone']) < 8) {
                $data['dest_phone'] = null;
            }
        }

        // Sanitize items (untuk SIKMB)
        if (isset($data['items']) && is_array($data['items'])) {
            $sanitizedItems = [];
            foreach ($data['items'] as $item) {
                if (!is_array($item)) continue;
                $itemName = trim($item['item_name'] ?? '');
                if (empty($itemName)) continue;

                $sanitizedItems[] = [
                    'item_name' => $itemName,
                    'quantity' => max(1, intval($item['quantity'] ?? 1)),
                    'unit' => trim($item['unit'] ?? 'Unit') ?: 'Unit',
                    'remarks' => trim($item['remarks'] ?? ''),
                ];
            }
            $data['items'] = $sanitizedItems;
        }

        // Sanitize worker_count (untuk SIK)
        if (isset($data['worker_count'])) {
            $data['worker_count'] = max(1, intval($data['worker_count']));
        }

        return $data;
    }

    /**
     * Panggil Gemini API langsung (Google generativelanguage.googleapis.com)
     *
     * @param string $base64Image
     * @param string $mimeType
     * @param string $prompt
     * @return \Illuminate\Http\Client\Response
     */
    protected function callGeminiDirect(string $base64Image, string $mimeType, string $prompt)
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";

        return Http::timeout(60)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$url}?key={$this->apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inlineData' => [
                                    'mimeType' => $mimeType,
                                    'data' => $base64Image,
                                ],
                            ],
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                    'maxOutputTokens' => 2048,
                    'responseMimeType' => 'application/json',
                ],
            ]);
    }

    /**
     * Panggil OpenRouter API (OpenAI-compatible format)
     *
     * Endpoint: https://openrouter.ai/api/v1/chat/completions
     * Auth: Bearer token
     * Format: OpenAI chat completions dengan vision (image_url data URI)
     *
     * Model gratis yang support vision:
     * - baidu/qianfan-ocr-fast:free
     * - google/gemini-2.0-flash-exp:free
     * - meta-llama/llama-3.2-90b-vision-instruct:free
     *
     * @param string $base64Image
     * @param string $mimeType
     * @param string $prompt
     * @return \Illuminate\Http\Client\Response
     */
    protected function callOpenRouter(string $base64Image, string $mimeType, string $prompt)
    {
        return Http::timeout(60)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer {$this->apiKey}",
                'HTTP-Referer' => config('app.url', 'http://localhost'),
                'X-Title' => config('app.name', 'Mall Approval System'),
            ])
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => "data:{$mimeType};base64,{$base64Image}",
                                ],
                            ],
                            [
                                'type' => 'text',
                                'text' => $prompt,
                            ],
                        ],
                    ],
                ],
                'temperature' => 0.1,
                'max_tokens' => 2048,
            ]);
    }
}
