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
 * Cara kerjanya:
 * 1. User mengisi email dan password
 * 2. User bisa centang "Remember Me" untuk persistent session
 * 3. Submit form ke endpoint POST /login
 * 4. Jika berhasil, redirect ke dashboard (Admin atau Requester)
 * 5. Jika gagal, tampilkan error message
 *
 * Props:
 * - errors: object — validation errors dari backend
 * - status: string — flash message (misal: "Anda berhasil logout")
 *
 * Requirements: 5.1, 11.1, 11.8, 11.9
 */

import { useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Alert from '@/Components/ui/Alert';
import ValidationErrors from '@/Components/shared/ValidationErrors';

function Login({ errors, status }) {
    /**
     * useForm hook dari Inertia
     * Mengelola state form dan proses submission
     */
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    /**
     * handleSubmit
     *
     * Menangani form submission saat user klik tombol Login.
     * Mengirim POST request ke /login dengan data form.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout>
            {/* Page title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Masuk ke Akun Anda
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Silakan masukkan email dan password Anda
                </p>
            </div>

            {/* Flash message - tampil jika ada status (misal: setelah logout) */}
            {status && (
                <Alert type="success" message={status} className="mb-4" />
            )}

            {/* Validation errors */}
            <ValidationErrors errors={errors} className="mb-4" />

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email field */}
                <Input
                    type="email"
                    name="email"
                    label="Email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="nama@contoh.com"
                    required
                    error={errors.email}
                />

                {/* Password field */}
                <Input
                    type="password"
                    name="password"
                    label="Password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Masukkan password Anda"
                    required
                    error={errors.password}
                />

                {/* Remember me checkbox */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                        htmlFor="remember"
                        className="ml-2 block text-sm text-gray-700"
                    >
                        Ingat saya
                    </label>
                </div>

                {/* Forgot password link */}
                <div className="flex items-center justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Lupa password?
                    </Link>
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    variant="primary"
                    loading={processing}
                    disabled={processing}
                    className="w-full"
                >
                    {processing ? 'Memproses...' : 'Masuk'}
                </Button>
            </form>

            {/* Register link */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link
                        href="/register"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        Daftar sekarang
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}

export default Login;
