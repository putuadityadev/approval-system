import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UploadScanModal from '@/Components/shared/UploadScanModal';
import Button from '@/Components/ui/Button';

/**
 * Index (List Requests)
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan daftar surat yang sudah disubmit oleh vendor
 * - Pagination untuk navigasi antar halaman
 * - Badge status untuk setiap surat
 * - Link ke detail page
 * - Modal untuk upload & scan surat baru
 *
 * Cara kerjanya:
 * 1. Menerima data requests (paginated) dari backend
 * 2. Menampilkan table dengan kolom: No Dokumen, Tipe, Status, Tanggal, Aksi
 * 3. User bisa klik "Buat Request Baru" untuk buka modal
 * 4. Modal: pilih jenis surat → upload file → scan OCR → redirect ke form
 * 5. User bisa klik row untuk lihat detail
 * 6. Pagination di bawah table
 *
 * Props:
 * - requests: objek paginated { data: [], current_page, last_page, per_page, total, links }
 * - vendor: objek vendor { id, company_name, pic_name, pic_phone, address }
 */
export default function Index({ requests, vendor }) {
    const { auth } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * getStatusBadgeClass
     *
     * Apa yang dilakukan:
     * Return class Tailwind untuk badge status berdasarkan status surat
     *
     * Langkah-langkah:
     * 1. Check status surat
     * 2. Return class yang sesuai (warna berbeda untuk setiap status)
     */
    const getStatusBadgeClass = (status) => {
        const classes = {
            DRAFT: 'bg-gray-100 text-gray-800',
            SUBMITTED: 'bg-blue-100 text-blue-800',
            PENDING_DEPT: 'bg-yellow-100 text-yellow-800',
            PENDING_OPS: 'bg-yellow-100 text-yellow-800',
            PENDING_FINANCE: 'bg-yellow-100 text-yellow-800',
            PENDING_GM: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
            EXECUTED: 'bg-purple-100 text-purple-800',
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    /**
     * getStatusLabel
     *
     * Apa yang dilakukan:
     * Return label Bahasa Indonesia untuk status surat
     */
    const getStatusLabel = (status) => {
        const labels = {
            DRAFT: 'Draft',
            SUBMITTED: 'Diajukan',
            PENDING_DEPT: 'Menunggu Dept',
            PENDING_OPS: 'Menunggu Ops',
            PENDING_FINANCE: 'Menunggu Finance',
            PENDING_GM: 'Menunggu GM',
            APPROVED: 'Disetujui',
            REJECTED: 'Ditolak',
            CANCELLED: 'Dibatalkan',
            EXECUTED: 'Selesai',
        };
        return labels[status] || status;
    };

    /**
     * getTypeLabel
     *
     * Apa yang dilakukan:
     * Return label Bahasa Indonesia untuk tipe surat
     */
    const getTypeLabel = (type) => {
        const labels = {
            LOADING_IN: 'Barang Masuk',
            LOADING_OUT: 'Barang Keluar',
            IJIN_KERJA: 'Izin Kerja',
        };
        return labels[type] || type;
    };

    /**
     * formatDate
     *
     * Apa yang dilakukan:
     * Format tanggal ke format Indonesia (DD MMM YYYY)
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
            <Head title="My Requests" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-[30px] font-extrabold text-foreground tracking-tight">My Requests</h2>
                            <p className="text-[14px] font-medium text-muted-foreground mt-1">Lacak dan kelola semua pengajuan surat Anda.</p>
                        </div>
                        <Button 
                            variant="primary" 
                            className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2 justify-center"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Buat Surat Baru
                        </Button>
                    </div>

                    {/* Upload & Scan Modal */}
                    <UploadScanModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />

                    {/* Center Content Module */}
                    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col min-h-[400px]">
                        {/* Title Bar */}
                        <div className="p-6 border-b border-border bg-card">
                            <h3 className="text-[18px] font-bold text-card-foreground">Daftar Pengajuan</h3>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto flex-1 bg-card">
                            {requests.data.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">folder_open</span>
                                    <h3 className="mt-2 text-[16px] font-bold text-foreground">
                                        Belum ada surat
                                    </h3>
                                    <p className="mt-1 text-[14px] font-medium text-muted-foreground">
                                        Mulai dengan membuat surat pengajuan pertama Anda.
                                    </p>
                                    <div className="mt-6">
                                        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 mx-auto">
                                            <span className="material-symbols-outlined text-[20px]">add</span>
                                            Buat Surat Baru
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No. Dokumen</th>
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
                                                <td className="px-6 py-4 text-[14px] font-medium text-muted-foreground">
                                                    {getTypeLabel(request.request_type)}
                                                </td>
                                                <td className="px-6 py-4 text-[14px] font-medium text-muted-foreground">
                                                    {formatDate(request.created_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusBadgeClass(request.status)}`}>
                                                        {getStatusLabel(request.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/vendor/requests/${request.id}`}
                                                        className="text-[14px] font-bold text-primary hover:text-blue-800 transition-colors"
                                                    >
                                                        Lihat Detail
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
                                            // Skip 'Previous' and 'Next' standard links since we have custom buttons for them
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
