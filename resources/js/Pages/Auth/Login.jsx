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
            <Head title="Login - Icon Mall Bali" />
            <div className="min-h-screen w-full flex bg-background font-sans text-foreground selection:bg-primary/20">
                
                {/* Left Side - Image Panel */}
                <div className="hidden lg:flex lg:w-[55%] relative bg-zinc-950 overflow-hidden">
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

                        <h1 className="text-5xl xl:text-6xl font-black mb-6 leading-[1.1] tracking-tight drop-shadow-2xl">
                            Digital Approval<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">System</span>
                        </h1>
                        <p className="text-lg xl:text-xl text-white/80 max-w-lg font-medium leading-relaxed drop-shadow-md">
                            Streamline your mall operations with our enterprise-grade approval workflow. Secure, fast, and transparent.
                        </p>
                        
                        <div className="mt-12 flex gap-4 flex-wrap">
                            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 shadow-lg transition-transform hover:-translate-y-1">
                                <span className="material-symbols-outlined text-primary-300" style={{ fontVariationSettings: "'FILL' 1" }}> verified </span>
                                <span className="text-sm font-bold tracking-wide">Instant Approvals</span>
                            </div>
                            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 shadow-lg transition-transform hover:-translate-y-1">
                                <span className="material-symbols-outlined text-primary-300" style={{ fontVariationSettings: "'FILL' 1" }}> monitoring </span>
                                <span className="text-sm font-bold tracking-wide">Real-time Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Panel */}
                <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 sm:p-12 xl:p-20 relative">
                    


                    <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div>
                            <h2 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Welcome Back</h2>
                            <p className="text-muted-foreground text-base font-medium">Enter your credentials to access the portal.</p>
                        </div>

                        {status && <Alert type="success" message={status} className="mb-6 shadow-sm rounded-xl" />}
                        <ValidationErrors errors={errors} className="mb-6" />

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <Input
                                    type="email"
                                    name="email"
                                    label="Email Address"
                                    icon="mail"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@iconmallbali.com"
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
                                        <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                                            Forgot password?
                                        </Link>
                                    }
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
                            </div>

                            <div className="flex items-center pt-2">
                                <label htmlFor="remember" className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            id="remember" 
                                            name="remember" 
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-input bg-background checked:border-primary checked:bg-primary transition-all duration-200" 
                                        />
                                        <span className="material-symbols-outlined absolute text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none text-sm font-bold transition-opacity duration-200" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            check
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                        Keep me signed in
                                    </span>
                                </label>
                            </div>

                            <Button 
                                type="submit" 
                                variant="primary"
                                loading={processing}
                                className="w-full py-4 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
                            >
                                {processing ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/60"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-4 text-muted-foreground font-bold tracking-wider">New Vendor?</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link href="/register" className="inline-flex w-full items-center justify-center px-6 py-4 border-2 border-border text-foreground font-bold rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300">
                                Create Vendor Account
                            </Link>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="absolute bottom-6 text-center w-full">
                        <p className="text-xs font-semibold text-muted-foreground/60">
                            © {new Date().getFullYear()} Icon Mall Bali Digital Approval System.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;

