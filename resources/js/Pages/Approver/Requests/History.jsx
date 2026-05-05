/**
 * Approver Approval History
 *
 * Halaman history approval yang sudah dilakukan oleh approver.
 *
 * Cara kerja:
 * 1. Menampilkan list approval logs (APPROVED & REJECTED)
 * 2. Menampilkan request details dan action yang dilakukan
 * 3. Pagination untuk history yang panjang
 *
 * Props:
 * - approvals: object — paginated approval logs { data, links, meta }
 * - roleLabel: string — label role approver
 */

import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function ApproverHistory({ auth, approvals, roleLabel }) {
    /**
     * getActionBadge
     */
    const getActionBadge = (action) => {
        if (action === 'APPROVED') {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Disetujui
                </span>
            );
        } else if (action === 'REJECTED') {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
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
            'LOADING_IN': 'SIKMB Masuk',
            'LOADING_OUT': 'SIKMB Keluar',
            'IJIN_KERJA': 'SIK',
        };
        return labels[type] || type;
    };

    /**
     * formatDate
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
                            History Approval - {roleLabel}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Riwayat approval yang sudah Anda lakukan
                        </p>
                    </div>

                    {/* History Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {approvals.data.length === 0 ? (
                                /* Empty State */
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada history</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Anda belum melakukan approval apapun.
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
                                                        Tanggal
                                                    </th>
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
                                                        Aksi
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Catatan
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Detail
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {approvals.data.map((approval) => (
                                                    <tr key={approval.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(approval.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {approval.request?.document_serial_no || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {approval.request?.vendor?.company_name || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {getRequestTypeLabel(approval.request?.request_type)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getActionBadge(approval.action)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                            {approval.notes || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {approval.request && (
                                                                <Link
                                                                    href={route('approver.requests.show', approval.request.id)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    Lihat →
                                                                </Link>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {approvals.links && approvals.links.length > 3 && (
                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Menampilkan <span className="font-medium">{approvals.meta.from}</span> sampai{' '}
                                                <span className="font-medium">{approvals.meta.to}</span> dari{' '}
                                                <span className="font-medium">{approvals.meta.total}</span> approval
                                            </div>
                                            <div className="flex gap-2">
                                                {approvals.links.map((link, index) => (
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
                            href={route('approver.requests.index')}
                            className="text-sm text-blue-600 hover:text-blue-900"
                        >
                            Lihat Pending Requests →
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default ApproverHistory;
