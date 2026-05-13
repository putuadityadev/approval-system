import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import SecurityMobileLayout from '@/Layouts/SecurityMobileLayout';

/**
 * SecurityDashboard
 *
 * Halaman dashboard untuk Security menggunakan mobile-first design.
 *
 * Props:
 * - auth: object — data user yang sedang login
 * - stats: object — statistics { today, total, ready, executed }
 * - recentScans: array — daftar scan terakhir
 */
export default function SecurityDashboard({ auth, stats, recentScans }) {
    const [manualInput, setManualInput] = useState('');

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualInput.trim()) {
            router.post(route('security.scan.by.serial'), {
                document_serial_no: manualInput.trim(),
            });
        }
    };

    return (
        <SecurityMobileLayout auth={auth} activeTab="home">
            {/* Header */}
            <header className="bg-primary shadow-sm z-10 flex justify-between items-center w-full px-6 h-16 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
                    <h1 className="text-white font-extrabold text-[1.25rem] tracking-tight">Security Portal</h1>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 overflow-hidden shrink-0 text-white font-bold">
                    {auth.user.name ? auth.user.name.charAt(0).toUpperCase() : 'S'}
                </div>
            </header>

            {/* Main Action Area Card */}
            <section className="bg-white rounded-b-3xl shadow-sm px-6 py-8 flex flex-col items-center">
                <h2 className="text-xl font-bold text-slate-900 mb-8">Hello, Officer {auth.user.name || auth.user.email.split('@')[0]}</h2>
                
                {/* Primary Action: Massive QR Scan Button */}
                <Link href={route('security.scanner')} className="relative group flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 mb-8">
                    <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(30,141,174,0.5)] transition-all group-hover:shadow-[0_25px_50px_-12px_rgba(30,141,174,0.6)]">
                        <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 0" }}>qr_code_scanner</span>
                    </div>
                    <span className="font-bold text-primary tracking-wide text-sm">Tap to Scan QR</span>
                </Link>

                {/* Divider */}
                <div className="w-full flex items-center gap-4 mb-8">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">OR</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                {/* Manual Entry */}
                <form onSubmit={handleManualSubmit} className="w-full flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MANUAL ENTRY</label>
                    <div className="flex gap-2">
                        <input 
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            className="flex-1 bg-slate-100 border-none rounded-lg text-sm text-slate-900 px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-slate-500/70" 
                            placeholder="Enter REF ID (e.g., 001518)" 
                            type="text" 
                        />
                        <button type="submit" disabled={!manualInput.trim()} className="bg-primary text-white rounded-lg px-4 flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                        </button>
                    </div>
                </form>
            </section>

            {/* Activity Log */}
            <section className="px-6 py-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RECENT SCANS</h3>
                    <Link href={route('security.requests.index')} className="text-xs text-primary font-semibold hover:underline">View All</Link>
                </div>
                
                <div className="flex flex-col gap-3">
                    {recentScans && recentScans.length > 0 ? (
                        recentScans.map((request) => (
                            <Link href={route('security.requests.show', request.id)} key={request.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm border border-transparent hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-slate-500 text-lg">
                                            {request.request_type === 'LOADING_IN' ? 'local_shipping' : 'storefront'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col overflow-hidden max-w-[150px]">
                                        <span className="font-bold text-sm text-slate-900 truncate">{request.vendor?.company_name || 'Vendor'}</span>
                                        <span className="text-xs text-slate-500">{formatTime(request.updated_at)}</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                    request.status === 'EXECUTED' ? 'bg-[#e6f4ea] text-[#137333]' : 
                                    request.status === 'REJECTED' ? 'bg-[#fce8e6] text-[#c5221f]' : 
                                    'bg-amber-100 text-amber-800'
                                }`}>
                                    {request.status === 'EXECUTED' ? 'Verified' : request.status}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-6 text-sm text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                            Belum ada scan terbaru hari ini.
                        </div>
                    )}
                </div>
            </section>
        </SecurityMobileLayout>
    );
}
