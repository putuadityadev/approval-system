/**
 * Register
 *
 * Halaman registrasi untuk Requester (vendor).
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan form registrasi dengan field name, email, password, dan password confirmation
 * - Menangani proses registrasi menggunakan Inertia useForm
 * - Menampilkan validation errors
 * - Auto-login dan redirect ke requester dashboard setelah registrasi berhasil
 *
 * Cara kerjanya:
 * 1. User mengisi nama, email, password, dan konfirmasi password
 * 2. Submit form ke endpoint POST /register
 * 3. Backend membuat user baru dengan role 'requester'
 * 4. Jika berhasil, user otomatis login dan redirect ke dashboard
 * 5. Jika gagal, tampilkan error message
 *
 * Props:
 * - errors: object — validation errors dari backend
 *
 * Requirements: 4.1, 11.2, 11.8, 11.9
 */

import { useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import ValidationErrors from '@/Components/shared/ValidationErrors';

function Register({ errors }) {
    /**
     * useForm hook dari Inertia
     * Mengelola state form dan proses submission
     */
    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    /**
     * handleSubmit
     *
     * Menangani form submission saat user klik tombol Daftar.
     * Mengirim POST request ke /register dengan data form.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            {/* Page title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Buat Akun Baru
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Daftar sebagai Requester untuk mengajukan surat ijin
                </p>
            </div>

            {/* Validation errors */}
            <ValidationErrors errors={errors} className="mb-4" />

            {/* Register form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field */}
                <Input
                    type="text"
                    name="name"
                    label="Nama Lengkap"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                    error={errors.name}
                />

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
                    placeholder="Minimal 8 karakter"
                    required
                    error={errors.password}
                />

                {/* Password confirmation field */}
                <Input
                    type="password"
                    name="password_confirmation"
                    label="Konfirmasi Password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    placeholder="Masukkan password yang sama"
                    required
                    error={errors.password_confirmation}
                />

                {/* Info text */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs text-blue-800">
                        <strong>Catatan:</strong> Akun yang dibuat akan
                        memiliki role Requester. Jika Anda memerlukan akses
                        Admin, silakan hubungi administrator sistem.
                    </p>
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    variant="primary"
                    loading={processing}
                    disabled={processing}
                    className="w-full"
                >
                    {processing ? 'Memproses...' : 'Daftar'}
                </Button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Sudah punya akun?{' '}
                    <Link
                        href="/login"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}

export default Register;
