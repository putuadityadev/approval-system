/**
 * Users Index
 *
 * Halaman list semua users untuk Super Admin.
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan tabel semua users dengan pagination
 * - Menyediakan tombol untuk create, edit, activate/deactivate user
 * - Menampilkan informasi role, status aktif, dan data vendor (jika ada)
 *
 * Props:
 * - users: object — data users dengan pagination { data: [...], links: [...], meta: {...} }
 */

import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import useFlashMessage from '@/hooks/useFlashMessage';

function UsersIndex({ auth, users }) {
    useFlashMessage();

    /**
     * handleDeactivate
     * Menonaktifkan user (soft delete)
     */
    const handleDeactivate = (userId) => {
        if (confirm('Apakah Anda yakin ingin menonaktifkan user ini?')) {
            router.delete(`/admin/users/${userId}`);
        }
    };

    /**
     * handleActivate
     * Mengaktifkan kembali user yang sudah dinonaktifkan
     */
    const handleActivate = (userId) => {
        if (confirm('Apakah Anda yakin ingin mengaktifkan user ini?')) {
            router.post(`/admin/users/${userId}/activate`);
        }
    };

    /**
     * getRoleLabel
     * Mengubah role code menjadi label yang friendly
     */
    const getRoleLabel = (role) => {
        const labels = {
            super_admin: 'Super Admin',
            vendor: 'Vendor',
            approver_dept: 'Approver Department',
            approver_ops: 'Approver Operations',
            approver_finance: 'Approver Finance',
            approver_gm: 'Approver GM',
            security: 'Security',
        };
        return labels[role] || role;
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                            <p className="text-gray-600 mt-1">Kelola semua user dalam sistem</p>
                        </div>
                        <Link href="/admin/users/create">
                            <Button variant="primary">
                                + Tambah User
                            </Button>
                        </Link>
                    </div>

                    {/* Users table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Perusahaan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.data.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.vendor ? user.vendor.company_name : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.is_active ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Link href={`/admin/users/${user.id}/edit`}>
                                                    <Button variant="secondary" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                {user.is_active ? (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeactivate(user.id)}
                                                    >
                                                        Nonaktifkan
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleActivate(user.id)}
                                                    >
                                                        Aktifkan
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.links && users.links.length > 3 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{users.meta.from}</span> to{' '}
                                        <span className="font-medium">{users.meta.to}</span> of{' '}
                                        <span className="font-medium">{users.meta.total}</span> results
                                    </div>
                                    <div className="flex space-x-2">
                                        {users.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-1 rounded ${
                                                    link.active
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Back to dashboard */}
                    <div className="mt-6">
                        <Link href="/admin/dashboard">
                            <Button variant="secondary">
                                ← Kembali ke Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default UsersIndex;
