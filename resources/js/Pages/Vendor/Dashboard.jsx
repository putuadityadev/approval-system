/**
 * Vendor Dashboard
 *
 * Halaman dashboard untuk Vendor.
 * Placeholder untuk development selanjutnya.
 *
 * Props:
 * - auth: object — data user yang sedang login dengan relasi vendor { user: {..., vendor: {...}} }
 */

import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';

function VendorDashboard({ auth }) {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Dashboard Vendor
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Selamat datang, <span className="font-semibold">{auth.user.email}</span>
                            </p>
                            {auth.user.vendor && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                    <h3 className="font-semibold text-gray-900 mb-2">Informasi Perusahaan:</h3>
                                    <p className="text-sm text-gray-700">Nama: {auth.user.vendor.company_name}</p>
                                    <p className="text-sm text-gray-700">PIC: {auth.user.vendor.pic_name}</p>
                                    <p className="text-sm text-gray-700">Telepon: {auth.user.vendor.pic_phone}</p>
                                </div>
                            )}
                            <div className="mt-6">
                                <p className="text-gray-500 italic">
                                    Fitur pengajuan surat akan tersedia segera...
                                </p>
                            </div>
                            <div className="mt-6">
                                <Button variant="danger" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default VendorDashboard;
