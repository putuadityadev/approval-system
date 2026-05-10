import { Link, usePage, router } from '@inertiajs/react';

export default function Sidebar({ navigationItems, sidebarOpen, closeSidebar, user }) {
    const { url } = usePage();

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

    const getTitle = () => {
        return user?.role === 'vendor' ? 'Vendor Dashboard' : 'Approval System';
    };

    return (
        <aside
            className={`
                fixed top-0 left-0 z-50 h-screen w-[280px] bg-white border-r border-slate-200
                flex flex-col transform transition-transform duration-300 ease-in-out shrink-0 shadow-sm
                lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            {/* Top Section: Title & Logo */}
            <div className="p-6 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-white text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none truncate">{getTitle()}</h1>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">Management Portal</p>
                    </div>
                    {/* Mobile Close Button */}
                    <button 
                        onClick={closeSidebar}
                        className="lg:hidden ml-auto text-slate-400 hover:text-slate-600 focus:outline-none bg-slate-50 p-1 rounded-md"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>

            {/* Middle Section: Navigation */}
            <div className="flex-1 py-5 flex flex-col gap-1 overflow-y-auto px-4">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
                {navigationItems.map((item) => {
                    const isActive = url === item.href || (item.href !== '/' && url.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={closeSidebar}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 
                                text-sm tracking-tight font-medium
                                ${isActive 
                                    ? 'text-primary bg-primary/10 font-bold' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                            `}
                        >
                            <span 
                                className={`flex items-center justify-center ${isActive ? 'text-primary' : 'text-slate-400'} material-symbols-outlined`}
                                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {item.icon}
                            </span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Section: Account & Logout */}
            {user && (
                <div className="p-4 border-t border-slate-200 flex-shrink-0 bg-slate-50/50">
                    <div className="flex flex-col gap-4">
                        {/* User Profile Block */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary font-bold shrink-0 shadow-sm">
                                {getDisplayName().charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-bold text-slate-900 truncate">{getDisplayName()}</p>
                                <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-100 shadow-sm group"
                        >
                            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-red-500 transition-colors">logout</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
