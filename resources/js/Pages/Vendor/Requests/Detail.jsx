import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Detail (Detail Request & Cancel)
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan detail lengkap surat (SIKMB atau SIK)
 * - Menampilkan approval history timeline
 * - Menampilkan QR code jika status APPROVED atau EXECUTED
 * - Handle cancel request dengan modal confirmation
 *
 * Cara kerjanya:
 * 1. Menerima data request lengkap dari backend (dengan relationships)
 * 2. Menampilkan detail sesuai tipe surat (SIKMB atau SIK)
 * 3. Menampilkan timeline approval logs
 * 4. Jika status APPROVED/EXECUTED, tampilkan QR code untuk security scan
 * 5. Jika status masih pending, tampilkan tombol cancel
 * 6. Modal confirmation untuk cancel dengan input alasan
 *
 * Props:
 * - request: objek request lengkap dengan relationships (vendor, sikmDetail, sikDetail, approvalLogs, evidences)
 * - vendor: objek vendor { id, company_name, pic_name, pic_phone, address }
 * - qrCodeUrl: string (optional) — URL QR code jika sudah di-generate
 */
export default function Detail({ request, vendor, qrCodeUrl }) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
    });

    /**
     * getStatusBadgeClass
     *
     * Apa yang dilakukan:
     * Return class Tailwind untuk badge status
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
     * Return label Bahasa Indonesia untuk status
     */
    const getStatusLabel = (status) => {
        const labels = {
            DRAFT: 'Draft',
            SUBMITTED: 'Diajukan',
            PENDING_DEPT: 'Menunggu Approval Dept',
            PENDING_OPS: 'Menunggu Approval Ops',
            PENDING_FINANCE: 'Menunggu Approval Finance',
            PENDING_GM: 'Menunggu Approval GM',
            APPROVED: 'Disetujui',
            REJECTED: 'Ditolak',
            CANCELLED: 'Dibatalkan',
            EXECUTED: 'Selesai Dieksekusi',
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
     * Format tanggal ke format Indonesia
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

    /**
     * canCancel
     *
     * Apa yang dilakukan:
     * Check apakah request bisa dicancel (status SUBMITTED atau PENDING_*)
     */
    const canCancel = () => {
        return ['SUBMITTED', 'PENDING_DEPT', 'PENDING_OPS', 'PENDING_FINANCE', 'PENDING_GM'].includes(
            request.status
        );
    };

    /**
     * handleCancelSubmit
     *
     * Apa yang dilakukan:
     * Submit cancel request ke backend
     *
     * Langkah-langkah:
     * 1. Prevent default
     * 2. POST ke /vendor/requests/{id}/cancel dengan reason
     * 3. Close modal jika berhasil
     */
    const handleCancelSubmit = (e) => {
        e.preventDefault();
        post(`/vendor/requests/${request.id}/cancel`, {
            onSuccess: () => {
                setShowCancelModal(false);
                reset();
            },
        });
    };

    return (
        <>
            <Head title={`Detail Surat ${request.document_serial_no}`} />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/vendor/requests"
                            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
                        >
                            ← Kembali ke Daftar Surat
                        </Link>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Detail Surat
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    No. Dokumen: {request.document_serial_no}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span
                                    className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(
                                        request.status
                                    )}`}
                                >
                                    {getStatusLabel(request.status)}
                                </span>
                                {canCancel() && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                                    >
                                        Batalkan Surat
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Informasi Umum */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Informasi Umum
                                </h2>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Tipe Surat
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {getTypeLabel(request.request_type)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Nomor Seri Dokumen
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {request.document_serial_no}
                                        </dd>
                                    </div>
                                    {request.sop_form_code && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Kode Form SOP
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {request.sop_form_code}
                                            </dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Tanggal Dibuat
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {formatDate(request.created_at)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Perusahaan
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {request.vendor.company_name}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Detail SIKMB */}
                            {request.sikmb_detail && (
                                <>
                                    <div className="bg-white rounded-lg shadow-sm p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                            Detail Pengiriman
                                        </h2>
                                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {request.sikmb_detail.origin_floor && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">
                                                        Lantai Asal
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {request.sikmb_detail.origin_floor}
                                                    </dd>
                                                </div>
                                            )}
                                            {request.sikmb_detail.origin_unit && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">
                                                        Unit Asal
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {request.sikmb_detail.origin_unit}
                                                    </dd>
                                                </div>
                                            )}
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">
                                                    Periode
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {request.sikmb_detail.start_date} s/d{' '}
                                                    {request.sikmb_detail.end_date}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">
                                                    Waktu
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {request.sikmb_detail.start_time} -{' '}
                                                    {request.sikmb_detail.end_time}
                                                </dd>
                                            </div>
                                            <div className="md:col-span-2">
                                                <dt className="text-sm font-medium text-gray-500">
                                                    Alamat Tujuan
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {request.sikmb_detail.dest_address}
                                                </dd>
                                            </div>
                                            {request.sikmb_detail.dest_floor && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">
                                                        Lantai Tujuan
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {request.sikmb_detail.dest_floor}
                                                    </dd>
                                                </div>
                                            )}
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">
                                                    Telepon Tujuan
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {request.sikmb_detail.dest_phone}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                            Daftar Barang ({request.sikmb_detail.items.length} item)
                                        </h2>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            No
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Nama Barang
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Jumlah
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Satuan
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Keterangan
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {request.sikmb_detail.items.map((item, index) => (
                                                        <tr key={item.id}>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {item.item_name}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {item.unit}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                {item.remarks || '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Detail SIK */}
                            {request.sik_detail && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Detail Pekerjaan
                                    </h2>
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Jumlah Pekerja
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {request.sik_detail.worker_count} orang
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Jenis Pekerjaan
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {request.sik_detail.job_type}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Periode
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {request.sik_detail.start_date} s/d{' '}
                                                {request.sik_detail.end_date}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Waktu
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {request.sik_detail.start_time} -{' '}
                                                {request.sik_detail.end_time}
                                            </dd>
                                        </div>
                                        <div className="md:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500">
                                                Lokasi Pekerjaan
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {request.sik_detail.location}
                                            </dd>
                                        </div>
                                        {request.sik_detail.description && (
                                            <div className="md:col-span-2">
                                                <dt className="text-sm font-medium text-gray-500">
                                                    Deskripsi
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {request.sik_detail.description}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            )}

                            {/* Cancelled Reason */}
                            {request.status === 'CANCELLED' && request.cancelled_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-red-800 mb-2">
                                        Alasan Pembatalan
                                    </h3>
                                    <p className="text-sm text-red-700">
                                        {request.cancelled_reason}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Approval Timeline */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 top-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Riwayat Approval
                                </h2>
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {request.approval_logs.map((log, index) => (
                                            <li key={log.id}>
                                                <div className="relative pb-8">
                                                    {index !== request.approval_logs.length - 1 && (
                                                        <span
                                                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span
                                                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                                                    log.action === 'APPROVED'
                                                                        ? 'bg-green-500'
                                                                        : log.action === 'REJECTED'
                                                                        ? 'bg-red-500'
                                                                        : log.action === 'CANCELLED'
                                                                        ? 'bg-gray-500'
                                                                        : 'bg-blue-500'
                                                                }`}
                                                            >
                                                                <svg
                                                                    className="h-5 w-5 text-white"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    {log.action === 'APPROVED' && (
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    )}
                                                                    {log.action === 'REJECTED' && (
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    )}
                                                                    {(log.action === 'SUBMITTED' ||
                                                                        log.action === 'CANCELLED') && (
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    )}
                                                                </svg>
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {log.action === 'SUBMITTED' && 'Diajukan'}
                                                                    {log.action === 'APPROVED' && 'Disetujui'}
                                                                    {log.action === 'REJECTED' && 'Ditolak'}
                                                                    {log.action === 'CANCELLED' && 'Dibatalkan'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {log.approver?.email || 'System'}
                                                                </p>
                                                            </div>
                                                            {log.notes && (
                                                                <p className="mt-1 text-sm text-gray-600">
                                                                    {log.notes}
                                                                </p>
                                                            )}
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {formatDate(log.action_date)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* QR Code Section - Tampil jika status APPROVED atau EXECUTED */}
                            {qrCodeUrl && (request.status === 'APPROVED' || request.status === 'EXECUTED') && (
                                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        QR Code Surat
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center">
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <img
                                                    src={qrCodeUrl}
                                                    alt="QR Code Surat"
                                                    className="w-48 h-48"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="hidden flex-col items-center justify-center w-48 h-48 bg-gray-100 rounded">
                                                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                    </svg>
                                                    <p className="text-xs text-gray-500">Gagal memuat QR code</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium text-blue-900 mb-1">
                                                        Cara Menggunakan QR Code
                                                    </h3>
                                                    <ul className="text-xs text-blue-800 space-y-1">
                                                        <li>• Tunjukkan QR code ini ke petugas security saat eksekusi surat</li>
                                                        <li>• QR code valid selama 7 hari dari tanggal approval</li>
                                                        <li>• Simpan screenshot QR code untuk backup</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <a
                                            href={qrCodeUrl}
                                            download={`QR_${request.document_serial_no}.svg`}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download QR Code
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setShowCancelModal(false)}
                        />

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleCancelSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg
                                                className="h-6 w-6 text-red-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Batalkan Surat
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Apakah Anda yakin ingin membatalkan surat ini? Tindakan ini tidak dapat dibatalkan.
                                                </p>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Alasan Pembatalan <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={data.reason}
                                                    onChange={(e) => setData('reason', e.target.value)}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    placeholder="Jelaskan alasan pembatalan (minimal 10 karakter)"
                                                    required
                                                />
                                                {errors.reason && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.reason}
                                                    </p>
                                                )}
                                                {errors.cancel && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.cancel}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Membatalkan...' : 'Ya, Batalkan'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCancelModal(false);
                                            reset();
                                        }}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
