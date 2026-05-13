import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@/Components/ui/Button';

export default function ApprovalTrackingModal({ isOpen, onClose, requestId }) {
    const [loading, setLoading] = useState(true);
    const [trackingData, setTrackingData] = useState(null);

    useEffect(() => {
        if (isOpen && requestId) {
            setLoading(true);
            axios.get(`/vendor/requests/${requestId}/tracking`)
                .then(response => {
                    setTrackingData(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching tracking data:', error);
                    setLoading(false);
                });
        }
    }, [isOpen, requestId]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl flex flex-col relative z-10 max-h-[95vh]">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30 rounded-t-xl shrink-0">
                    <h3 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">route</span>
                        Tracking Approval
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-5 md:p-6 flex flex-col space-y-5 overflow-y-auto">
                    {loading ? (
                        <div className="py-12 flex justify-center items-center flex-col gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-[14px] text-slate-500 font-medium">Memuat data tracking...</p>
                        </div>
                    ) : trackingData ? (
                        <div className="space-y-6">
                            {/* Status Header */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <div className="text-[12px] font-bold text-slate-500 mb-1">Status Saat Ini</div>
                                    <div className="text-[15px] font-bold text-slate-900">
                                        {trackingData.request.status.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[12px] font-bold text-slate-500 mb-1">No. Dokumen</div>
                                    <div className="text-[14px] font-bold text-primary">{trackingData.request.document_serial_no}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Approval Logs Timeline */}
                                <div>
                                    <h4 className="text-[14px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-slate-400">history</span>
                                        Riwayat Approval
                                    </h4>
                                    {trackingData.approval_logs?.length > 0 ? (
                                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                                            {trackingData.approval_logs.map((log) => (
                                                <div key={log.id} className="relative flex items-start gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 
                                                        ${log.action === 'APPROVED' ? 'bg-green-100 text-green-600' : 
                                                          log.action === 'REJECTED' ? 'bg-red-100 text-red-600' : 
                                                          'bg-blue-100 text-blue-600'}`}>
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            {log.action === 'APPROVED' ? 'check' : log.action === 'REJECTED' ? 'close' : 'send'}
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[13px] font-bold text-slate-900">
                                                                {log.action === 'APPROVED' ? 'Disetujui' : log.action === 'REJECTED' ? 'Ditolak' : 'Diajukan'}
                                                            </span>
                                                            <time className="text-[11px] font-bold text-slate-500">{formatDate(log.created_at)}</time>
                                                        </div>
                                                        <div className="text-[12px] text-slate-600">Oleh: {log.approver?.email || 'Vendor'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[13px] text-slate-500 italic">Belum ada riwayat approval.</p>
                                    )}
                                </div>

                                {/* Contact Pending Approvers */}
                                <div>
                                    <h4 className="text-[14px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-yellow-500">pending_actions</span>
                                        Menunggu Approval
                                    </h4>
                                    
                                    {trackingData.pending_approvers?.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-[12px] text-slate-600 mb-2">
                                                Surat sedang menunggu approval dari role <strong>{trackingData.pending_approvers[0].role}</strong>. Silakan hubungi kontak berikut untuk mem-follow up:
                                            </p>
                                            {trackingData.pending_approvers.map((approver) => (
                                                <div key={approver.id} className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <div className="text-[13px] font-bold text-slate-900">{approver.email}</div>
                                                        <div className="text-[11px] font-bold text-yellow-700 uppercase">{approver.role.replace('_', ' ')}</div>
                                                    </div>
                                                    <a href={`mailto:${approver.email}`} className="w-8 h-8 rounded-full bg-white text-yellow-600 flex items-center justify-center shadow-sm border border-yellow-200 hover:bg-yellow-500 hover:text-white transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">mail</span>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                            <span className="material-symbols-outlined text-slate-400 text-[24px] mb-2">check_circle</span>
                                            <p className="text-[13px] font-medium text-slate-600">Tidak ada approver yang sedang menunggu.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-red-500 text-[14px]">
                            Gagal memuat data tracking.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
