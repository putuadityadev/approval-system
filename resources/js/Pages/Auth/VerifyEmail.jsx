/**
 * VerifyEmail
 *
 * Halaman untuk email verification (opsional untuk MVP).
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan pesan bahwa user perlu verifikasi email
 * - Menyediakan tombol untuk resend verification email
 * - Menampilkan success message setelah email verifikasi dikirim ulang
 *
 * Cara kerjanya:
 * 1. User yang belum verifikasi email akan diarahkan ke halaman ini
 * 2. Tampilkan pesan "Please verify your email"
 * 3. User bisa klik tombol "Resend Verification Email"
 * 4. Backend kirim ulang email verifikasi
 * 5. Tampilkan success message setelah email terkirim
 *
 * Props:
 * - status: string — success message setelah resend email berhasil
 *
 * Requirements: 9.1, 9.7, 11.12
 */

import { useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/ui/Button';
import Alert from '@/Components/ui/Alert';

function VerifyEmail({ status }) {
    /**
     * useForm hook dari Inertia
     * Mengelola proses resend verification email
     */
    const { post, processing } = useForm({});

    /**
     * handleResend
     *
     * Menangani resend verification email.
     * Mengirim POST request ke /email/verification-notification.
     */
    const handleResend = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <GuestLayout>
            {/* Page title */}
            <div className="mb-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                    <svg
                        className="h-8 w-8 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                    Verifikasi Email Anda
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Kami telah mengirimkan link verifikasi ke email Anda
                </p>
            </div>

            {/* Success message - tampil setelah resend email berhasil */}
            {status === 'verification-link-sent' && (
                <Alert
                    type="success"
                    message="Link verifikasi baru telah dikirim ke email Anda!"
                    className="mb-4"
                />
            )}

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-blue-800 mb-3">
                    Sebelum melanjutkan, silakan cek email Anda untuk link
                    verifikasi. Jika Anda tidak menerima email:
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Periksa folder spam/junk email Anda</li>
                    <li>Pastikan email yang Anda daftarkan sudah benar</li>
                    <li>Klik tombol di bawah untuk kirim ulang email verifikasi</li>
                </ul>
            </div>

            {/* Resend verification email form */}
            <form onSubmit={handleResend} className="space-y-4">
                <Button
                    type="submit"
                    variant="primary"
                    loading={processing}
                    disabled={processing}
                    className="w-full"
                >
                    {processing
                        ? 'Mengirim...'
                        : 'Kirim Ulang Email Verifikasi'}
                </Button>
            </form>

            {/* Logout link */}
            <div className="mt-6 text-center">
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                    Logout
                </Link>
            </div>
        </GuestLayout>
    );
}

export default VerifyEmail;
