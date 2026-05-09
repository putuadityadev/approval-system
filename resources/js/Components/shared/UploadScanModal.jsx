import { useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * UploadScanModal
 *
 * Modal untuk upload surat dan scan dengan OCR sebelum ke form.
 *
 * Komponen ini digunakan untuk:
 * - Pilih jenis surat (LOADING_IN/LOADING_OUT/IJIN_KERJA)
 * - Upload file surat (PDF/image)
 * - Scan dengan OCR
 * - Redirect ke form page dengan data pre-filled
 *
 * Cara kerjanya:
 * 1. User pilih jenis surat
 * 2. User upload file
 * 3. User klik "Next"
 * 4. Loading OCR scan
 * 5. Redirect ke form page dengan OCR data
 *
 * Props:
 * - isOpen: boolean (required) — Modal open/close state
 * - onClose: function (required) — Callback untuk close modal
 */
export default function UploadScanModal({ isOpen, onClose }) {
    const [requestType, setRequestType] = useState('LOADING_IN');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Handle file selection
     */
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        
        if (!file) {
            return;
        }

        // Validasi file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('File harus berupa JPG, PNG, atau PDF.');
            return;
        }

        // Validasi file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Ukuran file maksimal 10MB.');
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
     * Handle upload and scan
     */
    const handleUploadAndScan = () => {
        if (!selectedFile) {
            setError('Pilih file terlebih dahulu.');
            return;
        }

        if (!requestType) {
            setError('Pilih jenis surat terlebih dahulu.');
            return;
        }

        setIsScanning(true);
        setError(null);

        // Gunakan Inertia router untuk handle CSRF otomatis
        router.post(
            route('vendor.requests.upload-scan'),
            {
                form_image: selectedFile,
                request_type: requestType,
            },
            {
                forceFormData: true, // Force multipart/form-data untuk file upload
                onError: (errors) => {
                    console.error('Upload and scan error:', errors);
                    
                    // Handle validation errors
                    if (errors.form_image) {
                        setError(errors.form_image);
                    } else if (errors.request_type) {
                        setError(errors.request_type);
                    } else {
                        setError('Gagal upload dan scan. Silakan coba lagi.');
                    }
                    
                    setIsScanning(false);
                },
                onSuccess: () => {
                    // Inertia akan handle redirect otomatis dari controller
                    // Modal akan auto-close karena page berubah
                },
                onFinish: () => {
                    // Callback ini dipanggil setelah request selesai
                },
            }
        );
    };

    /**
     * Handle close modal
     */
    const handleClose = () => {
        if (!isScanning) {
            setRequestType('LOADING_IN');
            setSelectedFile(null);
            setPreviewUrl(null);
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            📄 Upload Surat
                        </h2>
                        {!isScanning && (
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Step 1: Pilih Jenis Surat */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                1. Pilih Jenis Surat
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRequestType('LOADING_IN')}
                                    disabled={isScanning}
                                    className={`p-4 border-2 rounded-lg transition-all ${
                                        requestType === 'LOADING_IN'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="text-2xl mb-2">📦</div>
                                    <div className="text-sm font-medium">Barang Masuk</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRequestType('LOADING_OUT')}
                                    disabled={isScanning}
                                    className={`p-4 border-2 rounded-lg transition-all ${
                                        requestType === 'LOADING_OUT'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="text-2xl mb-2">📤</div>
                                    <div className="text-sm font-medium">Barang Keluar</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRequestType('IJIN_KERJA')}
                                    disabled={isScanning}
                                    className={`p-4 border-2 rounded-lg transition-all ${
                                        requestType === 'IJIN_KERJA'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="text-2xl mb-2">🔧</div>
                                    <div className="text-sm font-medium">Izin Kerja</div>
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Upload File */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                2. Upload File Surat
                            </label>
                            
                            {!selectedFile ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                                        onChange={handleFileSelect}
                                        disabled={isScanning}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`cursor-pointer ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="text-4xl mb-3">📁</div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            Klik untuk upload atau drag & drop
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            JPG, PNG, atau PDF (Max 10MB)
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="border border-gray-300 rounded-lg p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Preview */}
                                        <div className="flex-shrink-0">
                                            {previewUrl && selectedFile.type.startsWith('image/') ? (
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-24 h-24 object-cover rounded border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                                    <span className="text-3xl">📄</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {selectedFile.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        {!isScanning && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                                className="text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Info Note */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-800">
                                <strong>💡 Tips:</strong> Pastikan foto surat jelas dan tidak blur untuk hasil OCR yang optimal.
                                Sistem akan otomatis mengisi form berdasarkan data yang terdeteksi dari surat.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isScanning}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={handleUploadAndScan}
                            disabled={!selectedFile || !requestType || isScanning}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isScanning ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Scanning...
                                </span>
                            ) : (
                                '🔍 Scan & Lanjutkan'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
