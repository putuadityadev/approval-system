/**
 * Vendor Dashboard
 *
 * Halaman dashboard untuk Vendor dengan statistik dan recent submissions.
 *
 * Cara kerja:
 * 1. Menampilkan statistics cards (pending, approved, rejected, total)
 * 2. Menampilkan quick actions (Buat Surat Baru, Lihat Semua Surat)
 * 3. Menampilkan tabel 5 surat terakhir dengan status badge
 * 4. Jika belum ada surat, tampilkan empty state dengan CTA
 *
 * Props:
 * - auth: object — data user yang sedang login dengan relasi vendor { user: {..., vendor: {...}} }
 * - statistics: object — statistik request { pending, approved, rejected, total }
 * - recentRequests: array — 5 request terakhir dengan relasi sikmDetail/sikDetail
 */

import { Link } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import UploadScanModal from '@/Components/shared/UploadScanModal';

function VendorDashboard({ auth, statistics, recentRequests }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * getStatusBadge
     *
     * Mengembalikan badge component berdasarkan status request.
     *
     * @param {string} status — Status request
     * @return {JSX.Element} — Badge component dengan warna sesuai status
     */
    const getStatusBadge = (status) => {
        const statusConfig = {
            'SUBMITTED': { label: 'Diajukan', color: 'bg-blue-100 text-blue-800' },
            'PENDING_DEPT': { label: 'Pending Dept', color: 'bg-yellow-100 text-yellow-800' },
            'PENDING_OPS': { label: 'Pending Ops', color: 'bg-yellow-100 text-yellow-800' },
            'PENDING_FINANCE': { label: 'Pending Finance', color: 'bg-yellow-100 text-yellow-800' },
            'PENDING_GM': { label: 'Pending GM', color: 'bg-yellow-100 text-yellow-800' },
            'APPROVED': { label: 'Disetujui', color: 'bg-green-100 text-green-800' },
            'REJECTED': { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
            'CANCELLED': { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-800' },
        };
        const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${config.color}`}>
                {config.label}
            </span>
        );
    };

    /**
     * getRequestTypeLabel
     *
     * Mengembalikan label yang user-friendly untuk tipe request.
     *
     * @param {string} type — Tipe request (LOADING_IN, LOADING_OUT, IJIN_KERJA)
     * @return {string} — Label yang mudah dibaca
     */
    const getRequestTypeLabel = (type) => {
        const labels = {
            'LOADING_IN': 'SIKMB Masuk',
            'LOADING_OUT': 'SIKMB Keluar',
            'IJIN_KERJA': 'SIK',
        };
        return labels[type] || type;
    };

    /**
     * formatDate
     *
     * Format tanggal ke format Indonesia (DD MMM YYYY).
     *
     * @param {string} dateString — ISO date string
     * @return {string} — Formatted date
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
                            <h2 className="text-[30px] font-extrabold text-foreground tracking-tight">Dashboard Overview</h2>
                            <p className="text-[14px] font-medium text-muted-foreground mt-1">
                                Selamat datang, {auth.user.vendor?.company_name || auth.user.email}. Monitor metrik operasional dan pengajuan Anda.
                            </p>
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

                    {/* Bento Grid for Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Pending Card */}
                        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending</span>
                                <span className="material-symbols-outlined text-yellow-600" style={{fontVariationSettings: "'FILL' 1"}}>schedule</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[36px] font-black text-card-foreground tracking-tight">{statistics.pending}</span>
                                <span className="text-[12px] font-medium text-muted-foreground">Menunggu approval</span>
                            </div>
                        </div>

                        {/* Approved Card */}
                        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Disetujui</span>
                                <span className="material-symbols-outlined text-green-600" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[36px] font-black text-card-foreground tracking-tight">{statistics.approved}</span>
                                <span className="text-[12px] font-medium text-muted-foreground">Surat disetujui</span>
                            </div>
                        </div>

                        {/* Rejected Card */}
                        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ditolak</span>
                                <span className="material-symbols-outlined text-red-600" style={{fontVariationSettings: "'FILL' 1"}}>cancel</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[36px] font-black text-card-foreground tracking-tight">{statistics.rejected}</span>
                                <span className="text-[12px] font-medium text-muted-foreground">Perlu perbaikan</span>
                            </div>
                        </div>

                        {/* Total Card */}
                        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Surat</span>
                                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>assignment</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[36px] font-black text-card-foreground tracking-tight">{statistics.total}</span>
                                <span className="text-[12px] font-medium text-muted-foreground">Semua pengajuan</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-card rounded-lg shadow-sm border border-border/50 overflow-hidden">
                        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-background">
                            <h3 className="text-[20px] font-bold text-card-foreground">Pengajuan Terbaru</h3>
                            {recentRequests.length > 0 && (
                                <Link href={route('vendor.requests.index')} className="text-[12px] font-medium text-primary hover:underline focus:outline-none">
                                    View All
                                </Link>
                            )}
                        </div>
                        
                        <div className="overflow-x-auto">
                            {recentRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">inbox</span>
                                    <h3 className="text-sm font-medium text-foreground">Belum ada pengajuan</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Mulai dengan membuat surat pengajuan pertama Anda.</p>
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
                                        <tr className="bg-background border-b border-border">
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No. Dokumen</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipe</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tanggal</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[14px] font-medium">
                                        {recentRequests.map((request) => (
                                            <tr key={request.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors group">
                                                <td className="px-6 py-4 text-muted-foreground font-bold text-[12px]">{request.document_serial_no}</td>
                                                <td className="px-6 py-4 text-foreground">{getRequestTypeLabel(request.request_type)}</td>
                                                <td className="px-6 py-4 text-muted-foreground text-[12px]">{formatDate(request.created_at)}</td>
                                                <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={route('vendor.requests.show', request.id)} className="text-muted-foreground hover:text-primary transition-colors focus:outline-none">
                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Upload & Scan Modal */}
                    <UploadScanModal 
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default VendorDashboard;
