import { Head, Link } from '@inertiajs/react';

export default function Create({ vendor }) {
    return (
        <>
            <Head title="Buat Surat Baru" />

            <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="max-w-6xl mx-auto space-y-6 py-6">
                    {/* Header */}
                    <div>
                        <Link
                            href="/vendor/requests"
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:border-primary/50 transition-all mb-6 group"
                        >
                            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Kembali ke Daftar Surat
                        </Link>
                        <div>
                            <h1 className="text-[24px] sm:text-[30px] font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[32px]">post_add</span>
                                Buat Surat Baru
                            </h1>
                            <p className="mt-2 text-sm font-medium text-slate-500">
                                Pilih jenis surat yang ingin Anda ajukan untuk keperluan di area mall.
                            </p>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        {/* SIKMB Barang Masuk */}
                        <Link
                            href="/vendor/requests/create/sikmb?type=LOADING_IN"
                            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-2 border-transparent hover:border-primary flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mb-6 relative z-10">
                                <span className="material-symbols-outlined text-primary text-[28px]">login</span>
                            </div>
                            <h3 className="text-[18px] font-bold text-slate-900 mb-2 relative z-10">
                                Barang Masuk
                            </h3>
                            <p className="text-slate-500 text-[13px] leading-relaxed flex-1 relative z-10">
                                Surat Izin Keluar/Masuk Barang (SIKMB) untuk mendaftarkan barang yang akan dimasukkan ke area mall.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-primary text-[13px] font-bold relative z-10 group-hover:gap-3 transition-all">
                                Buat Surat <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </div>
                        </Link>

                        {/* SIKMB Barang Keluar */}
                        <Link
                            href="/vendor/requests/create/sikmb?type=LOADING_OUT"
                            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-2 border-transparent hover:border-green-500 flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="flex items-center justify-center w-14 h-14 bg-green-500/10 rounded-xl mb-6 relative z-10">
                                <span className="material-symbols-outlined text-green-600 text-[28px]">logout</span>
                            </div>
                            <h3 className="text-[18px] font-bold text-slate-900 mb-2 relative z-10">
                                Barang Keluar
                            </h3>
                            <p className="text-slate-500 text-[13px] leading-relaxed flex-1 relative z-10">
                                Surat Izin Keluar/Masuk Barang (SIKMB) untuk mendaftarkan barang yang akan dikeluarkan dari area mall.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-green-600 text-[13px] font-bold relative z-10 group-hover:gap-3 transition-all">
                                Buat Surat <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </div>
                        </Link>

                        {/* SIK */}
                        <Link
                            href="/vendor/requests/create/sik"
                            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-2 border-transparent hover:border-purple-500 flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="flex items-center justify-center w-14 h-14 bg-purple-500/10 rounded-xl mb-6 relative z-10">
                                <span className="material-symbols-outlined text-purple-600 text-[28px]">engineering</span>
                            </div>
                            <h3 className="text-[18px] font-bold text-slate-900 mb-2 relative z-10">
                                Izin Kerja
                            </h3>
                            <p className="text-slate-500 text-[13px] leading-relaxed flex-1 relative z-10">
                                Surat Izin Kerja (SIK) untuk mengajukan perizinan pekerjaan, instalasi, atau perbaikan di area mall.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-purple-600 text-[13px] font-bold relative z-10 group-hover:gap-3 transition-all">
                                Buat Surat <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </div>
                        </Link>
                    </div>

                    {/* Info Box */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex gap-4 items-start">
                        <div className="flex-shrink-0">
                            <span className="material-symbols-outlined text-primary text-[24px]">info</span>
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-primary mb-2">
                                Informasi Pengajuan Surat
                            </h3>
                            <ul className="text-[13px] text-slate-600 space-y-2 list-none p-0">
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-primary/50 mt-0.5">check_circle</span>
                                    Pastikan data yang Anda isi sudah benar dan lengkap sebelum menekan tombol submit.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-primary/50 mt-0.5">check_circle</span>
                                    Surat yang disubmit akan langsung masuk ke antrean proses approval oleh tim internal mall.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-primary/50 mt-0.5">check_circle</span>
                                    Anda dapat membatalkan surat kapan saja selama statusnya masih dalam proses approval.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
