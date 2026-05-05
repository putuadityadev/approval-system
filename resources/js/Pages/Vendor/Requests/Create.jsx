import { Head, Link } from '@inertiajs/react';

/**
 * Create (Pilih Tipe Surat)
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan pilihan tipe surat (SIKMB atau SIK)
 * - Redirect ke form yang sesuai berdasarkan pilihan user
 *
 * Cara kerjanya:
 * 1. Menerima data vendor dari backend
 * 2. Menampilkan 3 card pilihan: SIKMB Barang Masuk, SIKMB Barang Keluar, SIK
 * 3. Setiap card adalah link ke form yang sesuai
 *
 * Props:
 * - vendor: objek vendor { id, company_name, pic_name, pic_phone, address }
 */
export default function Create({ vendor }) {
    return (
        <>
            <Head title="Buat Surat Baru" />

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
                        <h1 className="text-3xl font-bold text-gray-900">
                            Buat Surat Baru
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Pilih jenis surat yang ingin Anda ajukan
                        </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* SIKMB Barang Masuk */}
                        <Link
                            href="/vendor/requests/create/sikmb?type=LOADING_IN"
                            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-blue-500"
                        >
                            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-4">
                                <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Barang Masuk
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Surat Izin Keluar/Masuk Barang (SIKMB) untuk barang yang masuk ke mall
                            </p>
                            <div className="mt-4 text-blue-600 text-sm font-medium">
                                Pilih →
                            </div>
                        </Link>

                        {/* SIKMB Barang Keluar */}
                        <Link
                            href="/vendor/requests/create/sikmb?type=LOADING_OUT"
                            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-green-500"
                        >
                            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Barang Keluar
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Surat Izin Keluar/Masuk Barang (SIKMB) untuk barang yang keluar dari mall
                            </p>
                            <div className="mt-4 text-green-600 text-sm font-medium">
                                Pilih →
                            </div>
                        </Link>

                        {/* SIK */}
                        <Link
                            href="/vendor/requests/create/sik"
                            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-purple-500"
                        >
                            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg mb-4">
                                <svg
                                    className="w-8 h-8 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Izin Kerja
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Surat Izin Kerja (SIK) untuk pekerjaan yang dilakukan di area mall
                            </p>
                            <div className="mt-4 text-purple-600 text-sm font-medium">
                                Pilih →
                            </div>
                        </Link>
                    </div>

                    {/* Info Box */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-blue-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Informasi
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            Pastikan data yang Anda isi sudah benar sebelum submit
                                        </li>
                                        <li>
                                            Surat yang sudah disubmit akan masuk ke proses approval
                                        </li>
                                        <li>
                                            Anda bisa membatalkan surat yang masih dalam proses approval
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
