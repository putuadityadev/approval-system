/**
 * AuthenticatedLayout
 *
 * Layout untuk halaman setelah login (dashboard dan halaman protected lainnya).
 *
 * Komponen ini digunakan untuk:
 * - Membungkus semua halaman setelah user login dengan struktur yang konsisten
 * - Menampilkan navbar dengan UserMenu dan logout button
 * - Menampilkan sidebar navigation (collapsible di mobile)
 * - Menampilkan main content area untuk children
 *
 * Cara kerjanya:
 * 1. Menerima auth object (user data) dan children dari halaman
 * 2. Menampilkan navbar di bagian atas dengan logo dan UserMenu
 * 3. Menampilkan sidebar navigation di sebelah kiri (collapsible di mobile)
 * 4. Menampilkan main content area di sebelah kanan
 * 5. Responsive: sidebar collapse menjadi hamburger menu di mobile
 *
 * Props:
 * - auth: object (required) — object berisi user data { user: { id, name, email, role } }
 * - children: ReactNode (required) — konten halaman yang akan ditampilkan di main area
 *
 * Requirements: 11.6, 11.10
 */

import { useState } from 'react';
import { Link } from '@inertiajs/react';
import UserMenu from '@/Components/shared/UserMenu';

function AuthenticatedLayout({ auth, children }) {
    // State untuk kontrol sidebar visibility di mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);

    /**
     * toggleSidebar
     *
     * Toggle sidebar visibility di mobile.
     */
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    /**
     * closeSidebar
     *
     * Close sidebar (digunakan saat user klik menu item di mobile).
     */
    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    /**
     * getNavigationItems
     *
     * Return array of navigation items berdasarkan role user.
     * Admin dan Requester punya menu yang berbeda.
     */
    const getNavigationItems = () => {
        const isAdmin = auth.user.role === 'admin';

        if (isAdmin) {
            return [
                {
                    name: 'Dashboard',
                    href: '/admin/dashboard',
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                    ),
                },
                {
                    name: 'Surat Masuk',
                    href: '/admin/requests',
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    ),
                },
            ];
        } else {
            // Requester menu
            return [
                {
                    name: 'Dashboard',
                    href: '/requester/dashboard',
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                    ),
                },
                {
                    name: 'Ajukan Surat',
                    href: '/requester/requests/create',
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    ),
                },
                {
                    name: 'Riwayat Surat',
                    href: '/requester/requests',
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    ),
                },
            ];
        }
    };

    const navigationItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full z-30 top-0">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Left side: Logo + Hamburger */}
                        <div className="flex items-center">
                            {/* Hamburger button (mobile only) */}
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                className="
                                    inline-flex items-center justify-center p-2 rounded-md
                                    text-gray-400 hover:text-gray-500 hover:bg-gray-100
                                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                                    lg:hidden
                                "
                                aria-expanded={sidebarOpen}
                            >
                                <span className="sr-only">Open sidebar</span>
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>

                            {/* Logo */}
                            <Link
                                href="/"
                                className="flex items-center space-x-2 ml-4 lg:ml-0"
                            >
                                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="h-5 w-5 text-white"
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
                                <span className="text-lg font-semibold text-gray-900 hidden sm:block">
                                    Mall Approval
                                </span>
                            </Link>
                        </div>

                        {/* Right side: UserMenu */}
                        <div className="flex items-center">
                            <UserMenu user={auth.user} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar overlay (mobile only) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-16 left-0 z-20 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <nav className="h-full overflow-y-auto py-4 px-3">
                    <ul className="space-y-1">
                        {navigationItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={closeSidebar}
                                    className="
                                        flex items-center space-x-3 px-3 py-2 rounded-lg
                                        text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                        transition-colors duration-150
                                        group
                                    "
                                >
                                    <span className="text-gray-400 group-hover:text-blue-600">
                                        {item.icon}
                                    </span>
                                    <span className="font-medium">
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main content */}
            <main className="pt-16 lg:pl-64">
                <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
        </div>
    );
}

export default AuthenticatedLayout;
