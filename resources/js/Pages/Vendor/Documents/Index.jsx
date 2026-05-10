import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function DocumentIndex({ auth }) {
    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="My Documents" />

            <div className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 py-6 flex flex-col min-h-0">
                {/* Content Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Documents</h2>
                        <p className="text-slate-600 font-medium text-sm mt-1">Kelola dokumen kontrak dan asuransi Anda (Segera Hadir).</p>
                    </div>
                </div>

                {/* Quick Stats / Filters Bento Row */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                    {/* Total Documents Stat */}
                    <div className="col-span-12 md:col-span-4 bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">description</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total Dokumen</p>
                            <p className="text-3xl font-black text-slate-900">0</p>
                        </div>
                    </div>

                    {/* Verification Status Stat */}
                    <div className="col-span-12 md:col-span-8 bg-teal-900 p-6 rounded-xl relative overflow-hidden flex items-center justify-between shadow-sm">
                        <div className="relative z-10">
                            <h4 className="text-white font-bold text-lg mb-1">Status Verifikasi</h4>
                            <p className="text-teal-200 text-sm font-medium">Fitur pengecekan status dokumen belum aktif.</p>
                            <div className="mt-4 h-2 w-64 bg-teal-800 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-400 w-[0%]"></div>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <span className="material-symbols-outlined text-[120px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="bg-card rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-16 transition-all text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl">folder_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Dokumen</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Fitur manajemen dokumen terpusat sedang dalam pengembangan. Saat ini, semua dokumen dilampirkan langsung pada masing-masing pengajuan.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
