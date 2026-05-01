/**
 * GuestLayout
 *
 * Layout untuk halaman authentication (login, register, forgot password, reset password).
 *
 * Komponen ini digunakan untuk:
 * - Membungkus semua halaman authentication dengan struktur yang konsisten
 * - Menampilkan centered card dengan logo, form area, dan footer links
 * - Memberikan styling yang clean, minimal, dan responsive
 *
 * Cara kerjanya:
 * 1. Menerima children (form content) dari halaman authentication
 * 2. Membungkus children dalam centered card container
 * 3. Menampilkan logo aplikasi di bagian atas
 * 4. Menampilkan footer dengan copyright dan links
 * 5. Responsive untuk mobile dan desktop
 *
 * Props:
 * - children: ReactNode (required) — konten form yang akan ditampilkan di dalam card
 *
 * Requirements: 11.5, 11.10
 */

import { Link } from '@inertiajs/react';

function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Main container */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo section */}
                <div className="flex justify-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg
                                className="h-8 w-8 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                            Mall Approval
                        </span>
                    </Link>
                </div>

                {/* Card container */}
                <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
                    {children}
                </div>

                {/* Footer links */}
                <div className="mt-6">
                    <div className="text-center text-sm text-gray-600">
                        <p className="mb-2">
                            © {new Date().getFullYear()} Mall Approval System
                        </p>
                        <div className="flex justify-center space-x-4">
                            <a
                                href="#"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Bantuan
                            </a>
                            <span className="text-gray-400">•</span>
                            <a
                                href="#"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Kebijakan Privasi
                            </a>
                            <span className="text-gray-400">•</span>
                            <a
                                href="#"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Syarat & Ketentuan
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GuestLayout;
