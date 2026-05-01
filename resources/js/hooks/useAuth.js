import { usePage, router } from '@inertiajs/react';

/**
 * useAuth
 *
 * Custom hook untuk mengelola authentication state dan helper functions.
 *
 * Fungsi hook ini:
 * - Mengambil data user yang sedang login dari Inertia shared props
 * - Menyediakan helper functions untuk check role user
 * - Menyediakan fungsi logout yang mudah digunakan
 *
 * Cara kerjanya:
 * 1. Ambil data auth dari usePage().props.auth (shared props dari HandleInertiaRequests)
 * 2. Sediakan helper isAdmin() dan isRequester() untuk check role
 * 3. Sediakan fungsi logout() untuk redirect ke route logout
 *
 * Return:
 * - user: object user yang sedang login (null jika guest) — { id, name, email, role }
 * - isAdmin: boolean — true jika user adalah admin
 * - isRequester: boolean — true jika user adalah requester
 * - logout: function — fungsi untuk logout user
 */
export default function useAuth() {
    const { auth } = usePage().props;
    const user = auth?.user || null;

    /**
     * Check apakah user adalah admin
     */
    const isAdmin = user?.role === 'admin';

    /**
     * Check apakah user adalah requester
     */
    const isRequester = user?.role === 'requester';

    /**
     * Logout user
     * 
     * Cara kerjanya:
     * 1. Kirim POST request ke route /logout menggunakan Inertia router
     * 2. Laravel akan handle logout dan redirect ke halaman login
     */
    const logout = () => {
        router.post('/logout');
    };

    return {
        user,
        isAdmin,
        isRequester,
        logout,
    };
}
