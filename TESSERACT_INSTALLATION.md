# 🔧 Tesseract OCR Installation Guide

**Date:** 6 Mei 2026  
**Status:** ⏳ In Progress  
**Environment:** Docker (laravel_app container)

---

## 🐛 Problem

```
Error! The command "tesseract" was not found.
Make sure you have Tesseract OCR installed on your system
```

**Root Cause:**
- PHP package `thiagoalessio/tesseract_ocr` ✅ installed (composer.json)
- Tesseract OCR binary ❌ NOT installed in Docker container

---

## ✅ Solution

### Option 1: Manual Installation (Quick Fix)

**Install di running container:**
```bash
# Update package list
docker exec laravel_app apt-get update

# Install Tesseract OCR + English language pack
docker exec laravel_app apt-get install -y tesseract-ocr tesseract-ocr-eng

# Verify installation
docker exec laravel_app tesseract --version
```

**Expected Output:**
```
tesseract 5.x.x
 leptonica-1.x.x
  libgif 5.x.x : libjpeg 6b (libjpeg-turbo 2.x.x) : libpng 1.x.x : libtiff 4.x.x : zlib 1.x.x : libwebp 1.x.x : libopenjp2 2.x.x
 Found AVX2
 Found AVX
 Found FMA
 Found SSE4.1
 Found OpenMP 201511
```

**Pros:**
- ✅ Quick fix (no rebuild needed)
- ✅ Test immediately

**Cons:**
- ❌ Not permanent (lost on container restart)
- ❌ Need to reinstall if rebuild

---

### Option 2: Dockerfile Update (Permanent Fix) ⭐ RECOMMENDED

**Update Dockerfile:**
```dockerfile
# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    tesseract-ocr \
    tesseract-ocr-eng  # ⭐ Added
```

**Rebuild Docker image:**
```bash
# Stop containers
docker-compose down

# Rebuild with no cache
docker-compose build --no-cache app

# Start containers
docker-compose up -d

# Verify installation
docker exec laravel_app tesseract --version
```

**Pros:**
- ✅ Permanent solution
- ✅ Consistent across environments
- ✅ Documented in Dockerfile

**Cons:**
- ❌ Requires rebuild (~5-10 minutes)
- ❌ Downtime during rebuild

---

## 📦 Package Details

### Tesseract OCR Packages:

| Package | Description | Size |
|---------|-------------|------|
| `tesseract-ocr` | Main Tesseract OCR engine | ~1MB |
| `tesseract-ocr-eng` | English language data | ~1MB |
| `tesseract-ocr-ind` | Indonesian language data (optional) | ~1MB |

### Additional Language Packs (Optional):

```bash
# Indonesian
docker exec laravel_app apt-get install -y tesseract-ocr-ind

# Multiple languages
docker exec laravel_app apt-get install -y \
    tesseract-ocr-eng \
    tesseract-ocr-ind \
    tesseract-ocr-chi-sim  # Simplified Chinese
```

---

## 🧪 Testing

### 1. Verify Installation:
```bash
docker exec laravel_app tesseract --version
```

### 2. Test OCR on Sample Image:
```bash
# Create test image with text
docker exec laravel_app bash -c "echo 'Hello World' | convert -pointsize 24 label:@- /tmp/test.png"

# Run OCR
docker exec laravel_app tesseract /tmp/test.png stdout
```

**Expected Output:**
```
Hello World
```

### 3. Test via Laravel:
```bash
# Via tinker
docker exec laravel_app php artisan tinker

# In tinker:
$ocr = new \thiagoalessio\TesseractOCR\TesseractOCR('/path/to/image.jpg');
echo $ocr->run();
```

### 4. Test via Upload & Scan Modal:
1. Login sebagai vendor
2. Klik "Buat Surat Baru"
3. Upload image surat
4. Klik "Scan & Lanjutkan"
5. ✅ Form should be pre-filled with OCR data

---

## 🔄 Current Status

### Installation Progress:

**Step 1: Update Dockerfile** ✅ DONE
```dockerfile
# Added tesseract-ocr and tesseract-ocr-eng to Dockerfile
```

**Step 2: Manual Installation** ✅ DONE
```bash
# Installed: tesseract 5.5.0
# Language packs: eng, osd
# Status: Ready to use
```

**Step 3: Verify Installation** ✅ DONE
```bash
$ docker exec laravel_app tesseract --version
tesseract 5.5.0
 leptonica-1.84.1
 Found AVX2, AVX, FMA, SSE4.1, OpenMP
```

**Step 4: Test OCR** ⏳ READY TO TEST
```bash
# Test via upload & scan modal
# Expected: Form pre-filled with OCR data
```

---

## 📊 Installation Size

**Total Size:**
- Tesseract OCR: ~1 MB
- Dependencies: ~99 MB (fonts, libraries, etc.)
- **Total: ~100 MB**

**Disk Space:**
- Before: ~500 MB (Docker image)
- After: ~600 MB (Docker image)
- **Increase: ~100 MB**

---

## 🐛 Troubleshooting

### Issue 1: "tesseract: command not found"

**Solution:**
```bash
# Check if installed
docker exec laravel_app which tesseract

# If not found, install
docker exec laravel_app apt-get update
docker exec laravel_app apt-get install -y tesseract-ocr tesseract-ocr-eng
```

---

### Issue 2: "Error opening data file"

**Cause:** Language data not installed

**Solution:**
```bash
# Install English language pack
docker exec laravel_app apt-get install -y tesseract-ocr-eng

# Verify language data
docker exec laravel_app tesseract --list-langs
```

**Expected Output:**
```
List of available languages (2):
eng
osd
```

---

### Issue 3: OCR Returns Empty String

**Possible Causes:**
1. Image quality too low
2. Text too small
3. Wrong language pack
4. Image format not supported

**Solution:**
```bash
# Test with high-quality image
# Ensure image has clear, readable text
# Use correct language pack
# Convert to supported format (PNG, JPG, TIFF)
```

---

### Issue 4: Permission Denied

**Cause:** File permissions issue

**Solution:**
```bash
# Fix permissions
docker exec laravel_app chown -R www-data:www-data /var/www/html/storage

# Verify
docker exec laravel_app ls -la /var/www/html/storage
```

---

## 📝 Notes

### Performance:
- OCR processing time: ~2-3 seconds per page
- Memory usage: ~50-100 MB per process
- CPU usage: ~50-80% during OCR

### Accuracy:
- Clear printed text: ~95-99%
- Handwritten text: ~60-80%
- Low quality images: ~50-70%
- Optimal DPI: 300 DPI

### Best Practices:
1. ✅ Use high-quality images (300 DPI)
2. ✅ Ensure good contrast (black text on white background)
3. ✅ Avoid skewed or rotated images
4. ✅ Use correct language pack
5. ✅ Pre-process images (resize, denoise, etc.)

---

## 🔗 Related Files

```bash
Dockerfile                                    # ✅ Updated with Tesseract
composer.json                                 # ✅ Has thiagoalessio/tesseract_ocr
app/Services/OcrService.php                   # Uses Tesseract
resources/js/Components/shared/UploadScanModal.jsx  # Upload & scan UI
app/Http/Controllers/Vendor/RequestController.php   # Calls OcrService
```

---

## 🚀 Next Steps

### After Installation Complete:

1. **Verify Installation:**
   ```bash
   docker exec laravel_app tesseract --version
   ```

2. **Test OCR:**
   ```bash
   # Upload sample image via modal
   # Check logs for OCR success
   tail -f storage/logs/laravel.log | grep OCR
   ```

3. **Rebuild Docker (Optional but Recommended):**
   ```bash
   docker-compose down
   docker-compose build --no-cache app
   docker-compose up -d
   ```

4. **Update Documentation:**
   - Mark installation as complete
   - Add performance metrics
   - Document any issues encountered

---

**Last Updated:** 6 Mei 2026  
**Status:** ✅ Installation Complete  
**Version:** Tesseract 5.5.0 with English language pack
