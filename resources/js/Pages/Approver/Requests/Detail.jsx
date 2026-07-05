/**
 * Approver Request Detail
 *
 * Halaman detail request dengan tombol approve/reject untuk approver.
 * 
 * PERUBAHAN:
 * - Menggunakan SuratPreview component untuk tampilan surat yang lengkap
 * - Support print surat
 */

import { useState } from 'react';
import { Link, useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import ValidationErrors from '@/Components/shared/ValidationErrors';
import SuratPreview from '@/Components/shared/SuratPreview';

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
                                {/* Tombol Print */}
                                <div className="print:hidden">
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full sm:w-auto px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">print</span>
                                        Print Surat
                                    </button>
                                </div>

                                {/* Preview Surat - Component Baru */}
                                <SuratPreview 
                                    request={request} 
                                    type={request.request_type === 'IJIN_KERJA' ? 'sik' : 'sikmb'}
                                />

                                {/* Duplicate sections removed - Data sudah ditampilkan di SuratPreview component di atas */}

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

                                {/* Preview Evidence Security */}
                                {request.evidences && request.evidences.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-5 border-b border-slate-100">
                                            <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-400">verified_user</span>
                                                Bukti Pengecekan Security
                                            </h3>
                                        </div>
                                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {request.evidences.map((evidence, idx) => (
                                                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
                                                    <div className="bg-slate-50 p-3 text-xs font-bold text-slate-600 border-b border-slate-200 flex justify-between items-center">
                                                        <span>Oleh: {evidence.uploader?.email || 'Security'}</span>
                                                        <span className="text-[10px] text-slate-400 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                                                            {evidence.evidence_type}
                                                        </span>
                                                    </div>
                                                    <div className="p-2 flex-grow flex items-center justify-center bg-slate-100 min-h-[200px]">
                                                        {evidence.photo_url ? (
                                                            <DocumentViewer url={evidence.photo_url} title={`Evidence ${idx + 1}`} className="w-full h-full" />
                                                        ) : (
                                                            <p className="text-sm text-slate-500">Image URL missing</p>
                                                        )}
                                                    </div>
                                                    {evidence.notes && (
                                                        <div className="bg-slate-50 p-3 text-xs text-slate-600 italic border-t border-slate-200">
                                                            <span className="font-semibold text-slate-700 not-italic">Catatan:</span> {evidence.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
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
