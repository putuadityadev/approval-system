import { Link, useForm, router } from '@inertiajs/react';
import SecurityMobileLayout from '@/Layouts/SecurityMobileLayout';

/**
 * Security Profile
 *
 * Halaman profil untuk Security. 
 * Memiliki fitur update password dan logout.
 */
export default function Profile({ auth, user }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        post(route('security.profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <SecurityMobileLayout auth={auth} activeTab="profile">
            {/* Header */}
            <header className="sticky top-0 w-full z-50 bg-primary text-white shadow-md border-none flex justify-between items-center px-4 h-16 lg:rounded-t-xl lg:mt-0">
                <button className="scale-95 active:scale-90 transition-transform flex items-center hover:bg-white/10 p-2 rounded-full">
                    <span className="material-symbols-outlined font-black">shield</span>
                </button>
                <h1 className="font-black uppercase tracking-tight text-lg">My Profile</h1>
                <button className="scale-95 active:scale-90 transition-transform flex items-center hover:bg-white/10 p-2 rounded-full">
                    <span className="material-symbols-outlined font-black">account_circle</span>
                </button>
            </header>

            <div className="pt-8 px-4 w-full">
                <div className="relative w-full mx-auto lg:max-w-4xl pb-10">
                    <div className="absolute inset-x-0 top-0 h-16 bg-primary rounded-b-3xl -mx-4 -mt-8 -z-10"></div>
                    
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-[0_2px_10px_0_rgba(0,0,0,0.05)] border border-slate-100 p-6 flex flex-col items-center relative mb-8">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center relative -mt-12 mb-3">
                            <span className="material-symbols-outlined text-5xl text-slate-400">person</span>
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{auth.user.name || 'Security'}</h2>
                        <div className="mt-2 flex items-center justify-center gap-1.5 bg-cyan-50 px-3 py-1 rounded-full text-cyan-700">
                            <span className="material-symbols-outlined text-[14px]">badge</span>
                            <span className="text-xs font-black uppercase tracking-widest">{auth.user.email}</span>
                        </div>
                    </div>

                    {/* Form Update Password */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Update Password</h3>
                        </div>

                        <div className="bg-white rounded-xl shadow-[0_2px_10px_0_rgba(0,0,0,0.05)] border border-slate-100 p-5">
                            <form onSubmit={updatePassword} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Current Password</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none" 
                                        placeholder="••••••••" 
                                        type="password" 
                                        value={data.current_password}
                                        onChange={e => setData('current_password', e.target.value)}
                                    />
                                    {errors.current_password && <p className="text-xs text-red-600 mt-1 font-medium">{errors.current_password}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none" 
                                        placeholder="Enter new password" 
                                        type="password" 
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                    />
                                    {errors.password && <p className="text-xs text-red-600 mt-1 font-medium">{errors.password}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Confirm New Password</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none" 
                                        placeholder="Confirm new password" 
                                        type="password" 
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                    />
                                </div>
                                
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-5 rounded-lg shadow-sm transition-all text-sm flex justify-center items-center gap-2 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">key</span>
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Logout Section */}
                    <div>
                        <button 
                            onClick={handleLogout}
                            className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl py-3.5 font-bold flex justify-center items-center gap-2 transition-all active:scale-95 shadow-sm"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </SecurityMobileLayout>
    );
}
