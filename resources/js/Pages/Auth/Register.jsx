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
            <Head title="Register Vendor" />
            <div className="min-h-screen flex items-stretch font-sans antialiased bg-background text-foreground selection:bg-primary/20">
                {/* Left Side: Teal Panel */}
                <section className="hidden lg:flex w-5/12 bg-primary relative overflow-hidden flex-col justify-between p-12 text-primary-foreground">
                    {/* Abstract Background Texture */}
                    <div 
                        className="absolute inset-0 opacity-10 bg-cover bg-center" 
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-gZINpkayiPS-AK0ODgY2b2YIhWe-wTK4ch4wkt2Bis1UQSqAaa21-gdhSAN-UKptBSsUMD8mBfqYCJvVc01BcfWVqVLuKTr2RoNe8IbFoZEzKWBB7Hop4Z3INiPMOqbmJ6B0M2T16PE59K4YCb0CS9W469HqEu6mzWegMmS6vEFjigqgEFyzhycZ8ZvZrJ6lPCSvPfTd_7fYBZI0laVxfop2cE9PAtBekTL-WolGa9OxePSo5n7OiH7mHzIEWOlNqNd4dHVfQvc')" }}
                    ></div>
                    
                    {/* Branding */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-20">
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded flex items-center justify-center">
                                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
                            </div>
                            <span className="text-xl font-black tracking-tight uppercase">Mall Management</span>
                        </div>
                        <div className="max-w-md">
                            <h1 className="text-5xl font-black mb-6 leading-tight tracking-tighter">Digital Approval System</h1>
                            <p className="text-lg font-medium text-white/80 mb-12 leading-relaxed">
                                Streamline your mall operations with our enterprise-grade approval workflow. Secure, fast, and transparent.
                            </p>
                            
                            {/* Bullet Points */}
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="mt-1 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Instant Approvals</h3>
                                        <p className="text-sm text-white/70">Reduce turnaround time for maintenance and vendor requests.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Real-time Tracking</h3>
                                        <p className="text-sm text-white/70">Monitor the status of every request in your dashboard.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Side: Form Card Content */}
                <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 overflow-y-auto">
                    <div className="w-full max-w-xl">
                        {/* Mobile Branding */}
                        <div className="lg:hidden flex items-center gap-2 mb-10">
                            <span className="text-primary material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
                            <span className="text-xl font-black tracking-tight text-primary uppercase">Mall Management</span>
                        </div>
                        
                        <div className="bg-card p-8 md:p-12 rounded-2xl shadow-sm border border-border">
                            <header className="mb-8">
                                <h2 className="text-3xl font-extrabold text-foreground mb-2">Create an Account</h2>
                                <p className="text-muted-foreground font-medium">Please fill in your details to register your business entity.</p>
                            </header>

                            <ValidationErrors errors={errors} className="mb-6" />

                            <form onSubmit={handleSubmit} className="space-y-5">
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
                                    <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Office Address <span className="text-destructive ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-0 pl-3 flex pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-xl">location_on</span>
                                        </div>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className={`block w-full py-3 pl-10 pr-3 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-400 bg-background dark:bg-slate-800 text-foreground resize-none border ${errors.address ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                            placeholder="Street name, building, unit number..."
                                            rows="3"
                                            required
                                        ></textarea>
                                    </div>
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-destructive font-medium">{errors.address}</p>
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
                                                className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
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
                                                className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
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
                                        className="w-full"
                                    >
                                        {processing ? 'Processing...' : 'Create Account'}
                                    </Button>
                                </div>
                            </form>
                            
                            <footer className="mt-8 text-center">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Already have an account? 
                                    <Link href="/login" className="text-primary font-bold hover:underline ml-1 transition-colors">Sign In</Link>
                                </p>
                            </footer>
                        </div>
                        
                        {/* Operational Footer */}
                        <div className="mt-12 pb-8 flex flex-wrap justify-center gap-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-primary transition-colors">Compliance</a>
                            <a href="#" className="hover:text-primary transition-colors">Security</a>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default Register;
