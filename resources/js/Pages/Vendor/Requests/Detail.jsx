import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DocumentViewer from '@/Components/shared/DocumentViewer';

export default function Detail({ request, vendor, qrCodeUrl, formImageUrl }) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
    });

    const getStatusBadgeClass = (status) => {
        const classes = {
            DRAFT: 'bg-slate-100 text-slate-800',
            SUBMITTED: 'bg-blue-100 text-blue-800',
            PENDING_DEPT: 'bg-yellow-100 text-yellow-800',
            PENDING_OPS: 'bg-yellow-100 text-yellow-800',
            PENDING_FINANCE: 'bg-yellow-100 text-yellow-800',
            PENDING_GM: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-slate-100 text-slate-800',
            EXECUTED: 'bg-purple-100 text-purple-800',
        };
        return classes[status] || 'bg-slate-100 text-slate-800';
    };

    const getTypeLabel = (type) => {
        const labels = {
            LOADING_IN: 'Barang Masuk',
            LOADING_OUT: 'Barang Keluar',
            IJIN_KERJA: 'Izin Kerja',
        };
        return labels[type] || type;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const canCancel = () => {
        return ['SUBMITTED', 'PENDING_DEPT', 'PENDING_OPS', 'PENDING_FINANCE', 'PENDING_GM'].includes(request.status);
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        post(`/vendor/requests/${request.id}/cancel`, {
            onSuccess: () => {
                setShowCancelModal(false);
                reset();
            },
        });
    };

    // Stepper logic
    const flowSteps = [
        { key: 'SUBMITTED', label: 'Submitted', role: 'vendor', past: ['PENDING_DEPT', 'PENDING_OPS', 'PENDING_FINANCE', 'PENDING_GM', 'APPROVED', 'EXECUTED'] },
        { key: 'PENDING_DEPT', label: 'Dept. Review', role: 'approver_dept', past: ['PENDING_OPS', 'PENDING_FINANCE', 'PENDING_GM', 'APPROVED', 'EXECUTED'] },
        { key: 'PENDING_OPS', label: 'Operational', role: 'approver_ops', past: ['PENDING_FINANCE', 'PENDING_GM', 'APPROVED', 'EXECUTED'] },
        { key: 'PENDING_FINANCE', label: 'Finance', role: 'approver_finance', past: ['PENDING_GM', 'APPROVED', 'EXECUTED'] },
        { key: 'PENDING_GM', label: 'GM Approval', role: 'approver_gm', past: ['APPROVED', 'EXECUTED'] },
    ];

    const getStepState = (step) => {
        if (request.status === 'SUBMITTED') {
            if (step.key === 'SUBMITTED') return 'completed';
            if (step.key === 'PENDING_DEPT') return 'active';
            return 'pending';
        }
        if (request.status === 'REJECTED') {
            const log = request.approval_logs?.find(l => l.approver?.role === step.role);
            if (log && log.action === 'REJECTED') return 'rejected';
            const approvedLog = request.approval_logs?.find(l => l.approver?.role === step.role);
            if (approvedLog && approvedLog.action === 'APPROVED') return 'completed';
            if (step.key === 'SUBMITTED') return 'completed';
            return 'pending';
        }
        if (request.status === 'CANCELLED') {
            if (step.key === 'SUBMITTED') return 'rejected';
            return 'pending';
        }
        if (request.status === 'APPROVED' || request.status === 'EXECUTED') {
            return 'completed';
        }
        if (request.status === step.key) {
            return 'active';
        }
        if (step.past.includes(request.status)) {
            return 'completed';
        }
        return 'pending';
    };

    return (
        <>
            <Head title={`Detail Surat ${request.document_serial_no}`} />

            <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="max-w-6xl mx-auto space-y-6 py-6">
                    {/* Header */}
                    <div>
                        <Link
                            href="/vendor/requests"
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:border-primary/50 transition-all mb-6 group"
                        >
                            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Kembali ke Daftar Surat
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-[24px] sm:text-[30px] font-extrabold text-slate-900 tracking-tight">
                                    {request.document_serial_no}
                                </h2>
                                <span className={`px-3 py-1 text-[12px] font-bold uppercase tracking-wider rounded shadow-sm ${getStatusBadgeClass(request.status)}`}>
                                    {request.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                {canCancel() && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                                        Batalkan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                        <div className="flex justify-between items-center relative z-10 max-w-4xl mx-auto">
                            {flowSteps.map((step, idx) => {
                                const state = getStepState(step, idx);
                                const isLast = idx === flowSteps.length - 1;
                                
                                return (
                                    <div key={step.key} className="flex flex-col items-center gap-2 w-full relative group">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300
                                            ${state === 'completed' ? 'bg-primary text-white shadow-sm shadow-primary/20' : ''}
                                            ${state === 'active' ? 'border-4 border-primary bg-white text-primary shadow-sm animate-pulse' : ''}
                                            ${state === 'pending' ? 'bg-slate-100 text-slate-400 border border-slate-200' : ''}
                                            ${state === 'rejected' ? 'bg-red-100 text-red-500 border border-red-200' : ''}
                                        `}>
                                            {state === 'completed' ? (
                                                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                                            ) : state === 'active' ? (
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                                            ) : state === 'rejected' ? (
                                                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>close</span>
                                            ) : (
                                                <span className="text-[12px] font-bold">{idx + 1}</span>
                                            )}
                                        </div>
                                        <span className={`text-[11px] sm:text-[12px] font-bold text-center ${state === 'active' ? 'text-primary' : state === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {step.label}
                                        </span>
                                        
                                        {/* Connector */}
                                        {!isLast && (
                                            <div className={`absolute top-4 left-[50%] w-full h-[2px] z-0 transition-colors duration-300 ml-4
                                                ${state === 'completed' ? 'bg-primary' : 'bg-slate-100'}
                                            `}></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Left Column (2/3) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Document Details Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                <h3 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">info</span>
                                    Detail Informasi
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tipe Surat</p>
                                            <p className="text-[14px] font-medium text-slate-900">{getTypeLabel(request.request_type)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tanggal Dibuat</p>
                                            <p className="text-[14px] font-medium text-slate-900">{formatDate(request.created_at)}</p>
                                        </div>
                                        {request.sop_form_code && (
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Kode SOP</p>
                                                <p className="text-[14px] font-medium text-slate-900">{request.sop_form_code}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nama PIC</p>
                                            <p className="text-[14px] font-medium text-slate-900">{request.vendor?.pic_name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email Pengaju</p>
                                            <p className="text-[14px] font-medium text-slate-900">{request.vendor?.user?.email || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">No. Handphone PIC</p>
                                            <p className="text-[14px] font-medium text-slate-900">{request.vendor?.pic_phone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Perusahaan</p>
                                            <p className="text-[14px] font-medium text-slate-900">{request.vendor?.company_name}</p>
                                        </div>
                                        {request.sikmb_detail && (
                                            <>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Periode</p>
                                                    <p className="text-[14px] font-medium text-slate-900">{request.sikmb_detail.start_date} - {request.sikmb_detail.end_date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tujuan</p>
                                                    <p className="text-[14px] font-medium text-slate-900">{request.sikmb_detail.dest_address}</p>
                                                </div>
                                            </>
                                        )}
                                        {request.sik_detail && (
                                            <>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Periode</p>
                                                    <p className="text-[14px] font-medium text-slate-900">{request.sik_detail.start_date} - {request.sik_detail.end_date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Lokasi</p>
                                                    <p className="text-[14px] font-medium text-slate-900">{request.sik_detail.location}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Items / Workers Section */}
                            {(request.sikmb_detail?.items?.length > 0 || request.sik_detail) && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <h3 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400">
                                                {request.sik_detail ? 'engineering' : 'inventory_2'}
                                            </span>
                                            {request.sik_detail ? 'Detail Pekerjaan' : 'Daftar Barang'}
                                        </h3>
                                    </div>
                                    
                                    {request.sikmb_detail && (
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">Nama Barang</th>
                                                    <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 w-24">Qty</th>
                                                    <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 w-32">Unit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {request.sikmb_detail.items.map((item, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-4 px-6 text-[14px] font-medium text-slate-900">{item.item_name}</td>
                                                        <td className="py-4 px-6 text-[14px] font-medium text-slate-600">{item.quantity}</td>
                                                        <td className="py-4 px-6 text-[14px] font-medium text-slate-600">{item.unit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {request.sik_detail && (
                                        <div className="p-6 grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Jumlah Pekerja</p>
                                                <p className="text-[14px] font-medium text-slate-900">{request.sik_detail.worker_count} Orang</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Jenis Pekerjaan</p>
                                                <p className="text-[14px] font-medium text-slate-900">{request.sik_detail.job_type}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Deskripsi</p>
                                                <p className="text-[14px] font-medium text-slate-900">{request.sik_detail.description || '-'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Preview Bukti Upload */}
                            {formImageUrl && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-5 border-b border-slate-100">
                                        <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400">image</span>
                                            Preview Dokumen Asli
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <DocumentViewer url={formImageUrl} title="Dokumen Asli" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column (1/3) */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* QR Code Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center">
                                {request.status === 'APPROVED' || request.status === 'EXECUTED' ? (
                                    <>
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-[24px]">verified</span>
                                        </div>
                                        <h3 className="text-[18px] font-extrabold text-slate-900 mb-2 uppercase tracking-tight">ACCESS GRANTED</h3>
                                        <p className="text-[12px] font-medium text-slate-500 mb-6">Tunjukkan QR code ini ke petugas security</p>
                                        
                                        {qrCodeUrl && (
                                            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 w-full max-w-[200px] aspect-square flex items-center justify-center">
                                                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        
                                        <a
                                            href={qrCodeUrl}
                                            download={`QR_${request.document_serial_no}.svg`}
                                            className="w-full py-2.5 bg-primary text-white text-[13px] font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                                        >
                                            Download QR
                                        </a>
                                    </>
                                ) : request.status === 'REJECTED' || request.status === 'CANCELLED' ? (
                                    <>
                                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-[24px]">cancel</span>
                                        </div>
                                        <h3 className="text-[18px] font-extrabold text-slate-900 mb-2 uppercase tracking-tight">ACCESS DENIED</h3>
                                        <p className="text-[12px] font-medium text-slate-500 mb-2">Permintaan {request.status === 'REJECTED' ? 'ditolak' : 'dibatalkan'}.</p>
                                        {request.cancelled_reason && (
                                            <p className="text-[12px] font-medium text-red-600 bg-red-50 p-2 rounded w-full">Alasan: {request.cancelled_reason}</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-[24px]">lock</span>
                                        </div>
                                        <h3 className="text-[18px] font-extrabold text-slate-900 mb-2 uppercase tracking-tight">ACCESS PENDING</h3>
                                        <p className="text-[12px] font-medium text-slate-500 mb-6 leading-relaxed">
                                            QR Code will be generated once the request is fully approved
                                        </p>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 w-full aspect-square flex flex-col items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-slate-300 text-[48px]">qr_code_2</span>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Awaiting Approval</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed z-[100] inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCancelModal(false)} />
                        
                        <div className="relative inline-block bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full">
                            <form onSubmit={handleCancelSubmit}>
                                <div className="bg-white px-6 pt-6 pb-6">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-50 sm:mx-0 sm:h-10 sm:w-10">
                                            <span className="material-symbols-outlined text-red-600">warning</span>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-[18px] font-bold text-slate-900">Batalkan Surat</h3>
                                            <div className="mt-3">
                                                <p className="text-sm text-slate-500 mb-4">
                                                    Apakah Anda yakin ingin membatalkan surat ini? Tindakan ini tidak dapat diurungkan.
                                                </p>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                    Alasan Pembatalan <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={data.reason}
                                                    onChange={(e) => setData('reason', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                                    placeholder="Ketik alasan pembatalan..."
                                                    required
                                                />
                                                {errors.reason && <p className="mt-1 text-xs font-medium text-red-600">{errors.reason}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => { setShowCancelModal(false); reset(); }}
                                        className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 bg-red-600 text-white text-[13px] font-bold rounded hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {processing && <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>}
                                        Ya, Batalkan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
