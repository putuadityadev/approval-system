/**
 * Approver Dashboard
 *
 * Halaman dashboard untuk Approver (Department, Operations, Finance, GM).
 *
 * Cara kerja:
 * 1. Menampilkan statistics cards (pending, approved, rejected)
 * 2. Quick actions untuk akses pending requests & history
 * 3. Recent activity (approval logs terbaru)
 *
 * Props:
 * - auth: object — data user yang sedang login { user: {...} }
 * - roleLabel: string — label role yang friendly (Department, Operations, Finance, GM)
 * - stats: object — statistics { pending, approved, rejected, total }
 * - recentApprovals: array — approval logs terbaru (max 5)
 */

import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function ApproverDashboard({ auth, roleLabel, stats, recentApprovals }) {
    /**
     * formatDate
     *
     * Format tanggal ke format Indonesia (DD/MM/YYYY HH:mm).
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    /**
     * getActionBadge
     */
    const getActionBadge = (action) => {
        if (action === 'APPROVED') {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Disetujui
                </span>
            );
        } else if (action === 'REJECTED') {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Ditolak
                </span>
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Dashboard Approval - {roleLabel}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Selamat datang, <span className="font-semibold">{auth.user.email}</span>
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {/* Pending Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-l-4 border-yellow-500">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {stats?.pending || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Menunggu approval Anda</p>
                            </div>
                        </div>

                        {/* Approved Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-l-4 border-green-500">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Disetujui</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {stats?.approved || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Total yang Anda setujui</p>
                            </div>
                        </div>

                        {/* Rejected Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-l-4 border-red-500">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ditolak</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {stats?.rejected || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Total yang Anda tolak</p>
                            </div>
                        </div>

                        {/* Total Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-l-4 border-blue-500">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {stats?.total || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Total approval Anda</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Pending Requests Card */}
                        <Link href={route('approver.requests.index')}>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Review dan approve surat yang menunggu
                                            </p>
                                        </div>
                                        <div className="p-3 bg-yellow-100 rounded-full">
                                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-blue-600 font-medium">
                                        <span>Lihat Semua</span>
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* History Card */}
                        <Link href={route('approver.history')}>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Approval History</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Lihat riwayat approval yang sudah dilakukan
                                            </p>
                                        </div>
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-blue-600 font-medium">
                                        <span>Lihat Semua</span>
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
                            
                            {!recentApprovals || recentApprovals.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">Belum ada aktivitas approval</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentApprovals.map((approval) => (
                                        <div key={approval.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        {getActionBadge(approval.action)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {approval.request?.document_serial_no || '-'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {approval.request?.vendor?.company_name || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {approval.notes && (
                                                    <p className="text-xs text-gray-600 mt-2 italic">
                                                        "{approval.notes}"
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(approval.action_date)}
                                                </p>
                                                {approval.request && (
                                                    <Link
                                                        href={route('approver.requests.show', approval.request.id)}
                                                        className="text-xs text-blue-600 hover:text-blue-900 mt-1 inline-block"
                                                    >
                                                        Lihat Detail →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default ApproverDashboard;
