import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * CreateSikmb (Form SIKMB)
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan form submit surat SIKMB (Barang Masuk/Keluar)
 * - Handle dynamic items array (tambah/hapus barang)
 * - Upload foto form fisik (opsional)
 * - Submit data ke backend
 *
 * Cara kerjanya:
 * 1. Menerima data vendor dan requestType dari backend
 * 2. User mengisi form detail SIKMB dan daftar barang
 * 3. User bisa tambah/hapus item barang secara dynamic
 * 4. Submit form ke POST /vendor/requests/sikmb
 * 5. Redirect ke detail page jika berhasil
 *
 * Props:
 * - vendor: objek vendor { id, company_name, pic_name, pic_phone, address }
 * - requestType: string 'LOADING_IN' atau 'LOADING_OUT'
 */
export default function CreateSikmb({ vendor, requestType }) {
    const { data, setData, post, processing, errors } = useForm({
        request_type: requestType,
        sop_form_code: '',
        document_serial_no: '',
        original_form_image: null,
        origin_floor: '',
        origin_unit: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        dest_address: '',
        dest_floor: '',
        dest_phone: '',
        items: [
            { item_name: '', quantity: 1, unit: '', remarks: '' }
        ]
    });

    const [imagePreview, setImagePreview] = useState(null);

    /**
     * handleAddItem
     *
     * Apa yang dilakukan:
     * Menambahkan item barang baru ke array items
     *
     * Langkah-langkah:
     * 1. Copy array items yang ada
     * 2. Push item baru dengan nilai default
     * 3. Update state data.items
     */
    const handleAddItem = () => {
        setData('items', [
            ...data.items,
            { item_name: '', quantity: 1, unit: '', remarks: '' }
        ]);
    };

    /**
     * handleRemoveItem
     *
     * Apa yang dilakukan:
     * Menghapus item barang dari array items
     *
     * Langkah-langkah:
     * 1. Filter array items, exclude item dengan index yang dipilih
     * 2. Update state data.items
     */
    const handleRemoveItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    /**
     * handleItemChange
     *
     * Apa yang dilakukan:
     * Update nilai field tertentu di item tertentu
     *
     * Langkah-langkah:
     * 1. Copy array items
     * 2. Update field yang berubah di index yang sesuai
     * 3. Update state data.items
     */
    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

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
        post('/vendor/requests/sikmb', {
            forceFormData: true, // Required untuk file upload
        });
    };

    const typeLabel = requestType === 'LOADING_IN' ? 'Barang Masuk' : 'Barang Keluar';

    return (
        <>
            <Head title={`Buat Surat ${typeLabel}`} />

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
                            Surat Izin Keluar/Masuk Barang
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Tipe: <span className="font-semibold">{typeLabel}</span>
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

                        {/* Card: Detail Pengiriman */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Detail Pengiriman
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lantai Asal (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.origin_floor}
                                        onChange={(e) => setData('origin_floor', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: GF"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unit Asal (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.origin_unit}
                                        onChange={(e) => setData('origin_unit', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: Unit A-12"
                                    />
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
                                    Alamat Tujuan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.dest_address}
                                    onChange={(e) => setData('dest_address', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Alamat lengkap tujuan pengiriman"
                                    required
                                />
                                {errors.dest_address && (
                                    <p className="mt-1 text-sm text-red-600">{errors.dest_address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lantai Tujuan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.dest_floor}
                                        onChange={(e) => setData('dest_floor', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: 2F"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nomor Telepon Tujuan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.dest_phone}
                                        onChange={(e) => setData('dest_phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: 081234567890"
                                        required
                                    />
                                    {errors.dest_phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.dest_phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Card: Daftar Barang */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Daftar Barang
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                >
                                    + Tambah Barang
                                </button>
                            </div>

                            {errors.items && (
                                <p className="mb-4 text-sm text-red-600">{errors.items}</p>
                            )}

                            <div className="space-y-4">
                                {data.items.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-md p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-sm font-medium text-gray-700">
                                                Barang #{index + 1}
                                            </h3>
                                            {data.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nama Barang <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.item_name}
                                                    onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Contoh: Meja Kayu"
                                                    required
                                                />
                                                {errors[`items.${index}.item_name`] && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors[`items.${index}.item_name`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Jumlah <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                                {errors[`items.${index}.quantity`] && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors[`items.${index}.quantity`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Satuan <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.unit}
                                                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Contoh: unit, pcs, box"
                                                    required
                                                />
                                                {errors[`items.${index}.unit`] && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors[`items.${index}.unit`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Keterangan (Opsional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.remarks}
                                                    onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Keterangan tambahan"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
