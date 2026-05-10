import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DocumentViewer from '@/Components/shared/DocumentViewer';

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('original_form_image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/vendor/requests/sik', {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Buat Surat Izin Kerja" />

            <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="max-w-6xl mx-auto space-y-6 py-6">
                    {/* Header */}
                    <div>
                        <Link
                            href="/vendor/requests/create"
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:border-primary/50 transition-all mb-6 group"
                        >
                            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Kembali ke Pilihan Surat
                        </Link>
                        <div>
                            <h1 className="text-[24px] sm:text-[30px] font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[32px]">engineering</span>
                                Surat Izin Kerja (SIK)
                            </h1>
                            <p className="mt-2 text-sm font-medium text-slate-500">
                                Ajukan izin kerja untuk pekerjaan di area mall
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* LEFT: Form */}
                        <div className="lg:col-span-7 space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Document Info */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <h2 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">info</span>
                                        Informasi Dokumen
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                Kode Form SOP (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.sop_form_code}
                                                onChange={(e) => setData('sop_form_code', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                                placeholder="Contoh: SM-ICB/001"
                                            />
                                            {errors.sop_form_code && <p className="mt-1 text-xs font-medium text-red-600">{errors.sop_form_code}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                No. Seri Dokumen <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.document_serial_no}
                                                onChange={(e) => setData('document_serial_no', e.target.value)}
                                                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.document_serial_no ? 'border-red-500' : 'border-slate-200'}`}
                                                placeholder="Contoh: 001518"
                                                required
                                            />
                                            {errors.document_serial_no && <p className="mt-1 text-xs font-medium text-red-600">{errors.document_serial_no}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                            Foto Form Fisik (Opsional)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleImageChange}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-primary focus:border-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                        />
                                        {errors.original_form_image && <p className="mt-1 text-xs font-medium text-red-600">{errors.original_form_image}</p>}
                                        <p className="mt-2 text-xs font-medium text-slate-500">
                                            Format: JPG, PNG. Maksimal 5MB.
                                        </p>
                                    </div>
                                </div>

                                {/* Detail Pekerjaan */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <h2 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">engineering</span>
                                        Detail Pekerjaan
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                Jumlah Pekerja <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={data.worker_count}
                                                onChange={(e) => setData('worker_count', parseInt(e.target.value))}
                                                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.worker_count ? 'border-red-500' : 'border-slate-200'}`}
                                                required
                                            />
                                            {errors.worker_count && <p className="mt-1 text-xs font-medium text-red-600">{errors.worker_count}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                Jenis Pekerjaan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.job_type}
                                                onChange={(e) => setData('job_type', e.target.value)}
                                                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.job_type ? 'border-red-500' : 'border-slate-200'}`}
                                                placeholder="Contoh: Instalasi Listrik"
                                                required
                                            />
                                            {errors.job_type && <p className="mt-1 text-xs font-medium text-red-600">{errors.job_type}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                Tanggal Mulai <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.start_date ? 'border-red-500' : 'border-slate-200'}`}
                                                required
                                            />
                                            {errors.start_date && <p className="mt-1 text-xs font-medium text-red-600">{errors.start_date}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                Tanggal Selesai <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.end_date ? 'border-red-500' : 'border-slate-200'}`}
                                                required
                                            />
                                            {errors.end_date && <p className="mt-1 text-xs font-medium text-red-600">{errors.end_date}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                Jam Mulai <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                value={data.start_time}
                                                onChange={(e) => setData('start_time', e.target.value)}
                                                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.start_time ? 'border-red-500' : 'border-slate-200'}`}
                                                required
                                            />
                                            {errors.start_time && <p className="mt-1 text-xs font-medium text-red-600">{errors.start_time}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                Jam Selesai <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                value={data.end_time}
                                                onChange={(e) => setData('end_time', e.target.value)}
                                                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.end_time ? 'border-red-500' : 'border-slate-200'}`}
                                                required
                                            />
                                            {errors.end_time && <p className="mt-1 text-xs font-medium text-red-600">{errors.end_time}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                            Lokasi Pekerjaan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.location ? 'border-red-500' : 'border-slate-200'}`}
                                            placeholder="Contoh: Toilet Lt. GF"
                                            required
                                        />
                                        {errors.location && <p className="mt-1 text-xs font-medium text-red-600">{errors.location}</p>}
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                            Deskripsi Pekerjaan (Opsional)
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                            placeholder="Jelaskan detail pekerjaan yang akan dilakukan, termasuk jika memerlukan Hot Work Permit atau izin khusus lainnya"
                                        />
                                        {errors.description && <p className="mt-1 text-xs font-medium text-red-600">{errors.description}</p>}
                                    </div>
                                </div>

                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-red-600">{errors.submit}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Link
                                        href="/vendor/requests/create"
                                        className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-center font-bold text-sm transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Mengirim...</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-[18px]">send</span> Submit Surat</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT: Preview */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-8">
                                <h3 className="text-[16px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">preview</span>
                                    Preview Surat Fisik
                                </h3>

                                <DocumentViewer url={imagePreview} title="Foto Form Fisik" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
