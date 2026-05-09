/**
 * Approver Request Detail
 *
 * Halaman detail request dengan tombol approve/reject untuk approver.
 *
 * Cara kerja:
 * 1. Menampilkan detail lengkap request (SIKMB atau SIK)
 * 2. Menampilkan approval timeline
 * 3. Tombol approve/reject hanya muncul jika canApprove = true
 * 4. Modal approve dengan textarea notes (optional)
 * 5. Modal reject dengan textarea reason (required, min 10 karakter)
 *
 * Props:
 * - request: object — detail request dengan relasi lengkap
 * - roleLabel: string — label role approver
 * - canApprove: boolean — apakah approver bisa approve request ini
 */

import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import ValidationErrors from '@/Components/shared/ValidationErrors';

function ApproverRequestDetail({ auth, request, roleLabel, canApprove }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Form untuk approve
    const approveForm = useForm({
        notes: '',
    });

    // Form untuk reject
    const rejectForm = useForm({
        reason: '',
    });

    /**
     * handleApprove
     *
     * Submit approve request dengan notes (optional).
     */
    const handleApprove = (e) => {
        e.preventDefault();
        approveForm.post(route('approver.requests.approve', request.id), {
            onSuccess: () => {
                setShowApproveModal(false);
                approveForm.reset();
            },
        });
    };

    /**
     * handleReject
     *
     * Submit reject request dengan reason (required).
     */
    const handleReject = (e) => {
        e.preventDefault();
        rejectForm.post(route('approver.requests.reject', request.id), {
            onSuccess: () => {
                setShowRejectModal(false);
                rejectForm.reset();
            },
        });
    };

    /**
     * getStatusBadge
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
        };

        const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    /**
     * getRequestTypeLabel
     */
    const getRequestTypeLabel = (type) => {
        const labels = {
            'LOADING_IN': 'SIKMB Barang Masuk',
            'LOADING_OUT': 'SIKMB Barang Keluar',
            'IJIN_KERJA': 'SIK (Surat Izin Kerja)',
        };
        return labels[type] || type;
    };

    /**
     * formatDate
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    /**
     * getActionIcon
     */
    const getActionIcon = (action) => {
        if (action === 'APPROVED') {
            return (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            );
        } else if (action === 'REJECTED') {
            return (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            );
        } else {
            return (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            );
        }
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('approver.requests.index')}
                            className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
                        >
                            ← Kembali ke List
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Detail Surat
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    {request.document_serial_no}
                                </p>
                            </div>
                            <div>
                                {getStatusBadge(request.status)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Main Content */}
                        <div className="space-y-6">
                            {/* Informasi Umum */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Umum</h3>
                                    <dl className="grid grid-cols-1 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Tipe Surat</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{getRequestTypeLabel(request.request_type)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">No. Dokumen</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{request.document_serial_no}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{request.vendor?.company_name || '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Tanggal Submit</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{formatDate(request.created_at)}</dd>
                                        </div>
                                        {request.sop_form_code && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Kode Form SOP</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{request.sop_form_code}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>

                            {/* Detail SIKMB */}
                            {request.sikmb_detail && (
                                <>
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pengiriman</h3>
                                            <dl className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Tanggal</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {request.sikmb_detail.start_date} s/d {request.sikmb_detail.end_date}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Waktu</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {request.sikmb_detail.start_time} - {request.sikmb_detail.end_time}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Asal</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        Lantai {request.sikmb_detail.origin_floor}
                                                        {request.sikmb_detail.origin_unit && ` - Unit ${request.sikmb_detail.origin_unit}`}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Tujuan</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        Lantai {request.sikmb_detail.dest_floor}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Alamat Tujuan</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{request.sikmb_detail.dest_address}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Telepon Tujuan</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{request.sikmb_detail.dest_phone}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    {/* Daftar Barang */}
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Barang</h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {request.sikmb_detail.items?.map((item, index) => (
                                                            <tr key={item.id}>
                                                                <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">{item.item_name}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-500">{item.remarks || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Detail SIK */}
                            {request.sik_detail && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pekerjaan</h3>
                                        <dl className="grid grid-cols-1 gap-4">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Jumlah Pekerja</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{request.sik_detail.worker_count} orang</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Jenis Pekerjaan</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{request.sik_detail.job_type}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Tanggal</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {request.sik_detail.start_date} s/d {request.sik_detail.end_date}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Waktu</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {request.sik_detail.start_time} - {request.sik_detail.end_time}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Lokasi</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{request.sik_detail.location}</dd>
                                            </div>
                                            {request.sik_detail.description && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Deskripsi</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{request.sik_detail.description}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                </div>
                            )}

                            {/* Timeline Approval */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Approval</h3>
                                    <div className="space-y-4">
                                        {request.approval_logs?.map((log, index) => (
                                            <div key={log.id} className="flex gap-3">
                                                {getActionIcon(log.action)}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {log.action === 'APPROVED' ? 'Disetujui' : log.action === 'REJECTED' ? 'Ditolak' : 'Diajukan'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {log.approver?.email || 'System'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatDate(log.action_date)}
                                                    </p>
                                                    {log.notes && (
                                                        <p className="text-xs text-gray-600 mt-2 italic">
                                                            "{log.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {canApprove && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Approval</h3>
                                        <div className="flex gap-4">
                                            <Button
                                                variant="primary"
                                                onClick={() => setShowApproveModal(true)}
                                                className="flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Setujui
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => setShowRejectModal(true)}
                                                className="flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Tolak
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Preview Surat (Sticky) */}
                        <div className="lg:sticky lg:top-6 lg:self-start">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Surat</h3>
                                    
                                    {request.original_form_image ? (
                                        <div className="space-y-4">
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <img
                                                    src={request.original_form_image}
                                                    alt="Preview Surat"
                                                    className="w-full h-auto"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="hidden flex-col items-center justify-center p-8 bg-gray-50">
                                                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-sm text-gray-500">Gagal memuat preview</p>
                                                </div>
                                            </div>
                                            
                                            <a
                                                href={request.original_form_image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Buka di Tab Baru
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm text-gray-500 text-center">
                                                Tidak ada preview surat
                                            </p>
                                            <p className="text-xs text-gray-400 text-center mt-1">
                                                Vendor tidak mengupload dokumen fisik
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Setujui Surat</h3>
                        <form onSubmit={handleApprove}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan (Optional)
                                </label>
                                <textarea
                                    value={approveForm.data.notes}
                                    onChange={(e) => approveForm.setData('notes', e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tambahkan catatan jika diperlukan..."
                                />
                                <ValidationErrors errors={approveForm.errors} />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowApproveModal(false)}
                                    disabled={approveForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={approveForm.processing}
                                >
                                    {approveForm.processing ? 'Memproses...' : 'Setujui'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tolak Surat</h3>
                        <form onSubmit={handleReject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alasan Penolakan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectForm.data.reason}
                                    onChange={(e) => rejectForm.setData('reason', e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Jelaskan alasan penolakan (minimal 10 karakter)..."
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimal 10 karakter</p>
                                <ValidationErrors errors={rejectForm.errors} />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowRejectModal(false)}
                                    disabled={rejectForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    disabled={rejectForm.processing}
                                >
                                    {rejectForm.processing ? 'Memproses...' : 'Tolak'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

export default ApproverRequestDetail;
