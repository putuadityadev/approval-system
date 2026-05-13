import { useState } from 'react';
import { Link } from '@inertiajs/react';
import Sidebar from '@/Components/shared/Sidebar';

/**
 * SecurityMobileLayout
 *
 * Layout khusus untuk Security yang adaptif:
 * - Desktop: Menggunakan Sidebar dan layout standard web
 * - Mobile: Menggunakan Bottom Navigation
 *
 * Props:
 * - auth: data user login
 * - children: isi halaman
 * - activeTab: tab mana yang aktif ('home', 'history', 'profile')
 */
export default function SecurityMobileLayout({ auth, children, activeTab = 'home' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigationItems = [
        { name: 'Dashboard', href: '/security/dashboard', icon: 'dashboard' },
        { name: 'Scan History', href: '/security/requests', icon: 'history' },
        { name: 'My Profile', href: '/security/profile', icon: 'person' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 lg:bg-gray-100 flex flex-col font-sans antialiased">
            
            {/* Desktop Sidebar */}
            <Sidebar 
                navigationItems={navigationItems}
                sidebarOpen={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
                user={auth.user}
            />

            {/* Mobile Top Header (Hamburger) - Optional, but good for UX if they want to open sidebar on mobile? 
                The user relies on bottom nav for mobile, so we don't strictly need the hamburger. */}
            
            {/* Main Content Area */}
            <div className="flex-1 lg:pl-[280px] flex flex-col relative w-full mx-auto">
                <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
                    <div className="lg:py-6 lg:px-8 h-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Bottom Navigation (Mobile Only) */}
                <nav className="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-1px_2px_0_rgba(0,0,0,0.05)] fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 pb-safe">
                    {/* Home */}
                    <Link
                        href={route('security.dashboard')}
                        className={`flex flex-col items-center justify-center transition-all ${
                            activeTab === 'home' 
                                ? 'bg-cyan-50 text-cyan-600 rounded-lg py-1 px-4 scale-110 duration-300' 
                                : 'text-slate-400 hover:text-cyan-600 py-1 px-4'
                        }`}
                    >
                        <span className="material-symbols-outlined mb-1 text-[24px]" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
                        <span className="font-bold text-[10px] uppercase tracking-widest">Home</span>
                    </Link>

                    {/* History */}
                    <Link
                        href={route('security.requests.index')}
                        className={`flex flex-col items-center justify-center transition-all ${
                            activeTab === 'history' 
                                ? 'bg-cyan-50 text-cyan-600 rounded-lg py-1 px-4 scale-110 duration-300' 
                                : 'text-slate-400 hover:text-cyan-600 py-1 px-4'
                        }`}
                    >
                        <span className="material-symbols-outlined mb-1 text-[24px]" style={{ fontVariationSettings: activeTab === 'history' ? "'FILL' 1" : "'FILL' 0" }}>history</span>
                        <span className="font-bold text-[10px] uppercase tracking-widest">History</span>
                    </Link>

                    {/* Profile */}
                    <Link
                        href={route('security.profile')}
                        className={`flex flex-col items-center justify-center transition-all ${
                            activeTab === 'profile' 
                                ? 'bg-cyan-50 text-cyan-600 rounded-lg py-1 px-4 scale-110 duration-300' 
                                : 'text-slate-400 hover:text-cyan-600 py-1 px-4'
                        }`}
                    >
                        <span className="material-symbols-outlined mb-1 text-[24px]" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
                        <span className="font-bold text-[10px] uppercase tracking-widest">Profile</span>
                    </Link>
                </nav>
            </div>
            
            {/* Styles for hidden scrollbar & safe area */}
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .pb-safe { padding-bottom: env(safe-area-inset-bottom, 16px); }
            `}} />
        </div>
    );
}
