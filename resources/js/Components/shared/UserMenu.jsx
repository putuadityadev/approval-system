import { router } from '@inertiajs/react';

/**
 * UserMenu
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan nama perusahaan (untuk vendor) atau email di navbar
 * - Menampilkan role dari user
 * - Tombol logout langsung
 *
 * Diupdate untuk sesuai desain Stitch, simpel tanpa dropdown berlebihan.
 */
function UserMenu({ user }) {
    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const getDisplayName = () => {
        if (!user) return '';
        if (user.role === 'vendor' && user.vendor?.company_name) {
            return user.vendor.company_name;
        }
        return user.email;
    };

    const getRoleLabel = () => {
        if (!user || !user.role) return '';

        const roleLabels = {
            super_admin: 'Super Admin',
            vendor: 'Premium Vendor',
            approver_dept: 'Dept Approver',
            approver_ops: 'Ops Approver',
            approver_finance: 'Finance Approver',
            approver_gm: 'GM Approver',
            security: 'Security Guard',
        };

        return roleLabels[user.role] || user.role;
    };

    if (!user) return null;

    return (
        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{getDisplayName()}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{getRoleLabel()}</p>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50/50 hover:bg-red-50 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-100"
                title="Logout"
            >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
            </button>
        </div>
    );
}

export default UserMenu;
