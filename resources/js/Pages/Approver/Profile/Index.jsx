import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Button from '@/Components/ui/Button';

export default function ProfileIndex({ auth, user }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        post(route('approver.profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    /**
     * getRoleLabel
     */
    const getRoleLabel = (role) => {
        const labels = {
            'approver_dept': 'Department Head',
            'approver_ops': 'Operations Manager',
            'approver_finance': 'Finance Manager',
            'approver_gm': 'General Manager',
        };
        return labels[role] || role;
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="My Profile" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-[30px] font-extrabold text-foreground tracking-tight">My Profile</h2>
                            <p className="text-[14px] font-medium text-muted-foreground mt-1">
                                Manage your account credentials and role information.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Card 1: Role Information (Read Only) */}
                        <div className="bg-card rounded-lg shadow-sm border border-border flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-border bg-card">
                                <h3 className="text-[18px] font-bold text-card-foreground">Role Information</h3>
                                <p className="text-[12px] text-muted-foreground font-medium mt-1">Status dan hak akses akun Anda.</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Role</label>
                                        <div className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 flex items-center justify-between text-[14px] font-bold text-foreground cursor-not-allowed">
                                            <span>{getRoleLabel(user.role)}</span>
                                            <span className="material-symbols-outlined text-muted-foreground text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>badge</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Account Status</label>
                                        <div className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 flex items-center justify-between text-[14px] font-bold text-foreground cursor-not-allowed">
                                            <span className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${user.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Account Credentials */}
                        <div className="bg-card rounded-lg shadow-sm border border-border flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-border bg-card">
                                <h3 className="text-[18px] font-bold text-card-foreground">Account Credentials</h3>
                                <p className="text-[12px] text-muted-foreground font-medium mt-1">Manage your login details.</p>
                            </div>
                            <div className="p-6">
                                <form onSubmit={updatePassword} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Login Email</label>
                                        <div className="relative">
                                            <input disabled className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-[14px] font-bold text-muted-foreground cursor-not-allowed outline-none pl-10" type="email" value={user.email} />
                                            <span className="material-symbols-outlined absolute left-3 top-[11px] text-muted-foreground text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-muted-foreground mt-2">Email address cannot be changed directly.</p>
                                    </div>

                                    <hr className="border-border my-6" />

                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Password</label>
                                        <input 
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[14px] font-medium text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                                            placeholder="••••••••" 
                                            type="password" 
                                            value={data.current_password}
                                            onChange={e => setData('current_password', e.target.value)}
                                        />
                                        {errors.current_password && <p className="text-[12px] font-medium text-red-600 mt-2">{errors.current_password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                                        <input 
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[14px] font-medium text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                                            placeholder="Enter new password" 
                                            type="password" 
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                        />
                                        {errors.password && <p className="text-[12px] font-medium text-red-600 mt-2">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Confirm New Password</label>
                                        <input 
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[14px] font-medium text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                                            placeholder="Confirm new password" 
                                            type="password" 
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="pt-2 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={processing}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all text-[13px] flex items-center gap-2 disabled:opacity-50"
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
            </div>
        </AuthenticatedLayout>
    );
}
