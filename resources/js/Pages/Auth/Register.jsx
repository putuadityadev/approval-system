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
 * Cara kerjanya:
 * 1. User mengisi email, password, dan data perusahaan (company_name, pic_name, pic_phone, address)
 * 2. Submit form ke endpoint POST /register
 * 3. Backend membuat user baru dengan role 'vendor' + data perusahaan di table vendors
 * 4. Jika berhasil, user otomatis login dan redirect ke vendor dashboard
 * 5. Jika gagal, tampilkan error message
 *
 * Props:
 * - errors: object — validation errors dari backend
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
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        pic_name: '',
        pic_phone: '',
        address: '',
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
                    Registrasi Vendor
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Daftar sebagai Vendor untuk mengajukan surat ijin masuk/keluar dan ijin kerja
                </p>
            </div>

            {/* Validation errors */}
            <ValidationErrors errors={errors} className="mb-4" />

            {/* Register form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Section: Data Akun */}
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Akun</h3>
                    
                    {/* Email field */}
                    <Input
                        type="email"
                        name="email"
                        label="Email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="nama@perusahaan.com"
                        required
                        error={errors.email}
                        className="mb-3"
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
                        className="mb-3"
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
                </div>

                {/* Section: Data Perusahaan */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Perusahaan</h3>
                    
                    {/* Company name field */}
                    <Input
                        type="text"
                        name="company_name"
                        label="Nama Perusahaan"
                        value={data.company_name}
                        onChange={(e) => setData('company_name', e.target.value)}
                        placeholder="PT. Contoh Perusahaan"
                        required
                        error={errors.company_name}
                        className="mb-3"
                    />

                    {/* PIC name field */}
                    <Input
                        type="text"
                        name="pic_name"
                        label="Nama PIC (Person In Charge)"
                        value={data.pic_name}
                        onChange={(e) => setData('pic_name', e.target.value)}
                        placeholder="Nama lengkap PIC"
                        required
                        error={errors.pic_name}
                        className="mb-3"
                    />

                    {/* PIC phone field */}
                    <Input
                        type="text"
                        name="pic_phone"
                        label="Nomor Telepon PIC"
                        value={data.pic_phone}
                        onChange={(e) => setData('pic_phone', e.target.value)}
                        placeholder="08123456789"
                        required
                        error={errors.pic_phone}
                        className="mb-3"
                    />

                    {/* Address field */}
                    <div className="mb-3">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Alamat Perusahaan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Alamat lengkap perusahaan"
                            required
                            rows="3"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.address ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                        )}
                    </div>
                </div>

                {/* Info text */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs text-blue-800">
                        <strong>Catatan:</strong> Akun yang dibuat akan memiliki role Vendor. 
                        Data perusahaan yang Anda masukkan akan digunakan untuk proses pengajuan surat.
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
