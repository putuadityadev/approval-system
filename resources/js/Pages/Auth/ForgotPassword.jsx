/**
 * ForgotPassword
 *
 * Halaman untuk request reset password.
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan form forgot password dengan field email
 * - Mengirim link reset password ke email user
 * - Menampilkan success message setelah email terkirim
 * - Menampilkan validation errors jika ada
 *
 * Cara kerjanya:
 * 1. User memasukkan email yang terdaftar
 * 2. Submit form ke endpoint POST /forgot-password
 * 3. Backend generate token dan kirim email berisi link reset
 * 4. Tampilkan success message jika email berhasil dikirim
 * 5. User klik link di email untuk ke halaman reset password
 *
 * Props:
 * - errors: object — validation errors dari backend
 * - status: string — success message setelah email terkirim
 *
 * Requirements: 8.1, 11.3
 */

import { useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Alert from '@/Components/ui/Alert';
import ValidationErrors from '@/Components/shared/ValidationErrors';

function ForgotPassword({ errors, status }) {
    /**
     * useForm hook dari Inertia
     * Mengelola state form dan proses submission
     */
    const { data, setData, post, processing } = useForm({
        email: '',
    });

    /**
     * handleSubmit
     *
     * Menangani form submission saat user klik tombol Kirim Link Reset.
     * Mengirim POST request ke /forgot-password dengan email.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <GuestLayout>
            {/* Page title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Lupa Password?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Masukkan email Anda dan kami akan mengirimkan link untuk
                    reset password
                </p>
            </div>

            {/* Success message - tampil setelah email berhasil dikirim */}
            {status && (
                <Alert type="success" message={status} className="mb-4" />
            )}

            {/* Validation errors */}
            <ValidationErrors errors={errors} className="mb-4" />

            {/* Forgot password form */}
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

                {/* Info text */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-xs text-gray-700">
                        Kami akan mengirimkan link reset password ke email Anda.
                        Link tersebut berlaku selama 60 menit.
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
                    {processing ? 'Mengirim...' : 'Kirim Link Reset Password'}
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

export default ForgotPassword;
