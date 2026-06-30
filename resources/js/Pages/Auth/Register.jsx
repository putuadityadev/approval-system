/**
 * Register
 *
 * Halaman registrasi untuk Vendor.
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan form registrasi vendor dengan data perusahaan
 * - Menangani proses registrasi menggunakan Inertia useForm
 * - Menampilkan validation errors
 * - Auto-login dan redirect ke vendor dashboard setelah registrasi berhasil
 *
 * Props:
 * - errors: object
 */

import { useForm, Link, Head } from '@inertiajs/react';
import ValidationErrors from '@/Components/shared/ValidationErrors';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import { useState } from 'react';

function Register({ errors }) {
    const { data, setData, post, processing } = useForm({
        company_name: '',
        pic_name: '',
        pic_phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        address: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConf, setShowPasswordConf] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Register Vendor - Icon Mall Bali" />
            <div className="min-h-screen w-full flex bg-background font-sans text-foreground selection:bg-primary/20">
                
                {/* Left Side: Image Panel */}
                <div className="hidden lg:flex lg:w-[45%] relative bg-zinc-950 overflow-hidden">
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-out hover:scale-110"
                        style={{ backgroundImage: "url('/icon-mall-bg.webp')" }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-end w-full p-12 xl:p-16 text-white pb-20">

                        <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-[1.1] tracking-tight drop-shadow-2xl">
                            Partner with us for<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Digital Approvals</span>
                        </h1>
                        <p className="text-lg text-white/80 max-w-lg font-medium leading-relaxed drop-shadow-md">
                            Register your business entity to submit applications, manage permits, and streamline your operational workflow.
                        </p>
                        
                        <div className="mt-10 space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                                    <span className="material-symbols-outlined text-primary-300" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold tracking-wide">Fast Onboarding</h3>
                                    <p className="text-sm text-white/70 font-medium">Quick and easy registration process.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                                    <span className="material-symbols-outlined text-primary-300" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold tracking-wide">Track Everything</h3>
                                    <p className="text-sm text-white/70 font-medium">Monitor your permits in real-time.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Panel */}
                <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 md:p-12 xl:p-16 relative overflow-y-auto">
                    


                    <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <header className="mb-8">
                            <h2 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Create an Account</h2>
                            <p className="text-muted-foreground text-base font-medium">Register your business entity to get started.</p>
                        </header>

                        <ValidationErrors errors={errors} className="mb-6" />

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Row 1: Company & PIC */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    type="text"
                                    name="company_name"
                                    label="Company Name"
                                    icon="domain"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    required
                                    error={errors.company_name}
                                />
                                <Input
                                    type="text"
                                    name="pic_name"
                                    label="PIC Name"
                                    icon="person"
                                    value={data.pic_name}
                                    onChange={(e) => setData('pic_name', e.target.value)}
                                    placeholder="Full name"
                                    required
                                    error={errors.pic_name}
                                />
                            </div>

                            {/* Row 2: Office Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-bold text-foreground mb-2">
                                    Office Address <span className="text-destructive ml-1">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute top-3.5 left-0 pl-3 flex pointer-events-none transition-colors group-focus-within:text-primary text-muted-foreground">
                                        <span className="material-symbols-outlined text-xl">location_on</span>
                                    </div>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className={`block w-full py-3.5 pl-11 pr-4 rounded-xl text-sm transition-all duration-200 placeholder:text-muted-foreground/60 bg-background text-foreground resize-none border-2 shadow-sm ${errors.address ? 'border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10' : 'border-input hover:border-border focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                                        placeholder="Street name, building, unit number..."
                                        rows="3"
                                        required
                                    ></textarea>
                                </div>
                                {errors.address && (
                                    <p className="mt-1.5 text-sm text-destructive font-semibold">{errors.address}</p>
                                )}
                            </div>

                            {/* Row 3: WhatsApp & Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    type="tel"
                                    name="pic_phone"
                                    label="WhatsApp Number"
                                    icon="call"
                                    value={data.pic_phone}
                                    onChange={(e) => setData('pic_phone', e.target.value)}
                                    placeholder="0812-3456-7890"
                                    required
                                    error={errors.pic_phone}
                                />
                                <Input
                                    type="email"
                                    name="email"
                                    label="Email Address"
                                    icon="mail"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    error={errors.email}
                                />
                            </div>

                            {/* Row 4: Password & Confirm Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    label="Password"
                                    icon="lock"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Min. 8 characters"
                                    required
                                    error={errors.password}
                                    rightElement={
                                        <button 
                                            type="button" 
                                            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none p-1 rounded-md"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <span className="material-symbols-outlined text-xl">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    }
                                />
                                <Input
                                    type={showPasswordConf ? 'text' : 'password'}
                                    name="password_confirmation"
                                    label="Confirm Password"
                                    icon="lock"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Re-type password"
                                    required
                                    error={errors.password_confirmation}
                                    rightElement={
                                        <button 
                                            type="button" 
                                            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none p-1 rounded-md"
                                            onClick={() => setShowPasswordConf(!showPasswordConf)}
                                        >
                                            <span className="material-symbols-outlined text-xl">
                                                {showPasswordConf ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    }
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button 
                                    type="submit" 
                                    variant="primary"
                                    loading={processing}
                                    className="w-full py-4 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
                                >
                                    {processing ? 'Processing...' : 'Create Account'}
                                </Button>
                            </div>
                        </form>
                        
                        <footer className="mt-8 pt-6 border-t border-border/60 text-center">
                            <p className="text-sm font-semibold text-muted-foreground">
                                Already have an account? 
                                <Link href="/login" className="text-primary font-bold hover:underline ml-1.5 transition-colors">Sign In</Link>
                            </p>
                        </footer>
                        
                        {/* Operational Footer */}
                        <div className="mt-12 flex flex-wrap justify-center gap-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
                            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-primary transition-colors">Security</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;
