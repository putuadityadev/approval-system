import { useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * OcrUpload
 *
 * Komponen untuk upload gambar surat dan ekstrak data dengan OCR.
 *
 * Komponen ini digunakan untuk:
 * - Upload gambar surat (SIK/SIKMB)
 * - Menampilkan preview gambar
 * - Trigger OCR extraction
 * - Menampilkan loading state saat OCR berjalan
 * - Callback dengan data hasil OCR untuk pre-fill form
 *
 * Cara kerjanya:
 * 1. User pilih file gambar
 * 2. Tampilkan preview gambar
 * 3. User klik tombol "Ekstrak Data"
 * 4. Upload gambar ke backend OCR endpoint
 * 5. Tampilkan loading state
 * 6. Terima response data dari OCR
 * 7. Panggil onDataExtracted callback dengan data
 * 8. Parent component akan pre-fill form dengan data
 *
 * Props:
 * - type: string (required) — "sikmb" atau "sik"
 * - onDataExtracted: function (required) — callback dengan data hasil OCR
 * - className: string (optional) — custom CSS class
 */
export default function OcrUpload({ type, onDataExtracted, className = '' }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Handle file selection
     *
     * Apa yang dilakukan:
     * Simpan file yang dipilih dan buat preview URL
     *
     * Langkah-langkah:
     * 1. Ambil file dari input
     * 2. Validasi file type (harus image)
     * 3. Buat preview URL dengan FileReader
     * 4. Set state selectedFile dan previewUrl
     */
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        
        if (!file) {
            return;
        }

        // Validasi file type
        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar (JPG atau PNG).');
            return;
        }

        // Validasi file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran file maksimal 5MB.');
            return;
        }

        setError(null);
        setSelectedFile(file);

        // Buat preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    /**
     * Handle OCR extraction
     *
     * Apa yang dilakukan:
     * Upload gambar ke backend dan ekstrak data dengan OCR
     *
     * Langkah-langkah:
     * 1. Validasi ada file yang dipilih
     * 2. Buat FormData dengan file
     * 3. Set loading state
     * 4. POST ke OCR endpoint sesuai type (sikmb/sik)
     * 5. Terima response data
     * 6. Panggil onDataExtracted callback
     * 7. Handle error jika gagal
     */
    const handleExtract = async () => {
        if (!selectedFile) {
            setError('Pilih gambar terlebih dahulu.');
            return;
        }

        setIsExtracting(true);
        setError(null);

        try {
            // Buat FormData
            const formData = new FormData();
            formData.append('image', selectedFile);

            // Tentukan endpoint berdasarkan type
            const endpoint = type === 'sikmb' 
                ? route('vendor.ocr.extract.sikmb')
                : route('vendor.ocr.extract.sik');

            // Upload dan ekstrak
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal ekstrak data dari gambar.');
            }

            // Panggil callback dengan data hasil OCR
            if (onDataExtracted && result.data) {
                onDataExtracted(result.data);
            }

        } catch (err) {
            console.error('OCR extraction error:', err);
            setError(err.message || 'Gagal ekstrak data. Silakan coba lagi atau isi form secara manual.');
        } finally {
            setIsExtracting(false);
        }
    };

    /**
     * Handle clear/reset
     *
     * Apa yang dilakukan:
     * Reset semua state ke kondisi awal
     */
    const handleClear = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
    };

    return (
        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📸 Upload Contoh Surat (Opsional)
                </h3>
                <p className="text-sm text-gray-600">
                    Upload foto surat yang sudah diisi untuk ekstrak data secara otomatis dengan OCR.
                    Data hasil ekstraksi akan mengisi form di bawah.
                </p>
            </div>

            {/* File Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Gambar Surat
                </label>
                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileSelect}
                    disabled={isExtracting}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Format: JPG atau PNG. Maksimal 5MB.
                </p>
            </div>

            {/* Preview Image */}
            {previewUrl && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview Gambar
                    </label>
                    <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                        <img
                            src={previewUrl}
                            alt="Preview surat"
                            className="w-full h-auto max-h-96 object-contain bg-gray-100"
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleExtract}
                    disabled={!selectedFile || isExtracting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {isExtracting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengekstrak Data...
                        </span>
                    ) : (
                        '🔍 Ekstrak Data dari Gambar'
                    )}
                </button>

                {selectedFile && !isExtracting && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Info Note */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                    <strong>💡 Tips:</strong> Pastikan gambar surat jelas dan tidak blur untuk hasil OCR yang optimal.
                    Jika hasil ekstraksi tidak akurat, Anda bisa edit manual di form di bawah.
                </p>
            </div>
        </div>
    );
}
