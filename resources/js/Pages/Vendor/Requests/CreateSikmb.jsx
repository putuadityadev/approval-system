import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

/**
 * CreateSikmb
 *
 * Form untuk membuat Surat Izin Keluar/Masuk Barang (SIKMB).
 * 
 * PERUBAHAN: OCR DINONAKTIFKAN
 * - Form selalu dimulai dari KOSONG (tidak ada pre-fill OCR)
 * - Tidak ada preview surat di samping
 * - Upload foto surat OPSIONAL di dalam form (belum diimplementasikan)
 * - User input manual semua data
 * 
 * Props:
 * - vendor: object - Data vendor yang login
 * - requestType: string - "LOADING_IN" atau "LOADING_OUT"
 */
export default function CreateSikmb({ vendor, requestType }) {
    const { flash } = usePage().props;
    const formStorageKey = `sikmb_form_${requestType}_draft`;

    const getInitialData = () => {
        // Load dari localStorage jika ada (auto-save saat user ketik)
        const savedData = localStorage.getItem(formStorageKey);
        if (savedData && !flash?.success) {
            try { 
                return JSON.parse(savedData); 
            } catch (e) {
                console.error('Failed to parse saved form data:', e);
            }
        }
        
        // Default: form kosong
        return {
            request_type: requestType,
            sop_form_code: '',
            document_serial_no: '',
            origin_floor: '',
            origin_unit: '',
            start_date: '',
            end_date: '',
            start_time: '',
            end_time: '',
            dest_address: '',
            dest_floor: '',
            dest_phone: '',
            items: [{ item_name: '', quantity: 1, unit: '', remarks: '' }]
        };
    };

    const { data, setData, post, processing, errors } = useForm(getInitialData());

    useEffect(() => {
        localStorage.setItem(formStorageKey, JSON.stringify(data));
    }, [data, formStorageKey]);

    useEffect(() => {
        return () => {
            if (!processing && Object.keys(errors).length === 0) {
            }
        };
    }, [processing, errors]);

    const handleAddItem = () => {
        setData('items', [...data.items, { item_name: '', quantity: 1, unit: '', remarks: '' }]);
    };

    const handleRemoveItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('vendor.requests.store.sikmb'), {
            onSuccess: () => localStorage.removeItem(formStorageKey),
        });
    };

    return (
        <>
            <Head title={`Form ${requestType === 'LOADING_IN' ? 'Barang Masuk' : 'Barang Keluar'}`} />

            <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="max-w-6xl mx-auto space-y-6 py-6">
                    {/* Header */}
                    <div>
                        <Link
                            href={route('vendor.requests.index')}
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:border-primary/50 transition-all mb-6 group"
                        >
                            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Kembali ke Daftar Surat
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-[24px] sm:text-[30px] font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-[32px]">inventory_2</span>
                                    Form {requestType === 'LOADING_IN' ? 'Barang Masuk' : 'Barang Keluar'}
                                </h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Isi semua data surat secara manual
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 items-start">
                        {/* Form - Full Width (tidak ada preview lagi) */}
                        <div className="space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Document Info */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">info</span>
                                        Informasi Dokumen
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kode Form SOP (Opsional)</label>
                                            <input
                                                type="text"
                                                value={data.sop_form_code}
                                                onChange={(e) => setData('sop_form_code', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                                placeholder="SM-ICB/001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">No. Seri Dokumen <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={data.document_serial_no}
                                                onChange={(e) => setData('document_serial_no', e.target.value)}
                                                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.document_serial_no ? 'border-red-500' : 'border-slate-200'}`}
                                                placeholder="001518"
                                                required
                                            />
                                            {errors.document_serial_no && <p className="mt-1 text-xs font-medium text-red-600">{errors.document_serial_no}</p>}
                                        </div>
                                        
                                        {/* Upload Foto Surat (OPSIONAL) */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                Upload Foto Surat (Opsional)
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png"
                                                onChange={(e) => setData('original_form_image', e.target.files[0])}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                            />
                                            <p className="mt-1 text-xs text-slate-500">
                                                Format: JPG atau PNG. Maksimal 5MB. Upload foto surat fisik untuk dokumentasi (opsional).
                                            </p>
                                            {errors.original_form_image && <p className="mt-1 text-xs font-medium text-red-600">{errors.original_form_image}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Origin Info */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">my_location</span>
                                        Informasi Asal
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Lantai Asal</label>
                                            <input
                                                type="text"
                                                value={data.origin_floor}
                                                onChange={(e) => setData('origin_floor', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                                placeholder="Lt. 3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Unit Asal</label>
                                            <input
                                                type="text"
                                                value={data.origin_unit}
                                                onChange={(e) => setData('origin_unit', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                                placeholder="Unit A"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                                        Jadwal
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tanggal Mulai <span className="text-red-500">*</span></label>
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
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tanggal Selesai <span className="text-red-500">*</span></label>
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
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Jam Mulai <span className="text-red-500">*</span></label>
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
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Jam Selesai <span className="text-red-500">*</span></label>
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
                                </div>

                                {/* Destination */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">location_on</span>
                                        Informasi Tujuan
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Alamat Tujuan <span className="text-red-500">*</span></label>
                                            <textarea
                                                value={data.dest_address}
                                                onChange={(e) => setData('dest_address', e.target.value)}
                                                rows={2}
                                                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.dest_address ? 'border-red-500' : 'border-slate-200'}`}
                                                placeholder="Jl. Contoh No. 123, Jakarta"
                                                required
                                            />
                                            {errors.dest_address && <p className="mt-1 text-xs font-medium text-red-600">{errors.dest_address}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Lantai Tujuan</label>
                                                <input
                                                    type="text"
                                                    value={data.dest_floor}
                                                    onChange={(e) => setData('dest_floor', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                                    placeholder="Lt. 2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">No. Telepon <span className="text-red-500">*</span></label>
                                                <input
                                                    type="tel"
                                                    value={data.dest_phone}
                                                    onChange={(e) => setData('dest_phone', e.target.value)}
                                                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400 ${errors.dest_phone ? 'border-red-500' : 'border-slate-200'}`}
                                                    placeholder="081234567890"
                                                    required
                                                />
                                                {errors.dest_phone && <p className="mt-1 text-xs font-medium text-red-600">{errors.dest_phone}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400">category</span>
                                            Daftar Barang
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="px-3 py-1.5 text-sm font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">add</span> Tambah
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                                                        Barang #{index + 1}
                                                    </span>
                                                    {data.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">delete</span> Hapus
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nama Barang <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={item.item_name}
                                                            onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                                            placeholder="Meja Kayu"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Jumlah <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                                            min="1"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Satuan <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={item.unit}
                                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                                            placeholder="Unit/Pcs/Dus"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Keterangan</label>
                                                        <input
                                                            type="text"
                                                            value={item.remarks}
                                                            onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-primary focus:border-primary text-sm placeholder:text-slate-400"
                                                            placeholder="Keterangan tambahan (opsional)"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-3 pt-4">
                                    <Link
                                        href={route('vendor.requests.index')}
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
                    </div>
                </div>
            </div>
        </>
    );
}
