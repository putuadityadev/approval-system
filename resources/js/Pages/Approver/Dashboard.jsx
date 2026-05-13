import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';

export default function ApproverDashboard({ auth, roleLabel, stats, recentApprovals }) {
    /**
     * formatDate
     *
     * Format tanggal ke format Indonesia (DD MMM YYYY HH:mm).
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('id-ID', { month: 'short' });
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year} ${hours}:${minutes}`;
    };

    /**
     * getActionBadge
     */
    const getActionBadge = (action) => {
        if (action === 'APPROVED') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm bg-green-100 text-green-800">
                    Disetujui
                </span>
            );
        } else if (action === 'REJECTED') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm bg-red-100 text-red-800">
                    Ditolak
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm bg-gray-100 text-gray-800">
                {action}
            </span>
        );
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-[30px] font-extrabold text-foreground tracking-tight">Dashboard {roleLabel}</h2>
                            <p className="text-[14px] font-medium text-muted-foreground mt-1">
                                Selamat datang, <span className="font-bold">{auth.user.email}</span>. Pantau dan review pengajuan yang menunggu persetujuan Anda.
                            </p>
                        </div>
                        <Link href={route('approver.requests.index')}>
                            <Button 
                                variant="primary" 
                                className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2 justify-center"
                            >
                                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                                Review Pending
                            </Button>
                        </Link>
                    </div>

                    {/* Bento Grid for Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Pending Card */}
                        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending</span>
                                <span className="material-symbols-outlined text-yellow-600 transition-transform group-hover:scale-110" style={{fontVariationSettings: "'FILL' 1"}}>schedule</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[36px] font-black text-card-foreground tracking-tight">{stats?.pending || 0}</span>
                                <span className="text-[12px] font-medium text-muted-foreground">Menunggu review</span>
                            </div>
                        </div>

                        {/* Approved Card */}
                        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Disetujui</span>
                                <span className="material-symbols-outlined text-green-600 transition-transform group-hover:scale-110" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[36px] font-black text-card-foreground tracking-tight">{stats?.approved || 0}</span>
                                <span className="text-[12px] font-medium text-muted-foreground">Total disetujui</span>
                            </div>
                        </div>

                        {/* Rejected Card */}
                        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ditolak</span>
                                <span className="material-symbols-outlined text-red-600 transition-transform group-hover:scale-110" style={{fontVariationSettings: "'FILL' 1"}}>cancel</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[36px] font-black text-card-foreground tracking-tight">{stats?.rejected || 0}</span>
                                <span className="text-[12px] font-medium text-muted-foreground">Total ditolak</span>
                            </div>
                        </div>

                        {/* Total Card */}
                        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Surat</span>
                                <span className="material-symbols-outlined text-primary transition-transform group-hover:scale-110" style={{fontVariationSettings: "'FILL' 1"}}>assignment</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[36px] font-black text-card-foreground tracking-tight">{stats?.total || 0}</span>
                                <span className="text-[12px] font-medium text-muted-foreground">Semua diproses</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-card rounded-lg shadow-sm border border-border/50 overflow-hidden">
                        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-background">
                            <h3 className="text-[20px] font-bold text-card-foreground">Aktivitas Terbaru</h3>
                            {recentApprovals && recentApprovals.length > 0 && (
                                <Link href={route('approver.history')} className="text-[12px] font-medium text-primary hover:underline focus:outline-none flex items-center gap-1">
                                    Lihat Riwayat <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                            )}
                        </div>
                        
                        <div className="overflow-x-auto">
                            {!recentApprovals || recentApprovals.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">history</span>
                                    <h3 className="text-sm font-medium text-foreground">Belum ada aktivitas</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Anda belum melakukan approval surat apapun.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-background border-b border-border">
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No. Dokumen</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vendor</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status / Aksi</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Catatan</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[14px] font-medium">
                                        {recentApprovals.map((approval) => (
                                            <tr key={approval.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    {approval.request ? (
                                                        <Link href={route('approver.requests.show', approval.request.id)} className="text-primary hover:underline font-bold text-[12px] flex items-center gap-1">
                                                            {approval.request.document_serial_no || 'Draft'}
                                                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted-foreground font-bold text-[12px]">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-foreground">
                                                    {approval.request?.vendor?.company_name || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getActionBadge(approval.action)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {approval.notes ? (
                                                        <span className="text-muted-foreground italic text-[13px] line-clamp-1 max-w-[200px]" title={approval.notes}>
                                                            "{approval.notes}"
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground/50 text-[13px]">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right text-muted-foreground text-[12px]">
                                                    {formatDate(approval.action_date)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
