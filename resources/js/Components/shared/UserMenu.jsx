/**
 * UserMenu
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan dropdown menu user di navbar
 * - Menampilkan nama user dan role (Admin/Requester)
 * - Menu items: Profile, Settings, Logout
 * - Toggle dropdown saat diklik
 *
 * Cara kerjanya:
 * 1. Menerima user object dari props (berisi name dan role)
 * 2. Menggunakan state untuk kontrol open/close dropdown
 * 3. Menampilkan avatar/initial user dan nama + role
 * 4. Saat diklik, toggle dropdown menu dengan animasi
 * 5. Menu items: Profile, Settings, Logout (dengan icon)
 * 6. Close dropdown saat klik di luar menu (click outside handler)
 *
 * Props:
 * - user: object (required) — user object dengan properties: name (string), role (string)
 * - className: string — class tambahan untuk custom styling
 *
 * Requirements: 7.9
 */

import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';

function UserMenu({ user, className = '' }) {
    // State untuk kontrol dropdown visibility
    const [isOpen, setIsOpen] = useState(false);

    // Ref untuk detect click outside
    const menuRef = useRef(null);

    /**
     * toggleDropdown
     *
     * Toggle state dropdown antara open dan close.
     */
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    /**
     * closeDropdown
     *
     * Close dropdown menu.
     */
    const closeDropdown = () => {
        setIsOpen(false);
    };

    /**
     * handleLogout
     *
     * Menangani logout user.
     * Memanggil POST ke /logout menggunakan Inertia router.
     */
    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    /**
     * getUserInitial
     *
     * Mengambil initial dari email user (huruf pertama sebelum @).
     * Digunakan untuk avatar placeholder.
     */
    const getUserInitial = () => {
        if (!user || !user.email) return '?';
        return user.email.charAt(0).toUpperCase();
    };

    /**
     * getRoleLabel
     *
     * Mengubah role menjadi label yang lebih readable.
     */
    const getRoleLabel = () => {
        if (!user || !user.role) return '';

        const roleLabels = {
            super_admin: 'Super Admin',
            vendor: 'Vendor',
            approver_dept: 'Approver Dept',
            approver_ops: 'Approver Ops',
            approver_finance: 'Approver Finance',
            approver_gm: 'Approver GM',
            security: 'Security',
        };

        return roleLabels[user.role] || user.role;
    };

    /**
     * useEffect untuk handle click outside
     *
     * Close dropdown saat user klik di luar menu.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        // Add event listener saat dropdown open
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Jika tidak ada user, jangan render apa-apa
    if (!user) {
        return null;
    }

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            {/* Dropdown trigger button */}
            <button
                type="button"
                onClick={toggleDropdown}
                className="
                    flex items-center space-x-3 px-3 py-2 rounded-lg
                    hover:bg-gray-100 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {/* Avatar dengan initial */}
                <div className="flex-shrink-0">
                    <div
                        className="
                            h-10 w-10 rounded-full bg-blue-600 text-white
                            flex items-center justify-center font-semibold text-sm
                        "
                    >
                        {getUserInitial()}
                    </div>
                </div>

                {/* User info */}
                <div className="flex-1 text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                        {user.email}
                    </p>
                    <p className="text-xs text-gray-500">{getRoleLabel()}</p>
                </div>

                {/* Chevron icon */}
                <svg
                    className={`
                        h-5 w-5 text-gray-400 transition-transform duration-200
                        ${isOpen ? 'rotate-180' : 'rotate-0'}
                    `}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div
                    className="
                        absolute right-0 mt-2 w-56 rounded-lg shadow-lg
                        bg-white ring-1 ring-black ring-opacity-5
                        divide-y divide-gray-100
                        z-50
                        animate-in fade-in slide-in-from-top-2 duration-200
                    "
                    role="menu"
                    aria-orientation="vertical"
                >
                    {/* User info section (mobile only) */}
                    <div className="px-4 py-3 md:hidden">
                        <p className="text-sm font-medium text-gray-900">
                            {user.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {getRoleLabel()}
                        </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        {/* Profile */}
                        <Link
                            href="/profile"
                            className="
                                flex items-center px-4 py-2 text-sm text-gray-700
                                hover:bg-gray-100 transition-colors duration-150
                            "
                            role="menuitem"
                            onClick={closeDropdown}
                        >
                            <svg
                                className="mr-3 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                            </svg>
                            Profile
                        </Link>

                        {/* Settings */}
                        <Link
                            href="/settings"
                            className="
                                flex items-center px-4 py-2 text-sm text-gray-700
                                hover:bg-gray-100 transition-colors duration-150
                            "
                            role="menuitem"
                            onClick={closeDropdown}
                        >
                            <svg
                                className="mr-3 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Settings
                        </Link>
                    </div>

                    {/* Logout section */}
                    <div className="py-1">
                        <button
                            onClick={handleLogout}
                            className="
                                flex items-center w-full px-4 py-2 text-sm text-red-700
                                hover:bg-red-50 transition-colors duration-150
                            "
                            role="menuitem"
                        >
                            <svg
                                className="mr-3 h-5 w-5 text-red-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                                    clipRule="evenodd"
                                />
                                <path
                                    fillRule="evenodd"
                                    d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserMenu;
