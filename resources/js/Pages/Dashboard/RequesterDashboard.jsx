import { Head, router } from '@inertiajs/react';

/**
 * RequesterDashboard
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan dashboard utama untuk user dengan role Requester
 * - Menampilkan welcome message dan informasi user
 * - Placeholder untuk fitur-fitur requester yang akan dikembangkan di fase berikutnya
 *
 * Cara kerjanya:
 * 1. Menerima data user dari props auth
 * 2. Menampilkan welcome message dengan nama requester
 * 3. Menampilkan informasi role dan placeholder untuk fitur future
 *
 * Props:
 * - auth: object { user: { id, name, email, role } } — data user yang sedang login
 */
export default function RequesterDashboard({ auth }) {
    /**
     * handleLogout
     * 
     * Fungsi untuk logout user menggunakan Inertia router.
     * Inertia router otomatis handle CSRF token.
     */
    const handleLogout = () => {
        router.post('/logout');
    };
    return (
        <>
            <Head title="Requester Dashboard" />

            <div className="min-h-screen bg-gray-100">
                {/* Header */}
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Requester Dashboard
                        </h1>
                        
                        {/* User Info & Logout */}
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{auth.user.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* Welcome Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-semibold mb-2">
                                Selamat datang, {auth.user.name}! 👋
                            </h2>
                            <p className="text-gray-600">
                                Anda login sebagai <span className="font-semibold text-green-600">Requester</span>.
                                Dashboard ini akan menampilkan fitur-fitur untuk mengajukan dan mengelola surat ijin kerja.
                            </p>
                        </div>
                    </div>

                    {/* Feature Placeholder Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Card 1: Submit Surat Ijin */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="ml-4 text-lg font-semibold text-gray-900">
                                        Submit Surat Ijin
                                    </h3>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Ajukan surat Loading In, Loading Out, atau Ijin Kerja.
                                </p>
                                <div className="mt-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Status Surat */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <h3 className="ml-4 text-lg font-semibold text-gray-900">
                                        Status Surat
                                    </h3>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Lihat status surat yang sudah diajukan (pending, approved, rejected).
                                </p>
                                <div className="mt-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: History Surat */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="ml-4 text-lg font-semibold text-gray-900">
                                        History Surat
                                    </h3>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Lihat riwayat semua surat yang pernah diajukan.
                                </p>
                                <div className="mt-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    disabled
                                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Submit Loading In
                                </button>
                                <button
                                    disabled
                                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Submit Loading Out
                                </button>
                                <button
                                    disabled
                                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Submit Ijin Kerja
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Fase Development
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        Saat ini sistem authentication sudah selesai. Fitur-fitur untuk submit surat ijin, 
                                        upload dokumen, dan tracking status akan dikembangkan di fase berikutnya.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
