# Fix Preview Surat & Session Persistence

## 🐛 Bug yang Diperbaiki

### 1. Preview Surat Tidak Muncul
**Masalah:**
- Preview surat tidak ditampilkan di form SIKMB/SIK
- File tidak ditemukan saat `createSikmb()` dipanggil
- Log menunjukkan: `"file_exists":false`

**Root Cause:**
- File disimpan dengan nama random (`store()`) yang sulit diprediksi
- File path tersimpan di session tapi file sudah tidak ada saat diakses
- Kemungkinan race condition atau file terhapus sebelum waktunya

**Solusi:**
- Gunakan `storeAs()` dengan nama file yang predictable: `user_{userId}_{timestamp}.{ext}`
- Tambahkan logging untuk track file existence
- Tambahkan error handling saat generate preview

### 2. Data OCR Hilang Saat Refresh
**Masalah:**
- Setelah upload & scan, data OCR pre-fill form
- Saat user refresh halaman, semua data hilang
- User harus upload ulang dan isi manual

**Root Cause:**
- Menggunakan `session()->flash()` yang hanya bertahan 1 request
- Flash session di-clear setelah redirect pertama
- Refresh = request baru = session kosong

**Solusi:**
- Gunakan regular session (bukan flash) agar data bertahan
- Session akan di-clear hanya setelah submit berhasil
- Data tetap ada meskipun user refresh berkali-kali

---

## 🔧 Perubahan Kode

### File: `app/Http/Controllers/Vendor/RequestController.php`

#### 1. Method `uploadAndScan()` - File Storage dengan Nama Predictable

**Sebelum:**
```php
// Simpan file ke temporary storage (session)
$tempPath = $file->store('temp/forms', 'local');
$fullPath = storage_path('app/' . $tempPath);
```

**Sesudah:**
```php
// Generate unique filename untuk user ini
$userId = Auth::id();
$timestamp = time();
$extension = $file->getClientOriginalExtension();
$uniqueFileName = "user_{$userId}_{$timestamp}.{$extension}";

// Simpan file ke temporary storage dengan nama yang predictable
$tempPath = $file->storeAs('temp/forms', $uniqueFileName, 'local');
$fullPath = storage_path('app/' . $tempPath);

Log::debug('VENDOR_UPLOAD_FILE_SAVED', [
    'user_id' => $userId,
    'temp_path' => $tempPath,
    'full_path' => $fullPath,
    'file_exists' => file_exists($fullPath),
]);
```

**Benefit:**
- File name predictable dan mudah di-debug
- Bisa track file per user dan timestamp
- Logging untuk verify file tersimpan dengan benar

#### 2. Method `uploadAndScan()` - Session Storage (Bukan Flash)

**Sebelum:**
```php
// Store data ke session dengan flash (persist across redirect)
session()->flash('upload_temp_path', $tempPath);
session()->flash('upload_file_name', $file->getClientOriginalName());
session()->flash('upload_request_type', $requestType);
session()->flash('upload_ocr_data', $ocrData);

// Also keep in regular session as backup
session([
    'upload_temp_path' => $tempPath,
    'upload_file_name' => $file->getClientOriginalName(),
    'upload_request_type' => $requestType,
    'upload_ocr_data' => $ocrData,
]);
```

**Sesudah:**
```php
// Store data ke session (TIDAK pakai flash agar bertahan sampai submit)
// Session akan di-clear saat submit berhasil
session([
    'upload_temp_path' => $tempPath,
    'upload_file_name' => $file->getClientOriginalName(),
    'upload_request_type' => $requestType,
    'upload_ocr_data' => $ocrData,
]);
```

**Benefit:**
- Data bertahan di session sampai submit berhasil
- User bisa refresh tanpa kehilangan data
- Lebih simple, tidak ada duplikasi flash + regular session

#### 3. Method `createSikmb()` - Improved Preview Generation

**Sebelum:**
```php
$previewUrl = null;
if ($tempPath && file_exists(storage_path('app/' . $tempPath))) {
    $fileContent = file_get_contents(storage_path('app/' . $tempPath));
    $mimeType = mime_content_type(storage_path('app/' . $tempPath));
    $previewUrl = 'data:' . $mimeType . ';base64,' . base64_encode($fileContent);
}
```

**Sesudah:**
```php
$fullPath = $tempPath ? storage_path('app/' . $tempPath) : null;
$fileExists = $fullPath && file_exists($fullPath);

$previewUrl = null;
if ($fileExists) {
    try {
        // Convert to base64 untuk preview
        $fileContent = file_get_contents($fullPath);
        $mimeType = mime_content_type($fullPath);
        $previewUrl = 'data:' . $mimeType . ';base64,' . base64_encode($fileContent);
        
        Log::debug('VENDOR_CREATE_SIKMB_PREVIEW_GENERATED', [
            'mime_type' => $mimeType,
            'preview_url_length' => strlen($previewUrl),
            'file_size' => strlen($fileContent),
        ]);
    } catch (\Exception $e) {
        Log::error('VENDOR_CREATE_SIKMB_PREVIEW_ERROR', [
            'temp_path' => $tempPath,
            'full_path' => $fullPath,
            'error' => $e->getMessage(),
        ]);
    }
}
```

**Benefit:**
- Error handling untuk catch exception saat generate preview
- Logging detail untuk debugging
- Lebih robust dan tidak crash jika file corrupt

#### 4. Method `storeSikmb()` & `storeSik()` - Session Cleanup

**Ditambahkan:**
```php
$submittedRequest = $this->requestService->submitSikmb($data);

// Hapus temporary file jika ada (ambil sebelum clear session)
$tempPath = session('upload_temp_path');
if ($tempPath && Storage::disk('local')->exists($tempPath)) {
    Storage::disk('local')->delete($tempPath);
    Log::debug('VENDOR_TEMP_FILE_DELETED', [
        'temp_path' => $tempPath,
    ]);
}

// Clear session data setelah submit berhasil
session()->forget(['upload_temp_path', 'upload_file_name', 'upload_request_type', 'upload_ocr_data']);

return redirect()->route('vendor.requests.show', $submittedRequest->id)
    ->with('success', 'Surat SIKMB berhasil diajukan!');
```

**Benefit:**
- Session di-clear setelah submit berhasil
- Temporary file dihapus untuk hemat storage
- Clean state untuk upload berikutnya

#### 5. Import Statement

**Ditambahkan:**
```php
use Illuminate\Support\Facades\Storage;
```

---

## 🧪 Testing

### Test Case 1: Upload & Scan → Preview Muncul
1. Login sebagai vendor
2. Klik "Buat Surat Baru" → Pilih "Barang Masuk"
3. Upload surat (JPEG/PNG)
4. Klik "Upload & Scan"
5. **Expected:** Redirect ke form dengan preview surat di kanan
6. **Verify:** Preview image muncul dengan benar

### Test Case 2: Refresh Halaman → Data Tetap Ada
1. Setelah upload & scan (form sudah pre-filled)
2. Refresh halaman (F5 atau Ctrl+R)
3. **Expected:** Data OCR tetap ada di form
4. **Expected:** Preview surat tetap muncul
5. **Verify:** User tidak perlu upload ulang

### Test Case 3: Submit → Session Cleared
1. Lengkapi form dan submit
2. **Expected:** Redirect ke detail request
3. **Expected:** Session data di-clear
4. **Expected:** Temporary file dihapus
5. **Verify:** Cek log untuk `VENDOR_TEMP_FILE_DELETED`

### Test Case 4: Multiple Users Concurrent Upload
1. User A upload surat
2. User B upload surat (bersamaan)
3. **Expected:** File tidak bentrok (karena nama file include user_id)
4. **Expected:** Masing-masing user lihat preview surat sendiri
5. **Verify:** Cek `storage/app/temp/forms/` untuk file terpisah

---

## 📊 Log Keys untuk Monitoring

### Success Logs
- `VENDOR_UPLOAD_FILE_SAVED` - File berhasil disimpan
- `VENDOR_CREATE_SIKMB_PREVIEW_GENERATED` - Preview berhasil di-generate
- `VENDOR_TEMP_FILE_DELETED` - Temporary file berhasil dihapus

### Warning Logs
- `VENDOR_CREATE_SIKMB_NO_PREVIEW` - File tidak ditemukan untuk preview

### Error Logs
- `VENDOR_CREATE_SIKMB_PREVIEW_ERROR` - Error saat generate preview
- `VENDOR_CREATE_SIK_PREVIEW_ERROR` - Error saat generate preview SIK

---

## 🎯 UX Improvements

### Sebelum Fix:
❌ Preview tidak muncul → User bingung apakah upload berhasil  
❌ Refresh → Data hilang → User harus upload ulang  
❌ User tidak bisa crosscheck form dengan surat asli  

### Setelah Fix:
✅ Preview muncul langsung setelah upload  
✅ Refresh → Data tetap ada → UX seamless  
✅ User bisa crosscheck form dengan surat di sebelah kanan  
✅ Split layout: Form (kiri) + Preview (kanan)  

---

## 🔄 Flow Lengkap

```
1. User upload surat
   ↓
2. File disimpan: storage/app/temp/forms/user_{id}_{timestamp}.jpg
   ↓
3. OCR ekstrak data
   ↓
4. Data + file path disimpan ke session (regular, bukan flash)
   ↓
5. Redirect ke form page
   ↓
6. Form page:
   - Ambil data dari session
   - Generate preview dari file
   - Pre-fill form dengan OCR data
   - Tampilkan preview di kanan
   ↓
7. User bisa refresh berkali-kali → Data tetap ada
   ↓
8. User submit form
   ↓
9. Submit berhasil:
   - Hapus temporary file
   - Clear session data
   - Redirect ke detail request
```

---

## 📝 Notes

- Session driver: `database` (dari `config/session.php`)
- Session lifetime: 120 menit
- Temporary files disimpan di: `storage/app/temp/forms/`
- Preview menggunakan base64 data URL (tidak perlu route khusus)
- File cleanup otomatis setelah submit berhasil

---

**Status:** ✅ Fixed  
**Tested:** Pending user testing  
**Date:** 2026-05-09
