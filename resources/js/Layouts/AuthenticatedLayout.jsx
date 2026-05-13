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
import Sidebar from '@/Components/shared/Sidebar';

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
     * Support 7 roles: super_admin, vendor, approver (4 types), security
     */
    const getNavigationItems = () => {
        const role = auth?.user?.role;

        // Jika role tidak ada, return empty array
        if (!role) return [];

        // Super Admin navigation
        if (role === 'super_admin') {
            return [
                { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
                { name: 'User Management', href: '/admin/users', icon: 'group' },
            ];
        }

        // Vendor navigation
        if (role === 'vendor') {
            return [
                { name: 'Dashboard', href: '/vendor/dashboard', icon: 'dashboard' },
                { name: 'My Requests', href: '/vendor/requests', icon: 'list_alt' },
                { name: 'My Documents', href: '/vendor/documents', icon: 'folder_open' },
                { name: 'My Profile', href: '/vendor/profile', icon: 'person' },
            ];
        }

        // Approver navigation (all 4 approver roles)
        if (['approver_dept', 'approver_ops', 'approver_finance', 'approver_gm'].includes(role)) {
            return [
                { name: 'Dashboard', href: '/approver/dashboard', icon: 'dashboard' },
                { name: 'Pending Request', href: '/approver/requests', icon: 'pending_actions' },
                { name: 'Approval History', href: '/approver/history', icon: 'history' },
                { name: 'My Profile', href: '/approver/profile', icon: 'person' },
            ];
        }

        // Security navigation
        if (role === 'security') {
            return [
                { name: 'Dashboard', href: '/security/dashboard', icon: 'dashboard' },
            ];
        }

        // Default: empty navigation
        return [];
    };

    const navigationItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Mobile Header (Only visible on small screens) */}
            <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 w-full z-30 h-16 flex items-center justify-between px-4 shrink-0 fixed top-0">
                <div className="font-extrabold text-slate-900 tracking-tight">Mall Approval</div>
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            {/* Sidebar overlay (mobile only) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Component */}
            <Sidebar 
                navigationItems={navigationItems}
                sidebarOpen={sidebarOpen}
                closeSidebar={closeSidebar}
                user={auth.user}
            />

            {/* Main content */}
            <main className="pt-16 lg:pt-0 lg:pl-[280px] flex-1 flex flex-col">
                <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1">{children}</div>
            </main>
        </div>
    );
}

export default AuthenticatedLayout;
