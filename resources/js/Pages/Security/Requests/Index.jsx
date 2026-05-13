import { useState } from 'react';
import { Link } from '@inertiajs/react';
import SecurityMobileLayout from '@/Layouts/SecurityMobileLayout';

/**
 * Security Requests Index (History)
 *
 * Halaman daftar surat yang sudah di-scan oleh security (history).
 * Menggunakan mobile-first design.
 */
export default function RequestsIndex({ auth, requests }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    // Mocks filter logic
    const filters = ['All', 'Verified', 'Denied', 'Pending Exit'];

    // Grouping by date (in this simplified view, we just render them all under 'Today' or simple list)
    
    return (
        <SecurityMobileLayout auth={auth} activeTab="history">
            {/* Header */}
            <header className="bg-primary text-white sticky top-0 z-50 flex items-center justify-center w-full px-6 py-4 shadow-sm h-16 shrink-0">
                <h1 className="font-extrabold tracking-tight text-[20px]">Scan History</h1>
            </header>

            {/* Search & Filters */}
            <section className="sticky top-[64px] z-40 bg-white shadow-sm border-b border-slate-200">
                <div className="px-4 py-3">
                    <div className="relative flex items-center bg-slate-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary transition-all">
                        <span className="material-symbols-outlined text-slate-500 text-[20px] mr-2">search</span>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-slate-900 placeholder:text-slate-500" 
                            placeholder="Search REF ID or Vendor..." 
                            type="text"
                        />
                    </div>
                </div>

                <div className="flex overflow-x-auto hide-scrollbar px-4 pb-3 space-x-2">
                    {filters.map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors shadow-sm ${
                                activeFilter === filter 
                                    ? 'bg-primary text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            {/* Main Content List */}
            <main className="px-4 pt-6 pb-6 space-y-6">
                <div>
                    <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4 pl-1">
                        {requests.data.length > 0 ? 'History' : 'No History'}
                    </h2>
                    
                    <div className="space-y-4">
                        {requests.data.length > 0 ? (
                            requests.data.map(request => (
                                <div key={request.id} className={`bg-white rounded-lg shadow-sm p-4 relative border-l-4 hover:shadow-md transition-all duration-200 ${
                                    request.status === 'EXECUTED' ? 'border-emerald-500' : 
                                    request.status === 'REJECTED' ? 'border-red-500' : 'border-amber-500'
                                }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-medium text-slate-500 flex items-center">
                                            <span className="material-symbols-outlined text-[14px] mr-1">schedule</span> 
                                            {formatTime(request.updated_at)}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${
                                            request.status === 'EXECUTED' ? 'bg-emerald-100 text-emerald-800' : 
                                            request.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {request.status === 'EXECUTED' ? 'Verified' : request.status}
                                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            REF: {request.document_serial_no || request.id.substring(0,6)}
                                        </div>
                                        <h3 className="text-[18px] font-bold text-slate-900 mb-1">
                                            {request.vendor?.company_name || 'Vendor'}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-500">
                                            {request.request_type}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Link href={route('security.requests.show', request.id)} className="text-primary text-xs font-bold flex items-center hover:text-cyan-700 transition-colors">
                                            View Details 
                                            <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-dashed border-slate-200">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">history</span>
                                <p className="text-sm text-slate-500">Belum ada riwayat scan.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Simple View */}
                    {requests.links && requests.links.length > 3 && (
                        <div className="mt-6 flex justify-center gap-2">
                            {requests.links.map((link, idx) => (
                                link.url && (
                                    <Link 
                                        key={idx} 
                                        href={link.url}
                                        className={`px-3 py-1 rounded-md text-xs font-bold shadow-sm ${
                                            link.active ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200'
                                        }`}
                                        dangerouslySetInnerHTML={{__html: link.label}}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </SecurityMobileLayout>
    );
}
