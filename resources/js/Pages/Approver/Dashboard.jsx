/**
 * Approver Dashboard
 *
 * Halaman dashboard untuk Approver (Department, Operations, Finance, GM).
 * Placeholder untuk development selanjutnya.
 *
 * Props:
 * - auth: object — data user yang sedang login { user: {...} }
 * - roleLabel: string — label role yang friendly (Department, Operations, Finance, GM)
 */

import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';

function ApproverDashboard({ auth, roleLabel }) {
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
                                Dashboard Approval - {roleLabel}
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Selamat datang, <span className="font-semibold">{auth.user.email}</span>
                            </p>
                            <div className="mt-6">
                                <p className="text-gray-500 italic">
                                    Fitur approval surat akan tersedia segera...
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

export default ApproverDashboard;
