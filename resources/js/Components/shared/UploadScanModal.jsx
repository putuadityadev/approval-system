import { useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * UploadScanModal
 *
 * Modal untuk pilih kategori surat dan langsung redirect ke form kosong.
 * 
 * PERUBAHAN:
 * - OCR scan DINONAKTIFKAN
 * - TIDAK ADA upload foto di awal
 * - User langsung masuk ke form kosong untuk input manual
 * - Foto surat akan diupload saat submit form (bukan di awal)
 */
export default function UploadScanModal({ isOpen, onClose }) {
    const [requestType, setRequestType] = useState('LOADING_IN');

    /**
     * handleProceed
     * 
     * Apa yang dilakukan:
     * Redirect langsung ke form kosong sesuai kategori yang dipilih
     * 
     * Cara kerja:
     * 1. Validasi kategori sudah dipilih
     * 2. Tentukan route tujuan berdasarkan kategori
     * 3. Redirect ke form page dengan Inertia router
     */
    const handleProceed = () => {
        if (!requestType) {
            return;
        }

        // Tentukan route tujuan berdasarkan kategori
        let redirectUrl;
        if (requestType === 'LOADING_IN') {
            redirectUrl = route('vendor.requests.create.sikmb', { type: 'LOADING_IN' });
        } else if (requestType === 'LOADING_OUT') {
            redirectUrl = route('vendor.requests.create.sikmb', { type: 'LOADING_OUT' });
        } else if (requestType === 'IJIN_KERJA') {
            redirectUrl = route('vendor.requests.create.sik');
        }

        // Redirect ke form page
        router.visit(redirectUrl);
    };

    const handleClose = () => {
        setRequestType('LOADING_IN');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
                    <button
                        onClick={handleClose}
                        className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1.5 hover:bg-muted focus:outline-none flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 md:p-6 flex flex-col space-y-5 overflow-y-auto">
                    {/* Pilih Kategori */}
                    <section>
                        <h3 className="text-[13px] font-bold text-card-foreground mb-3 tracking-tight">Pilih Kategori Surat</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Option LOADING IN */}
                            <div 
                                onClick={() => setRequestType('LOADING_IN')}
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
                                onClick={() => setRequestType('LOADING_OUT')}
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
                                onClick={() => setRequestType('IJIN_KERJA')}
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

                    {/* Info Note */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-600 text-[20px] flex-shrink-0 mt-0.5">info</span>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900 mb-1">Input Manual</h4>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    Anda akan mengisi form secara manual. Upload foto surat bersifat <strong>opsional</strong> dan bisa dilakukan saat mengisi form.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3.5 border-t border-border bg-muted/30 rounded-b-xl flex items-center justify-end space-x-3 shrink-0">
                    <button 
                        onClick={handleClose}
                        className="px-4 py-2 rounded text-[13px] font-bold text-slate-500 hover:text-slate-800 hover:bg-muted transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleProceed}
                        className="px-5 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all duration-200 flex items-center space-x-2 text-[13px] font-bold"
                    >
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        <span>Lanjut ke Form</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
