import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * CreateSik (Form SIK)
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan form submit surat SIK (Izin Kerja)
 * - Upload foto form fisik (opsional)
 * - Submit data ke backend
 *
 * Cara kerjanya:
 * 1. Menerima data vendor dari backend
 * 2. User mengisi form detail pekerjaan
 * 3. Submit form ke POST /vendor/requests/sik
 * 4. Redirect ke detail page jika berhasil
 *
 * Props:
 * - vendor: objek vendor { id, company_name, pic_name, pic_phone, address }
 */
export default function CreateSik({ vendor }) {
    const { data, setData, post, processing, errors } = useForm({
        sop_form_code: '',
        document_serial_no: '',
        original_form_image: null,
        worker_count: 1,
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        location: '',
        job_type: '',
        description: ''
    });

    const [imagePreview, setImagePreview] = useState(null);

    /**
     * handleImageChange
     *
     * Apa yang dilakukan:
     * Handle upload foto form fisik
     *
     * Langkah-langkah:
     * 1. Ambil file dari input
     * 2. Set data.original_form_image dengan file object
     * 3. Create preview URL untuk ditampilkan
     */
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('original_form_image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    /**
     * handleSubmit
     *
     * Apa yang dilakukan:
     * Submit form ke backend
     *
     * Langkah-langkah:
     * 1. Prevent default form submission
     * 2. Call post() dengan route dan options
     * 3. Backend akan redirect ke detail page jika berhasil
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/vendor/requests/sik', {
            forceFormData: true, // Required untuk file upload
        });
    };

    return (
        <>
            <Head title="Buat Surat Izin Kerja" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/vendor/requests/create"
                            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
                        >
                            ← Kembali
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Surat Izin Kerja (SIK)
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Ajukan izin kerja untuk pekerjaan di area mall
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Card: Informasi Dokumen */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Informasi Dokumen
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kode Form SOP (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.sop_form_code}
                                        onChange={(e) => setData('sop_form_code', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: SM-ICB/001"
                                    />
                                    {errors.sop_form_code && (
                                        <p className="mt-1 text-sm text-red-600">{errors.sop_form_code}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nomor Seri Dokumen <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.document_serial_no}
                                        onChange={(e) => setData('document_serial_no', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: 001518"
                                        required
                                    />
                                    {errors.document_serial_no && (
                                        <p className="mt-1 text-sm text-red-600">{errors.document_serial_no}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Foto Form Fisik (Opsional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleImageChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.original_form_image && (
                                    <p className="mt-1 text-sm text-red-600">{errors.original_form_image}</p>
                                )}
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mt-2 h-32 object-cover rounded-md"
                                    />
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Format: JPG, PNG. Maksimal 5MB.
                                </p>
                            </div>
                        </div>

                        {/* Card: Detail Pekerjaan */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Detail Pekerjaan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah Pekerja <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.worker_count}
                                        onChange={(e) => setData('worker_count', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.worker_count && (
                                        <p className="mt-1 text-sm text-red-600">{errors.worker_count}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Jenis Pekerjaan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.job_type}
                                        onChange={(e) => setData('job_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: Instalasi Listrik"
                                        required
                                    />
                                    {errors.job_type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.job_type}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Mulai <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Selesai <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.end_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Jam Mulai <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.start_time && (
                                        <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Jam Selesai <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.end_time && (
                                        <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lokasi Pekerjaan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: Toilet Lt. GF"
                                    required
                                />
                                {errors.location && (
                                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi Pekerjaan (Opsional)
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Jelaskan detail pekerjaan yang akan dilakukan, termasuk jika memerlukan Hot Work Permit atau izin khusus lainnya"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600">{errors.submit}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end space-x-3">
                            <Link
                                href="/vendor/requests/create"
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Mengirim...' : 'Submit Surat'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
