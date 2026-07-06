/**
 * SuratPreview
 *
 * Komponen untuk menampilkan preview surat dalam format yang mirror surat fisik.
 * Digunakan oleh Approver, Vendor, dan Security untuk review detail surat dengan tampilan yang jelas.
 * Support print dengan CSS @media print untuk hide UI elements saat print.
 *
 * Props:
 * - request: object - Data request lengkap (termasuk sikmb_detail atau sik_detail)
 * - type: string - "sikmb" atau "sik"
 */
export default function SuratPreview({ request, type }) {
    const isSIKMB = type === 'sikmb';
    
    // CRITICAL FIX: Backend kirim 'sikm_detail' (typo missing 'b')
    // Laravel serialize sikmDetail() → sikm_detail (bukan sikmb_detail)
    const detail = isSIKMB 
        ? (request.sikm_detail || request.sikmDetail || request.sikmb_detail)
        : (request.sik_detail || request.sikDetail);

    if (!detail) {
        return (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-8 text-center">
                <p className="text-slate-500">Data surat tidak lengkap</p>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        return timeStr.substring(0, 5); // HH:MM
    };

    return (
        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-lg overflow-hidden print:block print:shadow-none print:border-slate-400">
            {/* Header Surat - Mirip Logo & Judul */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6 border-b-4 border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Logo Mall - Real icon dari public folder */}
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                            <img 
                                src="/icon-bali-mall-logo-small.png" 
                                alt="Bali Mall Logo" 
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                        <div>
                            <h2 className="text-white font-extrabold text-[22px] tracking-tight">
                                {isSIKMB ? 'SURAT IJIN KELUAR/MASUK BARANG' : 'SURAT IZIN KERJA'}
                            </h2>
                            <p className="text-slate-300 text-sm font-medium">
                                {isSIKMB ? '(SIKMB)' : '(SIK)'} - Approval System
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-md">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Form</p>
                            <p className="text-lg font-bold text-slate-800">{request.sop_form_code || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body Surat */}
            <div className="p-8 space-y-6">
                {/* No. Dokumen */}
                <div className="flex items-center gap-4 pb-4 border-b-2 border-dashed border-slate-200">
                    <div className="flex-shrink-0 w-32">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No. Dokumen:</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {request.document_serial_no}
                        </p>
                    </div>
                </div>

                {/* Informasi Pemohon */}
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">business</span>
                        Informasi Pemohon
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perusahaan</p>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {request.vendor?.company_name || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama PIC</p>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {request.vendor?.pic_name || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat</p>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {request.vendor?.address || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No. Telepon PIC</p>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {request.vendor?.pic_phone || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail Spesifik per Tipe */}
                {isSIKMB ? (
                    <>
                        {/* SIKMB Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">info</span>
                                Detail Pengiriman / Pengambilan Barang
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex gap-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase w-28">Jenis:</span>
                                    <span className="text-base font-semibold text-slate-900">
                                        {request.request_type === 'LOADING_IN' ? '☑ MASUK' : '☐ MASUK'} &nbsp;&nbsp;
                                        {request.request_type === 'LOADING_OUT' ? '☑ KELUAR' : '☐ KELUAR'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lantai Asal</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{detail.origin_floor || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Asal</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{detail.origin_unit || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hari / Tanggal</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">
                                        {formatDate(detail.start_date)} - {formatDate(detail.end_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">
                                        {formatTime(detail.start_time)} - {formatTime(detail.end_time)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Tujuan</p>
                                <p className="text-base font-semibold text-slate-900 mt-1">{detail.dest_address || '-'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lantai Tujuan</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{detail.dest_floor || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telepon Tujuan</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{detail.dest_phone || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabel Barang */}
                        {detail.items && detail.items.length > 0 && (
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">list_alt</span>
                                    Daftar Barang
                                </h3>
                                <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-200 border-b-2 border-slate-300">
                                                <th className="py-3 px-4 text-left text-xs font-extrabold text-slate-700 uppercase tracking-wider w-12">No</th>
                                                <th className="py-3 px-4 text-left text-xs font-extrabold text-slate-700 uppercase tracking-wider">Nama Barang</th>
                                                <th className="py-3 px-4 text-center text-xs font-extrabold text-slate-700 uppercase tracking-wider w-24">Jumlah</th>
                                                <th className="py-3 px-4 text-left text-xs font-extrabold text-slate-700 uppercase tracking-wider w-32">Satuan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {detail.items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="py-3 px-4 text-sm font-semibold text-slate-600">{idx + 1}</td>
                                                    <td className="py-3 px-4 text-base font-semibold text-slate-900">{item.item_name}</td>
                                                    <td className="py-3 px-4 text-center text-base font-bold text-slate-900">{item.quantity}</td>
                                                    <td className="py-3 px-4 text-base font-semibold text-slate-700">{item.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* CATATAN untuk SIKMB */}
                        <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5">
                            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-yellow-700">warning</span>
                                CATATAN:
                            </h3>
                            <ol className="space-y-2 text-xs leading-relaxed text-slate-700">
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">1.</span>
                                    <span>Keluar / masuk barang wajib menggunakan lift barang.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">2.</span>
                                    <span>Surat izin masuk barang berlaku <strong>7 (tujuh) hari</strong> dan surat izin keluar barang berlaku <strong>1 (satu) hari</strong>, untuk itu, meminta izin keluar / masuk barang dapat dilaksanakan <strong>H-2</strong> sebelum pelaksanaan keluar / masuk barang, <strong>Jam 10.00 - 15.00 WITA</strong>, hari <strong>Senin - Jumat</strong> di luar hari <strong>Sabtu, Minggu dan Hari Libur Nasional</strong>.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">3.</span>
                                    <span>Keluar / masuk barang-barang dilaksanakan dari pukul <strong>22.00 - 00.00 WITA</strong>.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">4.</span>
                                    <span>Petugas Security wajib dan berhak untuk memeriksa barang masuk / keluar.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">5.</span>
                                    <span>Petugas Security wajib dan berhak menolak izin keluar / masuk barang apabila barang tidak sesuai dengan item barang di dalam form dan Petugas wajib menolak apabila tidak sesuai dengan jadwal keluar / masuk barang yang telah ditetapkan.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">6.</span>
                                    <span>Pekerja keluar / masuk barang wajib dilengkapi dengan kartu identitas.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">7.</span>
                                    <span>Pembawa barang diwajibkan untuk mengucapkan <strong>KTP / SIM</strong> (kepada pihak security).</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">8.</span>
                                    <span>Untuk pengangkutan barang-barang proyek diwajibkan memberikan pengamanan / proteksi untuk interior lift dan keindahannya yang dilewati.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">9.</span>
                                    <span>Seluruh kerusakan interior lift dan area landlord (area yang dilewati) akibat kecerobohan pembawa barang akan dikenakan denda sebesar biaya perbaikan yang dilakukan vendor yang ditunjuk oleh Management Icon Bali.</span>
                                </li>
                            </ol>
                        </div>
                    </>
                ) : (
                    <>
                        {/* SIK Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">construction</span>
                                Detail Pekerjaan
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Pekerja</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{detail.worker_count || 0} Orang</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Pekerjaan</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{detail.job_type || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Mulai</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{formatDate(detail.start_date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Selesai</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{formatDate(detail.end_date)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Mulai</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{formatTime(detail.start_time)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Selesai</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{formatTime(detail.end_time)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi Pekerjaan</p>
                                <p className="text-base font-semibold text-slate-900 mt-1">{detail.location || '-'}</p>
                            </div>

                            {detail.description && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Pekerjaan</p>
                                    <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{detail.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* KETENTUAN KERJA untuk SIK */}
                        <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
                            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-blue-700">gavel</span>
                                KETENTUAN KERJA:
                            </h3>
                            <ol className="space-y-2 text-xs leading-relaxed text-slate-700">
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">1.</span>
                                    <span>Setiap akan memulai & mengakhiri pekerjaan Kontraktor/Tenant wajib menghubungi PIC di lokasi / gedung tsb. Surat Izin Kerja harus diperbaharui setiap <strong>7 hari</strong>.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">2.</span>
                                    <span>Kontraktor wajib menyerahkan diagram pekerjaan atau rencana kerja yang telah disetujui oleh <strong>Perusahaan</strong>, terutama yang berhubungan dengan pekerjaan relayout, perubahan system existing, baik Sipil maupun ME.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">3.</span>
                                    <span>Setiap pekerja diberi tanda pengenal yang selalu dikenakan.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">4.</span>
                                    <span>Pekerjaan harus memenuhi standar <strong>Health Safety Environment</strong>.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">5.</span>
                                    <span>Setiap pekerja diberi alat pelindung kerja, sesuai jenis pekerjaan.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">6.</span>
                                    <span>Tidak diperkenankan merokok di dalam gedung.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">7.</span>
                                    <div className="flex-1">
                                        <span>Khusus untuk pekerjaan yang berhubungan dengan <strong>Sistem Permit</strong> akan diberlakukan izin khusus, antara lain:</span>
                                        <ul className="mt-1 ml-4 space-y-1">
                                            <li className="flex gap-2">
                                                <span className="flex-shrink-0">a.</span>
                                                <span><strong>Hot Work Permit</strong> (Pengelasan)</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="flex-shrink-0">b.</span>
                                                <span><strong>Confined Space Permit</strong> (Tempat Kerja yang Sempit)</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="flex-shrink-0">c.</span>
                                                <div className="flex-1">
                                                    <span><strong>Safe Work Permit</strong> (Pekerjaan berisiko) yang mencakup:</span>
                                                    <span className="block ml-4 mt-0.5">Penggalian, pengeboran, pekerjaan di Tempat Tinggi, Pekerjaan pada Tegangan Tinggi</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">8.</span>
                                    <span>Kontraktor bersedia memperbaiki segala kerusakan & kesalahan yang timbul akibat pekerjaan yang dilakukan.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold flex-shrink-0">9.</span>
                                    <span>Tidak diperkenankan menginap di dalam area Perusahaan / Gedung.</span>
                                </li>
                            </ol>
                        </div>
                    </>
                )}

                {/* Footer Info */}
                <div className="pt-6 border-t-2 border-dashed border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <div>
                            <p><strong>Tanggal Dibuat:</strong> {formatDate(request.created_at)}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono">{request.document_serial_no}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Badge di bawah */}
            <div className="bg-slate-100 px-8 py-4 border-t-2 border-slate-200">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status Surat:</p>
                    <span className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg shadow-sm ${
                        request.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                        request.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                        request.status === 'CANCELLED' ? 'bg-slate-200 text-slate-700 border-2 border-slate-300' :
                        'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                    }`}>
                        {request.status.replace('_', ' ')}
                    </span>
                </div>
            </div>
        </div>
    );
}
