/**
 * Security Request Detail
 *
 * Halaman detail request setelah QR scan dengan upload evidence.
 *
 * Props:
 * - auth: object — data user yang sedang login
 * - request: object — detail request dengan relasi lengkap
 * - qrCodeUrl: string — URL QR code image
 * - formImageUrl: string — URL preview surat original
 * - hasEvidence: boolean — apakah sudah ada evidence
 */

import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import ValidationErrors from '@/Components/shared/ValidationErrors';

function RequestDetail({ auth, request, qrCodeUrl, formImageUrl, hasEvidence }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        photos: [],
    });

    /**
     * Handle file selection
     */
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validate max 5 files
        if (files.length > 5) {
            alert('Maksimal 5 foto evidence');
            return;
        }

        setSelectedFiles(files);
        setData('photos', files);

        // Generate preview URLs
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    /**
     * Remove selected file
     */
    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newUrls = previewUrls.filter((_, i) => i !== index);
        
        setSelectedFiles(newFiles);
        setPreviewUrls(newUrls);
        setData('photos', newFiles);
    };

    /**
     * Submit evidence photos
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('security.requests.evidence', request.id), {
            forceFormData: true,
        });
    };

    /**
     * Format date
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
     * Get status badge
     */
    const getStatusBadge = (status) => {
        const config = {
            'APPROVED': { label: 'Disetujui', color: 'bg-green-100 text-green-800' },
            'EXECUTED': { label: 'Selesai', color: 'bg-purple-100 text-purple-800' },
        };
        const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${color}`}>{label}</span>;
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('security.scanner')}
                            className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
                        >
                            ← Kembali ke Scanner
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Request Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Informasi Umum */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Surat</h3>
                                    <dl className="grid grid-cols-1 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Tipe Surat</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {request.request_type === 'LOADING_IN' ? 'SIKMB Barang Masuk' :
                                                 request.request_type === 'LOADING_OUT' ? 'SIKMB Barang Keluar' :
                                                 'SIK (Surat Izin Kerja)'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{request.vendor?.company_name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Tanggal Disetujui</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{formatDate(request.updated_at)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Detail SIKMB/SIK */}
                            {request.sikmb_detail && (
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
                                                <dt className="text-sm font-medium text-gray-500">Lokasi</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    Lantai {request.sikmb_detail.origin_floor} → Lantai {request.sikmb_detail.dest_floor}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            )}

                            {request.sik_detail && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pekerjaan</h3>
                                        <dl className="grid grid-cols-1 gap-4">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Jenis Pekerjaan</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{request.sik_detail.job_type}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Jumlah Pekerja</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{request.sik_detail.worker_count} orang</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Lokasi</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{request.sik_detail.location}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            )}

                            {/* Upload Evidence Section */}
                            {!hasEvidence && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Foto Evidence</h3>
                                        
                                        <ValidationErrors errors={errors} />

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {/* File Input */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Pilih Foto (Max 5 foto, masing-masing max 5MB)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    disabled={processing}
                                                />
                                            </div>

                                            {/* Preview */}
                                            {previewUrls.length > 0 && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {previewUrls.map((url, index) => (
                                                        <div key={index} className="relative">
                                                            <img
                                                                src={url}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                                disabled={processing}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                disabled={processing || selectedFiles.length === 0}
                                                className="w-full"
                                            >
                                                {processing ? 'Mengupload...' : `Upload ${selectedFiles.length} Foto`}
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Evidence Already Uploaded */}
                            {hasEvidence && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto Evidence</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {request.evidences?.map((evidence, index) => (
                                                <div key={evidence.id}>
                                                    <img
                                                        src={evidence.photo_url || '/placeholder.jpg'}
                                                        alt={`Evidence ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(evidence.uploaded_at)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                            <p className="text-sm text-green-800 font-medium">
                                                ✓ Evidence sudah diupload. Status: EXECUTED
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Preview Surat & QR Code (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-6 space-y-6">
                                {/* Preview Surat */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Surat</h3>
                                        
                                        {formImageUrl ? (
                                            <div className="space-y-4">
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <img
                                                        src={formImageUrl}
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
                                                    href={formImageUrl}
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

                                {/* QR Code */}
                                {qrCodeUrl && (
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
                                            <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                                                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default RequestDetail;
