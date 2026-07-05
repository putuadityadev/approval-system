import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import SecurityMobileLayout from '@/Layouts/SecurityMobileLayout';
import SuratPreview from '@/Components/shared/SuratPreview';

/**
 * Security Request Detail
 *
 * Halaman detail request setelah QR scan dengan upload evidence.
 * Menggunakan mobile-first design.
 */
export default function RequestDetail({ auth, request, qrCodeUrl, formImageUrl, hasEvidence }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    };

    const { data, setData, post, processing, errors } = useForm({
        photos: [],
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            alert('Maksimal 5 foto evidence');
            return;
        }

        setSelectedFiles(files);
        setData('photos', files);

        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newUrls = previewUrls.filter((_, i) => i !== index);
        
        setSelectedFiles(newFiles);
        setPreviewUrls(newUrls);
        setData('photos', newFiles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('security.requests.evidence', request.id), {
            forceFormData: true,
        });
    };

    return (
        <SecurityMobileLayout auth={auth} activeTab="history">
            {/* Header */}
            <header className="bg-primary text-white sticky top-0 z-50 flex items-center w-full px-4 py-4 shadow-sm h-16 shrink-0">
                <Link href={route('security.requests.index')} className="p-2 -ml-2 mr-2 hover:bg-white/10 rounded-full transition-colors flex items-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="font-extrabold tracking-tight text-[20px] flex-1">Verification</h1>
            </header>

            <main className="px-4 py-6 space-y-6">
                {/* Status Card */}
                <div className={`bg-white rounded-xl shadow-sm p-6 border-t-4 ${
                    request.status === 'EXECUTED' ? 'border-emerald-500' : 'border-primary'
                } flex flex-col items-center text-center`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                        request.status === 'EXECUTED' ? 'bg-emerald-100 text-emerald-600' : 'bg-cyan-50 text-cyan-600'
                    }`}>
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {request.status === 'EXECUTED' ? 'verified' : 'assignment_turned_in'}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{request.vendor?.company_name}</h2>
                    <p className="text-sm text-slate-500 mb-4">{request.request_type}</p>
                    
                    <div className="flex gap-2 justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            request.status === 'EXECUTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                            {request.status === 'EXECUTED' ? 'Verified' : request.status}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                            {request.document_serial_no || request.id.substring(0,6)}
                        </span>
                    </div>
                </div>

                {/* Details Accordion / List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <details className="group">
                        <summary className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center cursor-pointer list-none">
                            <h3 className="font-bold text-slate-900 text-sm">Detail Lengkap Surat</h3>
                            <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-slate-500">expand_more</span>
                        </summary>
                        <div className="p-4">
                            {/* Preview Surat dalam format resmi */}
                            <SuratPreview 
                                request={request} 
                                type={request.request_type === 'IJIN_KERJA' ? 'sik' : 'sikmb'}
                            />
                        </div>
                    </details>
                </div>

                {/* Ringkasan Singkat untuk Mobile */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 text-sm">Ringkasan Info</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {request.sikmb_detail && (
                            <>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Waktu</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {request.sikmb_detail.start_date} ({request.sikmb_detail.start_time} - {request.sikmb_detail.end_time})
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lokasi</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        Lt. {request.sikmb_detail.origin_floor} → Lt. {request.sikmb_detail.dest_floor}
                                    </p>
                                </div>
                            </>
                        )}
                        {request.sik_detail && (
                            <>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Jenis Pekerjaan</p>
                                    <p className="text-sm font-medium text-slate-900">{request.sik_detail.job_type}</p>
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lokasi</p>
                                        <p className="text-sm font-medium text-slate-900">{request.sik_detail.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pekerja</p>
                                        <p className="text-sm font-medium text-slate-900">{request.sik_detail.worker_count} Orang</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Evidence Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-sm">Foto Evidence</h3>
                        {hasEvidence && (
                            <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                        )}
                    </div>
                    
                    <div className="p-4">
                        {hasEvidence ? (
                            <div className="grid grid-cols-2 gap-3">
                                {request.evidences?.map((evidence, index) => (
                                    <div key={evidence.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square">
                                        <img src={evidence.photo_url || '/placeholder.jpg'} alt="Evidence" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 inset-x-0 bg-black/50 p-1 text-center">
                                            <span className="text-[10px] text-white font-medium">{formatTime(evidence.uploaded_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {(errors && Object.keys(errors).length > 0) && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-4">
                                        {Object.values(errors)[0]}
                                    </div>
                                )}

                                <div>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">add_a_photo</span>
                                            <p className="text-sm font-medium text-slate-600">Ambil/Pilih Foto</p>
                                            <p className="text-xs text-slate-400 mt-1">Max 5 foto (20MB/foto)</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} disabled={processing} />
                                    </label>
                                </div>

                                {previewUrls.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-slate-200 snap-center">
                                                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 flex items-center justify-center w-6 h-6">
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button type="submit" disabled={processing || selectedFiles.length === 0} className="w-full bg-primary text-white rounded-xl py-3.5 font-bold shadow-sm flex justify-center items-center gap-2 hover:bg-cyan-600 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100">
                                    {processing ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">refresh</span>
                                            Mengupload...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">cloud_upload</span>
                                            Upload & Verifikasi
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Surat Dokumen (Opsional, Collapse by default in mobile to save space) */}
                {formImageUrl && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        <details className="group">
                            <summary className="p-4 bg-slate-50 flex justify-between items-center cursor-pointer list-none font-bold text-slate-900 text-sm">
                                Preview Surat Asli
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-slate-500">expand_more</span>
                            </summary>
                            <div className="p-4 border-t border-slate-100">
                                <img src={formImageUrl} alt="Preview Surat" className="w-full h-auto rounded-lg border border-slate-200" />
                                <a href={formImageUrl} target="_blank" rel="noopener noreferrer" className="mt-4 w-full bg-slate-100 text-slate-700 font-bold rounded-lg py-3 flex justify-center items-center gap-2 hover:bg-slate-200 active:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    Buka Full Screen
                                </a>
                            </div>
                        </details>
                    </div>
                )}
                
                <div className="h-4"></div>
            </main>
        </SecurityMobileLayout>
    );
}
