/**
 * Admin Dashboard
 *
 * Halaman dashboard untuk Super Admin.
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan dashboard Super Admin dengan menu user management
 * - Menampilkan informasi user yang sedang login
 * - Menyediakan navigasi ke halaman user management
 *
 * Cara kerjanya:
 * 1. Menerima data user dari props auth
 * 2. Menampilkan welcome message dengan nama user
 * 3. Menampilkan menu untuk manage users
 * 4. Menyediakan tombol logout
 *
 * Props:
 * - auth: object — data user yang sedang login { user: {...} }
 */

import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';

function AdminDashboard({ auth }) {
    /**
     * handleLogout
     *
     * Menangani proses logout user.
     * Menggunakan Inertia router untuk POST ke /logout.
     */
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Welcome section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Dashboard Super Adminz
                            </h2>
                            <p className="text-gray-600">
                                Selamat datang, <span className="font-semibold">{auth.user.email}</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* User Management Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            User Management
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Kelola semua user dalam sistem (Vendor, Approver, Security)
                                </p>
                                <Link href="/admin/users">
                                    <Button variant="primary" className="w-full">
                                        Kelola Users
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Placeholder for future features */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0 bg-gray-300 rounded-md p-3">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Laporan
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Lihat laporan dan statistik sistem (Coming Soon)
                                </p>
                                <Button variant="secondary" className="w-full" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0 bg-gray-300 rounded-md p-3">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Pengaturan
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Konfigurasi sistem dan pengaturan (Coming Soon)
                                </p>
                                <Button variant="secondary" className="w-full" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Logout button */}
                    <div className="mt-6">
                        <Button variant="danger" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default AdminDashboard;
