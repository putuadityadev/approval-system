import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import UploadScanModal from '@/Components/shared/UploadScanModal';

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
     * Format tanggal ke format Indonesia (DD/MM/YYYY HH:mm)
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Daftar Surat" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Daftar Surat
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Total: {requests.total} surat
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
                        >
                            + Buat Request Baru
                        </button>
                    </div>

                    {/* Upload & Scan Modal */}
                    <UploadScanModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {requests.data.length === 0 ? (
                            <div className="text-center py-12">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    Belum ada surat
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Mulai dengan membuat surat baru
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href="/vendor/requests/create"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        + Buat Surat Baru
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                No. Dokumen
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tipe Surat
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tanggal Dibuat
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {requests.data.map((request) => (
                                            <tr
                                                key={request.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.document_serial_no}
                                                    </div>
                                                    {request.sop_form_code && (
                                                        <div className="text-xs text-gray-500">
                                                            {request.sop_form_code}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {getTypeLabel(request.request_type)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(request.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(request.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={`/vendor/requests/${request.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Lihat Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {requests.last_page > 1 && (
                                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            {requests.prev_page_url && (
                                                <Link
                                                    href={requests.prev_page_url}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Previous
                                                </Link>
                                            )}
                                            {requests.next_page_url && (
                                                <Link
                                                    href={requests.next_page_url}
                                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Next
                                                </Link>
                                            )}
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Menampilkan{' '}
                                                    <span className="font-medium">
                                                        {requests.from}
                                                    </span>{' '}
                                                    sampai{' '}
                                                    <span className="font-medium">
                                                        {requests.to}
                                                    </span>{' '}
                                                    dari{' '}
                                                    <span className="font-medium">
                                                        {requests.total}
                                                    </span>{' '}
                                                    surat
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                    {requests.links.map((link, index) => (
                                                        <Link
                                                            key={index}
                                                            href={link.url || '#'}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                link.active
                                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            } ${
                                                                !link.url
                                                                    ? 'cursor-not-allowed opacity-50'
                                                                    : ''
                                                            }`}
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    ))}
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
