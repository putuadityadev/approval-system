/**
 * ResetPassword
 *
 * Halaman untuk reset password dengan token dari email.
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan form reset password dengan field password dan password confirmation
 * - Menerima token dan email dari URL parameter
 * - Mengirim request reset password ke backend
 * - Redirect ke login setelah password berhasil direset
 *
 * Cara kerjanya:
 * 1. User klik link reset password dari email (berisi token dan email)
 * 2. Halaman ini menerima token dan email sebagai props
 * 3. User memasukkan password baru dan konfirmasi
 * 4. Submit form ke endpoint POST /reset-password dengan token, email, dan password baru
 * 5. Jika berhasil, redirect ke login dengan success message
 * 6. Jika token invalid/expired, tampilkan error message
 *
 * Props:
 * - token: string — token reset password dari URL
 * - email: string — email user dari URL
 * - errors: object — validation errors dari backend
 *
 * Requirements: 8.7, 11.4
 */

import { useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import ValidationErrors from '@/Components/shared/ValidationErrors';

function ResetPassword({ token, email, errors }) {
    /**
     * useForm hook dari Inertia
     * Mengelola state form dan proses submission.
     * Token dan email sudah diisi dari props (hidden fields).
     */
    const { data, setData, post, processing } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    /**
     * handleSubmit
     *
     * Menangani form submission saat user klik tombol Reset Password.
     * Mengirim POST request ke /reset-password dengan token, email, dan password baru.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <GuestLayout>
            {/* Page title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Reset Password
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Masukkan password baru untuk akun Anda
                </p>
            </div>

            {/* Validation errors */}
            <ValidationErrors errors={errors} className="mb-4" />

            {/* Reset password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email field (read-only, untuk informasi user) */}
                <Input
                    type="email"
                    name="email"
                    label="Email"
                    value={data.email}
                    disabled
                    className="bg-gray-50"
                />

                {/* Password field */}
                <Input
                    type="password"
                    name="password"
                    label="Password Baru"
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
                    label="Konfirmasi Password Baru"
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
                        <strong>Tips:</strong> Gunakan kombinasi huruf besar,
                        huruf kecil, angka, dan simbol untuk password yang lebih
                        aman.
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
                    {processing ? 'Memproses...' : 'Reset Password'}
                </Button>
            </form>

            {/* Back to login link */}
            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
                >
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Kembali ke halaman login
                </Link>
            </div>
        </GuestLayout>
    );
}

export default ResetPassword;
