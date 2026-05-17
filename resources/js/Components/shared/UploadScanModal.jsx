import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import LoadingScan from './LoadingScan';

/**
 * UploadScanModal
 *
 * Modal untuk upload surat dan scan dengan OCR sebelum ke form, 
 * direfaktor agar sesuai dengan desain UI dari Stitch.
 */
export default function UploadScanModal({ isOpen, onClose }) {
    const [requestType, setRequestType] = useState('LOADING_IN');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('File harus berupa JPG, PNG, atau PDF.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Ukuran file maksimal 10MB.');
            return;
        }

        setError(null);
        setSelectedFile(file);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null); // No preview for PDF
        }
    };

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

        router.post(
            route('vendor.requests.upload-scan'),
            {
                form_image: selectedFile,
                request_type: requestType,
            },
            {
                forceFormData: true,
                onError: (errors) => {
                    if (errors.form_image) setError(errors.form_image);
                    else if (errors.request_type) setError(errors.request_type);
                    else setError('Gagal upload dan scan. Silakan coba lagi.');
                    setIsScanning(false);
                },
                onFinish: () => {
                    // Prevent stuck loading on non-validation server errors (500, etc)
                    setIsScanning(false);
                }
            }
        );
    };

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
        <>
            <LoadingScan isVisible={isScanning} />
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ${isScanning ? 'hidden' : ''}`}>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Modal Container */}
            <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl flex flex-col relative z-10 max-h-[95vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30 rounded-t-xl shrink-0">
                    <h2 className="text-[16px] font-bold text-card-foreground">Buat Pengajuan Baru</h2>
                    {!isScanning && (
                        <button
                            onClick={handleClose}
                            className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1.5 hover:bg-muted focus:outline-none flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    )}
                </div>

                {/* Modal Body */}
                <div className="p-5 md:p-6 flex flex-col space-y-5 overflow-y-auto">
                    {/* Step 1 */}
                    <section>
                        <h3 className="text-[13px] font-bold text-card-foreground mb-3 tracking-tight">1. Pilih Kategori</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Option LOADING IN */}
                            <div 
                                onClick={() => !isScanning && setRequestType('LOADING_IN')}
                                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-sm flex flex-col items-start relative h-full ${requestType === 'LOADING_IN' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50 bg-card'}`}
                            >
                                {requestType === 'LOADING_IN' && (
                                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-[12px] font-bold" style={{fontVariationSettings: "'wght' 700"}}>check</span>
                                    </div>
                                )}
                                <div className={`rounded-full p-2 mb-2 transition-colors ${requestType === 'LOADING_IN' ? 'bg-card text-primary shadow-sm' : 'bg-muted text-muted-foreground'}`}>
                                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                                </div>
                                <h4 className="font-bold text-[13px] text-card-foreground mb-0.5">Barang Masuk</h4>
                                <p className="text-[11px] text-muted-foreground font-medium leading-tight">Pengiriman (SIKMB)</p>
                            </div>

                            {/* Option LOADING OUT */}
                            <div 
                                onClick={() => !isScanning && setRequestType('LOADING_OUT')}
                                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-sm flex flex-col items-start relative h-full ${requestType === 'LOADING_OUT' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50 bg-card'}`}
                            >
                                {requestType === 'LOADING_OUT' && (
                                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-[12px] font-bold" style={{fontVariationSettings: "'wght' 700"}}>check</span>
                                    </div>
                                )}
                                <div className={`rounded-full p-2 mb-2 transition-colors ${requestType === 'LOADING_OUT' ? 'bg-card text-primary shadow-sm' : 'bg-muted text-muted-foreground'}`}>
                                    <span className="material-symbols-outlined text-[20px]" style={{transform: "rotate(180deg)"}}>local_shipping</span>
                                </div>
                                <h4 className="font-bold text-[13px] text-card-foreground mb-0.5">Barang Keluar</h4>
                                <p className="text-[11px] text-muted-foreground font-medium leading-tight">Pengeluaran (SIKMB)</p>
                            </div>

                            {/* Option SIK */}
                            <div 
                                onClick={() => !isScanning && setRequestType('IJIN_KERJA')}
                                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-sm flex flex-col items-start relative h-full ${requestType === 'IJIN_KERJA' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50 bg-card'}`}
                            >
                                {requestType === 'IJIN_KERJA' && (
                                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-[12px] font-bold" style={{fontVariationSettings: "'wght' 700"}}>check</span>
                                    </div>
                                )}
                                <div className={`rounded-full p-2 mb-2 transition-colors ${requestType === 'IJIN_KERJA' ? 'bg-card text-primary shadow-sm' : 'bg-muted text-muted-foreground'}`}>
                                    <span className="material-symbols-outlined text-[20px]">construction</span>
                                </div>
                                <h4 className="font-bold text-[13px] text-card-foreground mb-0.5">Izin Kerja (SIK)</h4>
                                <p className="text-[11px] text-muted-foreground font-medium leading-tight">Maintenance & kontraktor</p>
                            </div>
                        </div>
                    </section>

                    {/* Step 2 */}
                    <section>
                        <h3 className="text-[13px] font-bold text-card-foreground mb-3 tracking-tight">2. Upload Dokumen Fisik</h3>
                        
                        {!selectedFile ? (
                            <div 
                                className="border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors duration-200 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer relative group"
                                onClick={() => !isScanning && fileInputRef.current?.click()}
                            >
                                <input 
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf" 
                                    className="hidden" 
                                    onChange={handleFileSelect}
                                    disabled={isScanning}
                                />
                                <div className="bg-card shadow-sm rounded-full p-3 mb-3 text-primary group-hover:scale-110 transition-transform duration-300">
                                    <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                                </div>
                                <h4 className="text-[14px] font-bold text-card-foreground mb-1">Pilih file atau seret ke sini</h4>
                                <p className="text-[12px] text-muted-foreground mb-3 font-medium max-w-sm">
                                    Sistem akan otomatis memindai form Anda.
                                </p>
                                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-bold bg-muted px-2.5 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-[12px]">info</span>
                                    <span>JPG, PNG, PDF (Max 10MB)</span>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-border rounded-lg p-4 bg-card">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-24 h-24 object-cover rounded border border-border"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 bg-muted rounded border border-border flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 py-2">
                                        <div className="text-sm font-bold text-card-foreground truncate">
                                            {selectedFile.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 font-medium">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>

                                    {!isScanning && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors mt-1"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3.5 border-t border-border bg-muted/30 rounded-b-xl flex items-center justify-end space-x-3 shrink-0">
                    <button 
                        onClick={handleClose}
                        disabled={isScanning}
                        className="px-4 py-2 rounded text-[13px] font-bold text-slate-500 hover:text-slate-800 hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleUploadAndScan}
                        disabled={!selectedFile || isScanning}
                        className="px-5 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all duration-200 flex items-center space-x-2 text-[13px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isScanning ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Scanning...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">document_scanner</span>
                                <span>Scan & Lanjut</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            </div>
        </>
    );
}
