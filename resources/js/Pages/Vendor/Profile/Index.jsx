import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ProfileIndex({ auth, user }) {
    const vendor = user.vendor;
    
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        post(route('vendor.profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="My Profile" />

            <div className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 py-6 flex flex-col min-h-0">
                {/* Page Header */}
                <div className="mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">My Profile</h2>
                    <p className="text-sm text-slate-600 font-medium">Manage your company details and account security.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                    {/* Card 1: Company Information (Read Only) */}
                    <div className="bg-card rounded-lg shadow-sm border border-border flex flex-col min-h-0 overflow-hidden">
                        <div className="p-5 border-b border-border bg-muted/30 flex-shrink-0">
                            <h3 className="text-lg font-bold text-card-foreground">Company Information</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Data ini digunakan untuk pengajuan surat (Read-only).</p>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Company Name</label>
                                    <input disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none cursor-not-allowed" type="text" value={vendor?.company_name || '-'} />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Company Address</label>
                                    <textarea disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none resize-none cursor-not-allowed" rows="3" value={vendor?.company_address || '-'} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">PIC Name</label>
                                    <input disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none cursor-not-allowed" type="text" value={vendor?.pic_name || '-'} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">PIC Phone</label>
                                    <input disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none cursor-not-allowed" type="text" value={vendor?.pic_phone || '-'} />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">PIC Email</label>
                                    <input disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none cursor-not-allowed" type="text" value={vendor?.pic_email || '-'} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Account Credentials */}
                    <div className="bg-card rounded-lg shadow-sm border border-border flex flex-col min-h-0 overflow-hidden">
                        <div className="p-5 border-b border-border bg-muted/30 flex-shrink-0">
                            <h3 className="text-lg font-bold text-card-foreground">Account Credentials</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Manage your login details.</p>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1">
                            <form onSubmit={updatePassword} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Login Email</label>
                                    <div className="relative">
                                        <input disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed outline-none pl-9" type="email" value={user.email} />
                                        <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">lock</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">Email address cannot be changed directly.</p>
                                </div>

                                <hr className="border-slate-100 my-4" />

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Current Password</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none" 
                                        placeholder="••••••••" 
                                        type="password" 
                                        value={data.current_password}
                                        onChange={e => setData('current_password', e.target.value)}
                                    />
                                    {errors.current_password && <p className="text-sm text-red-600 mt-1">{errors.current_password}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none" 
                                        placeholder="Enter new password" 
                                        type="password" 
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                    />
                                    {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Confirm New Password</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none" 
                                        placeholder="Confirm new password" 
                                        type="password" 
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                    />
                                </div>
                                
                                <div className="pt-4 flex justify-end flex-shrink-0">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2 px-5 rounded-lg shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">key</span>
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
