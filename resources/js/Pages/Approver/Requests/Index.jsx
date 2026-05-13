/**
 * Approver Requests Index
 *
 * Halaman list pending requests untuk approver.
 */

import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ApproverRequestsIndex({ auth, requests, roleLabel }) {
    /**
     * getStatusBadge
     */
    const getStatusBadge = (status) => {
        const classes = {
            'SUBMITTED': 'bg-blue-100 text-blue-800',
            'PENDING_DEPT': 'bg-yellow-100 text-yellow-800',
            'PENDING_OPS': 'bg-yellow-100 text-yellow-800',
            'PENDING_FINANCE': 'bg-yellow-100 text-yellow-800',
            'PENDING_GM': 'bg-yellow-100 text-yellow-800',
        };

        const labels = {
            'SUBMITTED': 'Diajukan',
            'PENDING_DEPT': 'Pending Dept',
            'PENDING_OPS': 'Pending Ops',
            'PENDING_FINANCE': 'Pending Finance',
            'PENDING_GM': 'Pending GM',
        };

        const colorClass = classes[status] || 'bg-gray-100 text-gray-800';
        const label = labels[status] || status;

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${colorClass}`}>
                {label}
            </span>
        );
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
                            <h2 className="text-[30px] font-extrabold text-foreground tracking-tight">Pending Requests</h2>
                            <p className="text-[14px] font-medium text-muted-foreground mt-1">
                                Surat yang menunggu approval dari Anda ({roleLabel}).
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
                                href={route('approver.history')}
                                className="px-4 py-2 bg-white border border-border text-primary text-[14px] font-bold rounded hover:bg-muted/50 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">history</span>
                                History Approval
                            </Link>
                        </div>
                    </div>

                    {/* Center Content Module */}
                    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col min-h-[400px]">
                        {/* Title Bar */}
                        <div className="p-6 border-b border-border bg-card">
                            <h3 className="text-[18px] font-bold text-card-foreground">Daftar Pending Request</h3>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto flex-1 bg-card">
                            {requests.data.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">done_all</span>
                                    <h3 className="mt-2 text-[16px] font-bold text-foreground">
                                        Tidak ada surat pending
                                    </h3>
                                    <p className="mt-1 text-[14px] font-medium text-muted-foreground">
                                        Semua surat sudah di-approve atau belum ada surat baru yang masuk.
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No. Dokumen</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vendor</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipe Surat</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tanggal</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {requests.data.map((request) => (
                                            <tr key={request.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-[14px] font-bold text-foreground">
                                                        {request.document_serial_no}
                                                    </div>
                                                    {request.sop_form_code && (
                                                        <div className="text-[12px] font-medium text-muted-foreground">
                                                            {request.sop_form_code}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-[14px] font-medium text-foreground">
                                                    {request.vendor?.company_name || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-[14px] font-medium text-muted-foreground">
                                                    {getRequestTypeLabel(request.request_type)}
                                                </td>
                                                <td className="px-6 py-4 text-[14px] font-medium text-muted-foreground">
                                                    {formatDate(request.created_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(request.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={route('approver.requests.show', request.id)}
                                                        className="text-[14px] font-bold text-primary hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                                                    >
                                                        Review <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer Pagination */}
                        {requests.last_page > 1 && (
                            <div className="p-6 border-t border-border bg-card flex justify-between items-center gap-4 mt-auto">
                                <div className="text-[12px] font-medium text-muted-foreground hidden sm:block">
                                    Menampilkan <span className="font-bold text-foreground">{requests.from}</span> sampai <span className="font-bold text-foreground">{requests.to}</span> dari <span className="font-bold text-foreground">{requests.total}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                    {requests.prev_page_url ? (
                                        <Link
                                            href={requests.prev_page_url}
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
                                        {requests.links.map((link, index) => {
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

                                    {requests.next_page_url ? (
                                        <Link
                                            href={requests.next_page_url}
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

