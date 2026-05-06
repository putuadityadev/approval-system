# 📸 OCR Setup Guide

## Overview

Fitur OCR (Optical Character Recognition) memungkinkan vendor untuk upload foto surat yang sudah diisi, kemudian sistem akan otomatis ekstrak data dari gambar tersebut untuk pre-fill form.

## 🔧 Requirements

### 1. Install Tesseract OCR

Tesseract adalah OCR engine open-source yang digunakan untuk ekstraksi teks dari gambar.

#### Windows

**Option A: Using Chocolatey (Recommended)**
```bash
choco install tesseract
```

**Option B: Manual Installation**
1. Download installer dari: https://github.com/UB-Mannheim/tesseract/wiki
2. Install ke `C:\Program Files\Tesseract-OCR\`
3. Tambahkan ke PATH environment variable:
   - Buka System Properties → Environment Variables
   - Edit PATH, tambahkan: `C:\Program Files\Tesseract-OCR\`

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-ind  # Bahasa Indonesia
```

#### macOS
```bash
brew install tesseract
brew install tesseract-lang  # Untuk bahasa Indonesia
```

### 2. Verify Installation

```bash
tesseract --version
```

Output yang diharapkan:
```
tesseract 5.x.x
```

### 3. Install PHP Package

```bash
composer install
```

Package `thiagoalessio/tesseract_ocr` sudah ditambahkan di `composer.json`.

## 📁 File Structure

```
app/
├── Services/
│   └── OcrService.php              # Service untuk OCR logic
├── Http/
│   └── Controllers/
│       └── Vendor/
│           └── OcrController.php   # Controller untuk OCR endpoints

resources/js/
└── Components/
    └── shared/
        └── OcrUpload.jsx           # React component untuk upload & OCR
```

## 🚀 Usage

### Backend (Laravel)

#### OcrService Methods

```php
// Ekstrak data dari surat SIKMB
$data = $ocrService->extractSikmData($uploadedFile);

// Ekstrak data dari surat SIK
$data = $ocrService->extractSikData($uploadedFile);
```

#### API Endpoints

```
POST /vendor/ocr/extract-sikmb
POST /vendor/ocr/extract-sik
```

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "message": "Data berhasil diekstrak dari gambar.",
  "data": {
    "document_serial_no": "SIK/2024/001",
    "start_date": "2024-05-10",
    "end_date": "2024-05-15",
    "start_time": "08:00",
    "end_time": "17:00",
    "location": "Lantai 3, Unit A",
    "job_type": "Perbaikan AC",
    "worker_count": 3,
    "description": "Perbaikan AC yang rusak"
  }
}
```

### Frontend (React)

#### Import Component

```jsx
import OcrUpload from '@/Components/shared/OcrUpload';
```

#### Usage in Form

```jsx
export default function CreateSikForm() {
    const [formData, setFormData] = useState({
        document_serial_no: '',
        worker_count: '',
        start_date: '',
        end_date: '',
        // ... other fields
    });

    /**
     * Handle data dari OCR
     * Data hasil ekstraksi akan pre-fill form
     */
    const handleOcrDataExtracted = (ocrData) => {
        setFormData(prevData => ({
            ...prevData,
            ...ocrData, // Merge OCR data dengan form data
        }));
        
        // Optional: Show success message
        alert('Data berhasil diekstrak! Silakan cek dan edit jika perlu.');
    };

    return (
        <div>
            {/* OCR Upload Component */}
            <OcrUpload
                type="sik"
                onDataExtracted={handleOcrDataExtracted}
                className="mb-6"
            />

            {/* Form Fields */}
            <form>
                <input
                    type="text"
                    value={formData.document_serial_no}
                    onChange={(e) => setFormData({...formData, document_serial_no: e.target.value})}
                />
                {/* ... other fields */}
            </form>
        </div>
    );
}
```

## 🎯 OCR Pattern Recognition

### SIKMB (Surat Izin Keluar/Masuk Barang)

Pattern yang dikenali:
- **No. Seri**: `No. Seri: ABC123` atau `Serial No: ABC123`
- **Tanggal**: `Tanggal Mulai: 10/05/2024` atau `Start Date: 10-05-2024`
- **Jam**: `Jam Mulai: 08:00` atau `Start Time: 08:00`
- **Alamat**: `Alamat Tujuan: Jl. Sudirman No. 123`
- **Telepon**: `Telepon: 081234567890`
- **Daftar Barang**: Table format dengan kolom Nama Barang, Jumlah, Satuan

### SIK (Surat Izin Kerja)

Pattern yang dikenali:
- **No. Seri**: `No. Seri: SIK/2024/001`
- **Jumlah Pekerja**: `Jumlah Pekerja: 5` atau `Worker Count: 5`
- **Tanggal**: `Tanggal Mulai: 10/05/2024`
- **Jam**: `Jam Mulai: 08:00`
- **Lokasi**: `Lokasi: Lantai 3, Unit A`
- **Jenis Pekerjaan**: `Jenis Pekerjaan: Perbaikan AC`
- **Deskripsi**: `Deskripsi: Perbaikan AC yang rusak`

## 🔍 Troubleshooting

### 1. Tesseract Not Found

**Error:**
```
TesseractNotFound: tesseract is not installed or it's not in your PATH
```

**Solution:**
- Pastikan Tesseract sudah terinstall
- Tambahkan Tesseract ke PATH environment variable
- Restart terminal/command prompt setelah install

### 2. OCR Result Empty

**Error:**
```
Tidak ada teks yang berhasil diekstrak dari gambar.
```

**Possible Causes:**
- Gambar terlalu blur atau resolusi rendah
- Gambar tidak mengandung teks
- Format gambar tidak didukung

**Solution:**
- Gunakan gambar dengan resolusi tinggi (minimal 300 DPI)
- Pastikan teks di gambar jelas dan tidak blur
- Gunakan format JPG atau PNG

### 3. Inaccurate OCR Results

**Possible Causes:**
- Gambar tidak jelas
- Font yang tidak umum
- Teks terlalu kecil
- Background yang kompleks

**Solution:**
- Gunakan gambar dengan kontras tinggi (teks hitam, background putih)
- Pastikan pencahayaan gambar baik
- Crop gambar hanya pada area yang mengandung teks
- User bisa edit manual hasil OCR di form

### 4. Language Not Supported

**Error:**
```
Error opening data file /usr/share/tesseract-ocr/4.00/tessdata/ind.traineddata
```

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr-ind

# macOS
brew install tesseract-lang

# Windows
# Download language data dari: https://github.com/tesseract-ocr/tessdata
# Copy file ind.traineddata ke: C:\Program Files\Tesseract-OCR\tessdata\
```

## 📊 Performance Tips

### 1. Image Preprocessing

Untuk hasil OCR yang lebih baik, lakukan preprocessing pada gambar:
- Convert ke grayscale
- Increase contrast
- Remove noise
- Deskew (straighten) image

### 2. Optimize Image Size

- Resize gambar ke ukuran optimal (1000-2000px width)
- Compress gambar untuk upload yang lebih cepat
- Gunakan format JPG dengan quality 85-90%

### 3. Caching

Jika gambar yang sama di-upload berulang kali, consider caching hasil OCR.

## 🔐 Security Considerations

1. **File Validation**
   - Validasi file type (hanya image)
   - Validasi file size (max 5MB)
   - Scan for malware jika perlu

2. **Rate Limiting**
   - Limit jumlah OCR request per user per menit
   - Prevent abuse dengan throttling

3. **Temporary File Cleanup**
   - Hapus temporary file setelah OCR selesai
   - Jangan simpan uploaded file permanent kecuali diperlukan

## 📝 Future Improvements

1. **Advanced OCR**
   - Gunakan Google Cloud Vision API atau AWS Textract untuk akurasi lebih tinggi
   - Support PDF file
   - Support multiple pages

2. **Machine Learning**
   - Train custom model untuk format surat spesifik
   - Improve pattern recognition dengan ML

3. **User Feedback**
   - Allow user untuk report incorrect OCR results
   - Use feedback untuk improve OCR accuracy

## 📚 References

- [Tesseract OCR Documentation](https://tesseract-ocr.github.io/)
- [thiagoalessio/tesseract_ocr PHP Package](https://github.com/thiagoalessio/tesseract_ocr)
- [Tesseract Language Data](https://github.com/tesseract-ocr/tessdata)
