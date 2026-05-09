import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

/**
 * CreateSikmb (Form SIKMB dengan Split Layout)
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan form submit surat SIKMB (Barang Masuk/Keluar)
 * - Layout split: Form di kiri, Preview surat di kanan
 * - Pre-fill form dengan data OCR (jika ada)
 * - Handle dynamic items array (tambah/hapus barang)
 * - Submit data ke backend
 *
 * Cara kerjanya:
 * 1. Menerima data vendor, requestType, ocrData, dan previewUrl dari backend
 * 2. Pre-fill form dengan ocrData jika ada
 * 3. Tampilkan preview surat di kanan
 * 4. User crosscheck dan lengkapi data
 * 5. Submit form ke POST /vendor/requests/sikmb
 *
 * Props:
 * - vendor: objek vendor
 * - requestType: string 'LOADING_IN' atau 'LOADING_OUT'
 * - ocrData: objek data hasil OCR (optional)
 * - uploadedFileName: string nama file yang diupload (optional)
 * - previewUrl: string base64 URL untuk preview (optional)
 */
export default function CreateSikmb({ vendor, requestType, ocrData = {}, uploadedFileName, previewUrl }) {
    // Generate unique key untuk localStorage berdasarkan session
    const formStorageKey = `sikmb_form_${requestType}_${uploadedFileName || 'draft'}`;

    // Load data dari localStorage jika ada, fallback ke ocrData
    const getInitialData = () => {
        const savedData = localStorage.getItem(formStorageKey);
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error('Failed to parse saved form data:', e);
            }
        }
        
        // Fallback ke OCR data
        return {
            request_type: requestType,
            sop_form_code: ocrData.sop_form_code || '',
            document_serial_no: ocrData.document_serial_no || '',
            origin_floor: ocrData.origin_floor || '',
            origin_unit: ocrData.origin_unit || '',
            start_date: ocrData.start_date || '',
            end_date: ocrData.end_date || '',
            start_time: ocrData.start_time || '',
            end_time: ocrData.end_time || '',
            dest_address: ocrData.dest_address || '',
            dest_floor: ocrData.dest_floor || '',
            dest_phone: ocrData.dest_phone || '',
            items: ocrData.items && ocrData.items.length > 0 
                ? ocrData.items 
                : [{ item_name: '', quantity: 1, unit: '', remarks: '' }]
        };
    };

    const { data, setData, post, processing, errors } = useForm(getInitialData());

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem(formStorageKey, JSON.stringify(data));
    }, [data, formStorageKey]);

    // Clear localStorage on successful submit
    useEffect(() => {
        // Jika tidak ada errors dan tidak processing, berarti mungkin sukses atau baru load
        // Kita clear localStorage saat component unmount (redirect ke page lain)
        return () => {
            // Check if we're navigating away (not just re-rendering)
            if (!processing && Object.keys(errors).length === 0) {
                // Don't clear immediately, let the submit finish first
            }
        };
    }, [processing, errors]);

    const handleAddItem = () => {
        setData('items', [
            ...data.items,
            { item_name: '', quantity: 1, unit: '', remarks: '' }
        ]);
    };

    const handleRemoveItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('vendor.requests.store.sikmb'), {
            onSuccess: () => {
                // Clear localStorage on successful submit
                localStorage.removeItem(formStorageKey);
            },
        });
    };

    return (
        <>
            <Head title={`Form ${requestType === 'LOADING_IN' ? 'Barang Masuk' : 'Barang Keluar'}`} />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('vendor.requests.index')}
                            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
                        >
                            ← Kembali ke Daftar Surat
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            📦 Form {requestType === 'LOADING_IN' ? 'Barang Masuk' : 'Barang Keluar'}
                        </h1>
                        {uploadedFileName && (
                            <p className="mt-2 text-sm text-gray-600">
                                📄 File: {uploadedFileName}
                            </p>
                        )}
                    </div>

                    {/* Split Layout: Form (Left) + Preview (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LEFT: Form */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Document Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Informasi Dokumen
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Kode Form SOP (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.sop_form_code}
                                                onChange={(e) => setData('sop_form_code', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="SM-ICB/001"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                No. Seri Dokumen <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.document_serial_no}
                                                onChange={(e) => setData('document_serial_no', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.document_serial_no ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="001518"
                                                required
                                            />
                                            {errors.document_serial_no && (
                                                <p className="mt-1 text-sm text-red-600">{errors.document_serial_no}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Origin Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Informasi Asal
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Lantai Asal
                                            </label>
                                            <input
                                                type="text"
                                                value={data.origin_floor}
                                                onChange={(e) => setData('origin_floor', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Lt. 3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Unit Asal
                                            </label>
                                            <input
                                                type="text"
                                                value={data.origin_unit}
                                                onChange={(e) => setData('origin_unit', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Unit A"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Jadwal
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tanggal Mulai <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.start_date ? 'border-red-500' : 'border-gray-300'
                                                }`}
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
                                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.end_date ? 'border-red-500' : 'border-gray-300'
                                                }`}
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
                                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.start_time ? 'border-red-500' : 'border-gray-300'
                                                }`}
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
                                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.end_time ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.end_time && (
                                                <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Destination */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Informasi Tujuan
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Alamat Tujuan <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={data.dest_address}
                                                onChange={(e) => setData('dest_address', e.target.value)}
                                                rows={3}
                                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.dest_address ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Jl. Contoh No. 123, Jakarta"
                                                required
                                            />
                                            {errors.dest_address && (
                                                <p className="mt-1 text-sm text-red-600">{errors.dest_address}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Lantai Tujuan
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.dest_floor}
                                                    onChange={(e) => setData('dest_floor', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Lt. 2"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    No. Telepon <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={data.dest_phone}
                                                    onChange={(e) => setData('dest_phone', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.dest_phone ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    placeholder="081234567890"
                                                    required
                                                />
                                                {errors.dest_phone && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.dest_phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Daftar Barang
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            + Tambah Barang
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Barang #{index + 1}
                                                    </span>
                                                    {data.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="text-red-600 hover:text-red-700 text-sm"
                                                        >
                                                            Hapus
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Nama Barang <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.item_name}
                                                            onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Meja Kayu"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Jumlah <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            min="1"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Satuan <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.unit}
                                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Unit/Pcs/Dus"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Keterangan
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.remarks}
                                                            onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center font-medium"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {processing ? 'Mengirim...' : '✓ Submit Surat'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT: Preview */}
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8 h-fit">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                📄 Preview Surat
                            </h3>
                            
                            {previewUrl ? (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={previewUrl}
                                        alt="Preview Surat"
                                        className="w-full h-auto"
                                    />
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                                    <div className="text-4xl mb-3">📄</div>
                                    <p className="text-sm text-gray-600">
                                        Tidak ada preview surat
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Upload surat terlebih dahulu untuk melihat preview
                                    </p>
                                </div>
                            )}

                            {/* Info */}
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-800">
                                    <strong>💡 Tips:</strong> Crosscheck data di form dengan surat di sebelah kanan.
                                    Pastikan semua data sudah benar sebelum submit.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
