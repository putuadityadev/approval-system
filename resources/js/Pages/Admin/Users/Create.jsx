/**
 * Create User
 * Form untuk Super Admin membuat user baru
 */

import { useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import ValidationErrors from '@/Components/shared/ValidationErrors';

function CreateUser({ auth, roles, errors }) {
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/users');
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tambah User Baru</h2>
                            
                            <ValidationErrors errors={errors} className="mb-4" />

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    type="email"
                                    name="email"
                                    label="Email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    error={errors.email}
                                />

                                <Input
                                    type="password"
                                    name="password"
                                    label="Password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    error={errors.password}
                                />

                                <Input
                                    type="password"
                                    name="password_confirmation"
                                    label="Konfirmasi Password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    error={errors.password_confirmation}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Pilih Role</option>
                                        {roles.map((role) => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button type="submit" variant="primary" loading={processing} disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                    <Link href="/admin/users">
                                        <Button variant="secondary">Batal</Button>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default CreateUser;
