/**
 * Approver Request Detail
 *
 * Halaman detail request dengan tombol approve/reject untuk approver.
 */

import { useState } from 'react';
import { Link, useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import ValidationErrors from '@/Components/shared/ValidationErrors';
import DocumentViewer from '@/Components/shared/DocumentViewer';

export default function ApproverRequestDetail({ auth, request, roleLabel, canApprove, formImageUrl }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Form untuk approve
    const approveForm = useForm({
        notes: '',
    });

    // Form untuk reject
    const rejectForm = useForm({
        reason: '',
    });

    /**
     * handleApprove
     */
    const handleApprove = (e) => {
        e.preventDefault();
        approveForm.post(route('approver.requests.approve', request.id), {
            onSuccess: () => {
                setShowApproveModal(false);
                approveForm.reset();
            },
        });
    };

    /**
     * handleReject
     */
    const handleReject = (e) => {
        e.preventDefault();
        rejectForm.post(route('approver.requests.reject', request.id), {
            onSuccess: () => {
                setShowRejectModal(false);
                rejectForm.reset();
            },
        });
    };

    /**
     * getStatusBadgeClass
     */
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

    /**
     * getRequestTypeLabel
     */
    const getRequestTypeLabel = (type) => {
        const labels = {
            'LOADING_IN': 'Barang Masuk',
            'LOADING_OUT': 'Barang Keluar',
            'IJIN_KERJA': 'Izin Kerja',
        };
        return labels[type] || type;
    };

    /**
     * formatDate
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    /**
     * getActionIcon
     */
    const getActionIcon = (action) => {
        if (action === 'APPROVED') {
            return (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border border-green-200 z-10">
                    <span className="material-symbols-outlined text-[16px] text-green-600">check</span>
                </div>
            );
        } else if (action === 'REJECTED') {
            return (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border border-red-200 z-10">
                    <span className="material-symbols-outlined text-[16px] text-red-600">close</span>
                </div>
            );
        } else {
            return (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 z-10">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">arrow_forward</span>
                </div>
            );
        }
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

    const getStepLog = (step) => {
        if (step.key === 'SUBMITTED') {
            return {
                action: 'SUBMITTED',
                action_date: request.created_at,
                approver: { email: request.vendor?.company_name || 'Vendor' },
                notes: ''
            };
        }
        return request.approval_logs?.find(l => l.approver?.role === step.role);
    };

    return (
        <>
            <Head title={`Review Surat ${request.document_serial_no}`} />
            <AuthenticatedLayout auth={auth}>
                <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
                    <div className="max-w-6xl mx-auto space-y-6 py-6">
                        {/* Header */}
                        <div>
                            <Link
                                href={route('approver.requests.index')}
                                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:border-primary/50 transition-all mb-6 group"
                            >
                                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                Kembali ke Pending Requests
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
                                    {canApprove && (
                                        <>
                                            <button
                                                onClick={() => setShowRejectModal(true)}
                                                className="px-4 py-2 bg-white border border-red-200 text-red-600 text-[13px] font-bold rounded hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                Tolak
                                            </button>
                                            <button
                                                onClick={() => setShowApproveModal(true)}
                                                className="px-4 py-2 bg-primary text-white text-[13px] font-bold rounded hover:opacity-90 transition-colors shadow-sm flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                Setujui
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Horizontal Stepper Removed */}

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
                                                <p className="text-[14px] font-medium text-slate-900">{getRequestTypeLabel(request.request_type)}</p>
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
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Perusahaan Vendor</p>
                                                <p className="text-[14px] font-medium text-slate-900">{request.vendor?.company_name || '-'}</p>
                                            </div>
                                            {request.sikmb_detail && (
                                                <>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Periode</p>
                                                        <p className="text-[14px] font-medium text-slate-900">{request.sikmb_detail.start_date} - {request.sikmb_detail.end_date}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tujuan / Asal</p>
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
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Lokasi Kerja</p>
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
                                                        <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">No</th>
                                                        <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">Nama Barang</th>
                                                        <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 w-24">Qty</th>
                                                        <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 w-32">Unit</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {request.sikmb_detail.items.map((item, i) => (
                                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                            <td className="py-4 px-6 text-[14px] font-medium text-slate-900">{i + 1}</td>
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
                                {/* Approval Timeline Card */}
                                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                                    <h3 className="text-[16px] font-bold text-card-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                                        <span className="material-symbols-outlined text-muted-foreground text-[20px]">history</span>
                                        Log Approval
                                    </h3>
                                    
                                    <div className="relative pl-2 sm:pl-0">
                                        {flowSteps.map((step, idx) => {
                                            const state = getStepState(step);
                                            const isLast = idx === flowSteps.length - 1;
                                            const log = getStepLog(step);
                                            
                                            return (
                                                <div key={step.key} className="relative flex items-start gap-4 mb-8 last:mb-0 group">
                                                    {/* Connector line */}
                                                    {!isLast && (
                                                        <div className={`absolute top-8 left-4 sm:left-5 w-[2px] h-[calc(100%-1rem)] -ml-px z-0
                                                            ${state === 'completed' ? 'bg-primary' : 'bg-slate-100'}
                                                        `}></div>
                                                    )}

                                                    {/* Step Icon */}
                                                    <div className="relative z-10 flex-shrink-0">
                                                        <div className={`
                                                            w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300
                                                            ${state === 'completed' ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : ''}
                                                            ${state === 'active' ? 'border-4 border-primary bg-background text-primary shadow-sm animate-pulse' : ''}
                                                            ${state === 'pending' ? 'bg-muted text-muted-foreground border border-border' : ''}
                                                            ${state === 'rejected' ? 'bg-red-100 text-red-500 border border-red-200' : ''}
                                                        `}>
                                                            {state === 'completed' ? (
                                                                <span className="material-symbols-outlined text-[16px] sm:text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                                                            ) : state === 'active' ? (
                                                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary"></div>
                                                            ) : state === 'rejected' ? (
                                                                <span className="material-symbols-outlined text-[16px] sm:text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>close</span>
                                                            ) : (
                                                                <span className="text-[12px] sm:text-[14px] font-bold">{idx + 1}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Step Content */}
                                                    <div className="flex-1 pt-1 sm:pt-2 pb-2">
                                                        <h4 className={`text-[14px] sm:text-[15px] font-bold ${state === 'active' ? 'text-primary' : state === 'completed' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {step.label}
                                                        </h4>
                                                        
                                                        {/* Log Details if exists */}
                                                        {log ? (
                                                            <div className="mt-2 bg-muted/30 p-3 sm:p-4 rounded-lg border border-border">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-bold text-foreground text-[12px] sm:text-[13px]">
                                                                        {log.action === 'APPROVED' ? 'Disetujui' : log.action === 'REJECTED' ? 'Ditolak' : 'Diajukan'}
                                                                    </span>
                                                                    <time className="text-[11px] font-medium text-muted-foreground">{formatDate(log.action_date)}</time>
                                                                </div>
                                                                <div className="text-muted-foreground text-[11px] sm:text-[12px] font-medium">
                                                                    Oleh: {log.approver?.email || 'Vendor'}
                                                                </div>
                                                                {log.notes && (
                                                                    <div className="mt-2 text-foreground text-[12px] italic bg-background p-2.5 rounded border border-border">
                                                                        "{log.notes}"
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : state === 'active' ? (
                                                            <p className="mt-1 text-[12px] font-medium text-muted-foreground animate-pulse">Menunggu review...</p>
                                                        ) : state === 'pending' ? (
                                                            <p className="mt-1 text-[12px] font-medium text-muted-foreground/50">Belum diproses</p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approve Modal */}
                {showApproveModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                            <form onSubmit={handleApprove}>
                                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                                    </div>
                                    <h3 className="text-[18px] font-bold text-slate-900">Setujui Dokumen</h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-slate-500 mb-4">
                                        Anda akan menyetujui dokumen ini. Anda dapat memberikan catatan operasional jika diperlukan.
                                    </p>
                                    <div className="mb-4">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                                            Catatan (Opsional)
                                        </label>
                                        <textarea
                                            value={approveForm.data.notes}
                                            onChange={(e) => approveForm.setData('notes', e.target.value)}
                                            rows={3}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                            placeholder="Tambahkan catatan jika diperlukan..."
                                        />
                                        <ValidationErrors errors={approveForm.errors} />
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 flex gap-3 justify-end border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowApproveModal(false)}
                                        className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                        disabled={approveForm.processing}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary text-white text-[13px] font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                        disabled={approveForm.processing}
                                    >
                                        {approveForm.processing ? 'Memproses...' : 'Ya, Setujui'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                            <form onSubmit={handleReject}>
                                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-red-600 text-[20px]">cancel</span>
                                    </div>
                                    <h3 className="text-[18px] font-bold text-slate-900">Tolak Dokumen</h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-slate-500 mb-4">
                                        Dokumen ini akan ditolak dan dikembalikan ke vendor. Harap berikan alasan penolakan.
                                    </p>
                                    <div className="mb-4">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                                            Alasan Penolakan <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={rejectForm.data.reason}
                                            onChange={(e) => rejectForm.setData('reason', e.target.value)}
                                            rows={3}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                                            placeholder="Jelaskan alasan penolakan..."
                                            required
                                        />
                                        <ValidationErrors errors={rejectForm.errors} />
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 flex gap-3 justify-end border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectModal(false)}
                                        className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                        disabled={rejectForm.processing}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-red-600 text-white text-[13px] font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                        disabled={rejectForm.processing}
                                    >
                                        {rejectForm.processing ? 'Memproses...' : 'Tolak Dokumen'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>
        </>
    );
}
