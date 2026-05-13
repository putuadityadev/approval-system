/**
 * Approver Approval History
 *
 * Halaman history approval yang sudah dilakukan oleh approver.
 */

import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ApproverHistory({ auth, approvals, roleLabel }) {
    /**
     * getActionBadge
     */
    const getActionBadge = (action) => {
        if (action === 'APPROVED') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm bg-green-100 text-green-800">
                    Disetujui
                </span>
            );
        } else if (action === 'REJECTED') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm bg-red-100 text-red-800">
                    Ditolak
                </span>
            );
        }
        return null;
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
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('id-ID', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-[30px] font-extrabold text-foreground tracking-tight">History Approval</h2>
                            <p className="text-[14px] font-medium text-muted-foreground mt-1">
                                Riwayat approval yang sudah Anda lakukan ({roleLabel}).
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={route('approver.dashboard')}
                                className="px-4 py-2 bg-white border border-border text-foreground text-[14px] font-bold rounded hover:bg-muted/50 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Dashboard
                            </Link>
                            <Link
                                href={route('approver.requests.index')}
                                className="px-4 py-2 bg-white border border-border text-primary text-[14px] font-bold rounded hover:bg-muted/50 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                                Pending Requests
                            </Link>
                        </div>
                    </div>

                    {/* History Table Module */}
                    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col min-h-[400px]">
                        <div className="p-6 border-b border-border bg-card">
                            <h3 className="text-[18px] font-bold text-card-foreground">Riwayat Dokumen</h3>
                        </div>

                        <div className="overflow-x-auto flex-1 bg-card">
                            {approvals.data.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">history</span>
                                    <h3 className="mt-2 text-[16px] font-bold text-foreground">
                                        Belum ada history
                                    </h3>
                                    <p className="mt-1 text-[14px] font-medium text-muted-foreground">
                                        Anda belum melakukan approval apapun.
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No. Dokumen</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vendor</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipe</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tanggal Aksi</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status Aksi</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Catatan</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {approvals.data.map((approval) => (
                                            <tr key={approval.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-[14px] font-bold text-foreground">
                                                        {approval.request?.document_serial_no || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-[14px] font-medium text-foreground">
                                                    {approval.request?.vendor?.company_name || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-[14px] font-medium text-muted-foreground">
                                                    {getRequestTypeLabel(approval.request?.request_type)}
                                                </td>
                                                <td className="px-6 py-4 text-[14px] font-medium text-muted-foreground">
                                                    {formatDate(approval.action_date)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getActionBadge(approval.action)}
                                                </td>
                                                <td className="px-6 py-4 text-[13px] text-muted-foreground max-w-[200px] truncate italic">
                                                    {approval.notes ? `"${approval.notes}"` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {approval.request && (
                                                        <Link
                                                            href={route('approver.requests.show', approval.request.id)}
                                                            className="text-[14px] font-bold text-primary hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                                                        >
                                                            Lihat <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer Pagination */}
                        {approvals.last_page > 1 && (
                            <div className="p-6 border-t border-border bg-card flex justify-between items-center gap-4 mt-auto">
                                <div className="text-[12px] font-medium text-muted-foreground hidden sm:block">
                                    Menampilkan <span className="font-bold text-foreground">{approvals.from}</span> sampai <span className="font-bold text-foreground">{approvals.to}</span> dari <span className="font-bold text-foreground">{approvals.total}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                    {approvals.prev_page_url ? (
                                        <Link
                                            href={approvals.prev_page_url}
                                            className="text-[14px] font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1"
                                        >
                                            Previous
                                        </Link>
                                    ) : (
                                        <button className="text-[14px] font-bold text-muted-foreground opacity-50 cursor-not-allowed px-3 py-1" disabled>
                                            Previous
                                        </button>
                                    )}
                                    
                                    <div className="hidden sm:flex items-center gap-1">
                                        {approvals.links.map((link, index) => {
                                            if (link.label.includes('Previous') || link.label.includes('Next')) return null;
                                            
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`w-8 h-8 flex items-center justify-center rounded text-[12px] font-medium transition-colors ${
                                                        link.active
                                                            ? 'bg-primary text-primary-foreground font-bold'
                                                            : 'text-muted-foreground hover:bg-muted'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>

                                    {approvals.next_page_url ? (
                                        <Link
                                            href={approvals.next_page_url}
                                            className="text-[14px] font-bold text-primary hover:text-blue-800 transition-colors px-3 py-1"
                                        >
                                            Next
                                        </Link>
                                    ) : (
                                        <button className="text-[14px] font-bold text-primary opacity-50 cursor-not-allowed px-3 py-1" disabled>
                                            Next
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
