/**
 * Approver Requests Index
 *
 * Halaman list pending requests untuk approver.
 *
 * Cara kerja:
 * 1. Menampilkan list requests yang perlu di-approve sesuai role approver
 * 2. Filter otomatis berdasarkan status (Dept → SUBMITTED, Ops → PENDING_DEPT, dll)
 * 3. Menampilkan badge status dengan warna berbeda
 * 4. Link ke detail page untuk approve/reject
 *
 * Props:
 * - requests: object — paginated requests { data, links, meta }
 * - roleLabel: string — label role approver (Department, Operations, Finance, GM)
 */

import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function ApproverRequestsIndex({ auth, requests, roleLabel }) {
    /**
     * getStatusBadge
     *
     * Mengembalikan badge component berdasarkan status request.
     */
    const getStatusBadge = (status) => {
        const statusConfig = {
            'SUBMITTED': { label: 'Diajukan', color: 'bg-blue-100 text-blue-800' },
            'PENDING_DEPT': { label: 'Pending Dept', color: 'bg-yellow-100 text-yellow-800' },
            'PENDING_OPS': { label: 'Pending Ops', color: 'bg-yellow-100 text-yellow-800' },
            'PENDING_FINANCE': { label: 'Pending Finance', color: 'bg-yellow-100 text-yellow-800' },
            'PENDING_GM': { label: 'Pending GM', color: 'bg-yellow-100 text-yellow-800' },
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
                            Pending Requests - {roleLabel}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Surat yang menunggu approval dari Anda
                        </p>
                    </div>

                    {/* Requests Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {requests.data.length === 0 ? (
                                /* Empty State */
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada surat pending</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Semua surat sudah di-approve atau belum ada surat baru.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        No. Dokumen
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Vendor
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tipe
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tanggal Submit
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {requests.data.map((request) => (
                                                    <tr key={request.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {request.document_serial_no}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {request.vendor?.company_name || '-'}
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
                                                                href={route('approver.requests.show', request.id)}
                                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                                            >
                                                                Review →
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {requests.links && requests.links.length > 3 && (
                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Menampilkan <span className="font-medium">{requests.meta.from}</span> sampai{' '}
                                                <span className="font-medium">{requests.meta.to}</span> dari{' '}
                                                <span className="font-medium">{requests.meta.total}</span> surat
                                            </div>
                                            <div className="flex gap-2">
                                                {requests.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`px-3 py-2 text-sm rounded-md ${
                                                            link.active
                                                                ? 'bg-blue-600 text-white'
                                                                : link.url
                                                                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-6 flex gap-4">
                        <Link
                            href={route('approver.dashboard')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            ← Kembali ke Dashboard
                        </Link>
                        <Link
                            href={route('approver.history')}
                            className="text-sm text-blue-600 hover:text-blue-900"
                        >
                            Lihat History Approval →
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default ApproverRequestsIndex;
