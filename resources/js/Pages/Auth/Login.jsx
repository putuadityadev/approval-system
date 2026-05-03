/**
 * Login
 *
 * Halaman login untuk Admin dan Requester.
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan form login dengan field email, password, dan remember me
 * - Menangani proses login menggunakan Inertia useForm
 * - Menampilkan validation errors dan flash messages
 * - Redirect ke dashboard sesuai role setelah login berhasil
 *
 * Props:
 * - errors: object
 * - status: string
 */

import { useForm, Link, Head } from '@inertiajs/react';
import ValidationErrors from '@/Components/shared/ValidationErrors';
import Alert from '@/Components/ui/Alert';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import { useState } from 'react';

function Login({ errors, status }) {
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login" />
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background font-sans text-foreground selection:bg-primary/20">
                <div className="flex h-full grow flex-col">

                    {/* Main Content */}
                    <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
                        <div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
                            {/* Left Panel */}
                            <div className="hidden md:flex relative bg-primary p-12 text-primary-foreground flex-col justify-between">
                                <div 
                                    className="absolute inset-0 opacity-10 bg-cover bg-center" 
                                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-gZINpkayiPS-AK0ODgY2b2YIhWe-wTK4ch4wkt2Bis1UQSqAaa21-gdhSAN-UKptBSsUMD8mBfqYCJvVc01BcfWVqVLuKTr2RoNe8IbFoZEzKWBB7Hop4Z3INiPMOqbmJ6B0M2T16PE59K4YCb0CS9W469HqEu6mzWegMmS6vEFjigqgEFyzhycZ8ZvZrJ6lPCSvPfTd_7fYBZI0laVxfop2cE9PAtBekTL-WolGa9OxePSo5n7OiH7mHzIEWOlNqNd4dHVfQvc')" }}
                                ></div>
                                <div className="relative z-10">
                                    <h1 className="text-4xl font-black mb-6 leading-tight tracking-tight">Digital Approval System</h1>
                                    <p className="text-white/80 text-lg">Streamline your mall operations with our enterprise-grade approval workflow. Secure, fast, and transparent.</p>
                                </div>
                                <div className="relative z-10 space-y-6 mt-12">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/10 p-2 rounded-lg shrink-0 flex">
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}> task_alt </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Instant Approvals</p>
                                            <p className="text-sm text-white/70">Reduce turnaround time for maintenance and vendor requests.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/10 p-2 rounded-lg shrink-0 flex">
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}> monitoring </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Real-time Tracking</p>
                                            <p className="text-sm text-white/70">Monitor the status of every request in your dashboard.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel (Form) */}
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-extrabold text-foreground mb-2">Welcome Back</h2>
                                    <p className="text-muted-foreground font-medium">Please enter your credentials to access the portal.</p>
                                </div>

                                {status && <Alert type="success" message={status} className="mb-6" />}
                                <ValidationErrors errors={errors} className="mb-6" />

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <Input
                                        type="email"
                                        name="email"
                                        label="Email Address"
                                        icon="mail"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin@mall.com"
                                        required
                                        error={errors.email}
                                    />

                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        label="Password"
                                        icon="lock"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        error={errors.password}
                                        labelRight={
                                            <Link href="/forgot-password" className="font-medium text-primary hover:underline transition-colors">
                                                Forgot password?
                                            </Link>
                                        }
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

                                    <div className="flex items-center pt-1">
                                        <input 
                                            id="remember" 
                                            name="remember" 
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-700 rounded transition-colors" 
                                        />
                                        <label htmlFor="remember" className="ml-2 block text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Keep me signed in for 30 days
                                        </label>
                                    </div>

                                    <div className="pt-2">
                                        <Button 
                                            type="submit" 
                                            variant="primary"
                                            loading={processing}
                                            className="w-full"
                                        >
                                            {processing ? 'Signing In...' : 'Sign In'}
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-8 pt-6 border-t border-border text-center">
                                    <p className="text-muted-foreground text-sm font-medium">
                                        Don't have an account yet?
                                        <Link href="/register" className="ml-1 text-primary font-bold hover:underline transition-colors">
                                            Create Account
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="py-6 px-10 text-center text-muted-foreground text-xs font-medium">
                        <p>© {new Date().getFullYear()} Mall Management Digital Approval System. All rights reserved.</p>
                        <div className="mt-3 flex justify-center gap-6">
                            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                            <a className="hover:text-primary transition-colors" href="#">Support</a>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}

export default Login;
