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
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
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
     * Format tanggal ke format Indonesia (DD/MM/YYYY HH:mm).
     *
     * @param {string} dateString — ISO date string
     * @return {string} — Formatted date
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Dashboard Vendor
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Selamat datang, <span className="font-semibold">{auth.user.vendor?.company_name || auth.user.email}</span>
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Pending Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-3xl font-bold text-yellow-600 mt-2">
                                            {statistics.pending}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Menunggu approval</p>
                            </div>
                        </div>

                        {/* Approved Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Disetujui</p>
                                        <p className="text-3xl font-bold text-green-600 mt-2">
                                            {statistics.approved}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Surat sudah disetujui</p>
                            </div>
                        </div>

                        {/* Rejected Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ditolak</p>
                                        <p className="text-3xl font-bold text-red-600 mt-2">
                                            {statistics.rejected}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Surat ditolak</p>
                            </div>
                        </div>

                        {/* Total Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Surat</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">
                                            {statistics.total}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Semua pengajuan</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="flex flex-wrap gap-4">
                                <Button 
                                    variant="primary" 
                                    className="flex items-center gap-2"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Buat Surat Baru
                                </Button>
                                <Link href={route('vendor.requests.index')}>
                                    <Button variant="secondary" className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Lihat Semua Surat
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Submissions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Pengajuan Terbaru</h3>
                                {recentRequests.length > 0 && (
                                    <Link href={route('vendor.requests.index')} className="text-sm text-blue-600 hover:text-blue-800">
                                        Lihat Semua →
                                    </Link>
                                )}
                            </div>

                            {recentRequests.length === 0 ? (
                                /* Empty State */
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pengajuan</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Mulai dengan membuat surat pengajuan pertama Anda.
                                    </p>
                                    <div className="mt-6">
                                        <Button 
                                            variant="primary" 
                                            className="flex items-center gap-2 mx-auto"
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Buat Surat Baru
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Table */
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    No. Dokumen
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tipe
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tanggal
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {recentRequests.map((request) => (
                                                <tr key={request.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {request.document_serial_no}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {getRequestTypeLabel(request.request_type)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(request.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(request.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <Link
                                                            href={route('vendor.requests.show', request.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Lihat Detail
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Company Info Card */}
                    {auth.user.vendor && (
                        <div className="mt-8 bg-blue-50 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Informasi Perusahaan
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600">Nama Perusahaan</p>
                                        <p className="text-sm font-medium text-gray-900">{auth.user.vendor.company_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">PIC</p>
                                        <p className="text-sm font-medium text-gray-900">{auth.user.vendor.pic_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Telepon</p>
                                        <p className="text-sm font-medium text-gray-900">{auth.user.vendor.pic_phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
